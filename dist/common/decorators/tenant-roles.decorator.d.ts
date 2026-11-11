import { TenantRole } from '@prisma/client';
export declare const TENANT_ROLES_KEY = "tenant_roles";
export declare const RequireTenantRoles: (...roles: TenantRole[]) => import("@nestjs/common").CustomDecorator<string>;
