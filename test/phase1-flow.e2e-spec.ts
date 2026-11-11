import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Phase 1 Core Multi-Tenancy & Identity E2E Flow', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let createdPersonId: string;
  let createdTenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Step 1: SuperAdmin logs in and receives JWT with isSuperAdmin=true', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'vinay@flightpath-training.com',
        password: '123456',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('vinay@flightpath-training.com');
    expect(res.body.data.user.isSuperAdmin).toBe(true);

    superAdminToken = res.body.data.accessToken;
  });

  it('Step 2: SuperAdmin creates a Person without roles or tenants', async () => {
    const uniqueEmail = `pilot.${Date.now()}@flightpath.local`;

    const res = await request(app.getHttpServer())
      .post('/api/people')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        firstName: 'Marcus',
        lastName: 'Vance',
        email: uniqueEmail,
        phone: '+1 555-0142',
        sendInvite: true,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.flightpathId).toMatch(/^FP-\d{4}-\d{5}$/);
    expect(res.body.data.firstName).toBe('Marcus');
    expect(res.body.data.lastName).toBe('Vance');
    expect(res.body.data.inviteUrl).toBeDefined();

    createdPersonId = res.body.data.id;
  });

  it('Step 3: SuperAdmin creates a Tenant', async () => {
    const uniqueCode = `ATO-${Date.now()}`;

    const res = await request(app.getHttpServer())
      .post('/api/tenants')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'SkyWings Aviation Academy',
        code: uniqueCode,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('SkyWings Aviation Academy');
    expect(res.body.data.code).toBe(uniqueCode);

    createdTenantId = res.body.data.id;
  });

  it('Step 4A: SuperAdmin adds existing Person to Tenant with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/tenants/${createdTenantId}/members`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        personId: createdPersonId,
        roles: ['ADMIN'],
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.tenantId).toBe(createdTenantId);
    expect(res.body.data.personId).toBe(createdPersonId);
    expect(res.body.data.roles.some((r: any) => r.role === 'ADMIN')).toBe(true);
  });

  it('Step 4B: SuperAdmin adds a new member on-the-fly with INSTRUCTOR & STUDENT roles', async () => {
    const uniqueEmail = `flyer.${Date.now()}@onthefly.local`;

    const res = await request(app.getHttpServer())
      .post(`/api/tenants/${createdTenantId}/members/quick-create`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        firstName: 'Elena',
        lastName: 'Rostova',
        email: uniqueEmail,
        phone: '+44 7700 900077',
        roles: ['INSTRUCTOR', 'STUDENT'],
        sendInvite: true,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.isNewPerson).toBe(true);
    expect(res.body.data.membership.roles.length).toBe(2);
  });

  it('Step 5: Query tenant members and verify assigned roles', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/tenants/${createdTenantId}/members`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);

    const adminMember = res.body.data.find(
      (m: any) => m.person.id === createdPersonId,
    );
    expect(adminMember).toBeDefined();
    expect(adminMember.roles).toContain('ADMIN');
  });

  it('Step 6: SuperAdmin searches people directory across the system', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/people?search=Marcus')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.data[0].firstName).toBe('Marcus');
  });

  it('Step 7: Invited Person accepts invitation, sets password, and logs in', async () => {
    // 1. Fetch the person created in Step 2 to obtain their invite token
    const personRes = await request(app.getHttpServer())
      .get(`/api/people/${createdPersonId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    const inviteToken = personRes.body.data.userAccount.inviteToken;
    expect(inviteToken).toBeDefined();

    // 2. Accept invite and set new password
    const acceptRes = await request(app.getHttpServer())
      .post('/api/auth/accept-invite')
      .send({
        token: inviteToken,
        password: 'MarcusPassword2026!',
      })
      .expect(200);

    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.data.accessToken).toBeDefined();

    // 3. Log in with the newly established credentials
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: personRes.body.data.email,
        password: 'MarcusPassword2026!',
      })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.isSuperAdmin).toBe(false);
    expect(loginRes.body.data.tenants.length).toBe(1);
    expect(loginRes.body.data.tenants[0].tenantId).toBe(createdTenantId);
    expect(loginRes.body.data.tenants[0].roles).toContain('ADMIN');
  });
});
