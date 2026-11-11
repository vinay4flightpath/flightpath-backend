import { TenantStatus } from '@prisma/client';
export declare class CreateTenantDto {
    name: string;
    code: string;
    status?: TenantStatus;
}
export declare class UpdateTenantDto {
    name?: string;
    status?: TenantStatus;
}
