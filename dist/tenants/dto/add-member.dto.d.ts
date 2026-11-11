import { TenantRole } from '@prisma/client';
export declare class AddExistingMemberDto {
    personId: string;
    roles: TenantRole[];
}
export declare class QuickCreateMemberDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    roles: TenantRole[];
    sendInvite?: boolean;
}
export declare class UpdateMemberRolesDto {
    roles: TenantRole[];
}
