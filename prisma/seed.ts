import { PrismaClient, PersonStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail =
    process.env.SUPERADMIN_EMAIL || 'vinay@flightpath-training.com';
  const superAdminPassword =
    process.env.SUPERADMIN_PASSWORD || '123456';

  console.log('🌱 Starting database seed...');

  // Check if a SuperAdmin already exists
  const existingSuperAdmin = await prisma.userAccount.findFirst({
    where: { isSuperAdmin: true },
  });

  if (existingSuperAdmin) {
    console.log(
      `ℹ️  SuperAdmin already exists with email: ${existingSuperAdmin.email}. Skipping creation.`,
    );
    return;
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);

  // Create Person and linked UserAccount
  const superAdminPerson = await prisma.person.create({
    data: {
      flightpathId: 'FP-ADMIN-00001',
      firstName: 'Super',
      lastName: 'Administrator',
      email: superAdminEmail,
      status: PersonStatus.ACTIVE,
      userAccount: {
        create: {
          email: superAdminEmail,
          passwordHash: passwordHash,
          isSuperAdmin: true,
          isActive: true,
        },
      },
    },
    include: {
      userAccount: true,
    },
  });

  console.log('✅ SuperAdmin bootstrapped successfully:');
  console.log(`   • Flightpath ID : ${superAdminPerson.flightpathId}`);
  console.log(`   • Email         : ${superAdminPerson.email}`);
  console.log(`   • Default Pass  : ${superAdminPassword}`);
  console.log(
    '   ⚠️  Please change the default password after first login in production!',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
