import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import { AddExistingMemberDto, QuickCreateMemberDto, UpdateMemberRolesDto } from './dto/add-member.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TenantStatus;
        name: string;
        code: string;
    }>;
    findAll(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
        updatedAt: Date;
        totalMembers: number;
        adminCount: number;
        instructorCount: number;
        studentCount: number;
    }[] | {
        id: string;
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
        membershipId: string;
        roles: import(".prisma/client").$Enums.TenantRole[];
    }[]>;
    findById(id: string): Promise<{
        _count: {
            memberships: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TenantStatus;
        name: string;
        code: string;
    }>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TenantStatus;
        name: string;
        code: string;
    }>;
    getMembers(tenantId: string): Promise<{
        membershipId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.MembershipStatus;
        joinedAt: Date;
        roles: import(".prisma/client").$Enums.TenantRole[];
        person: {
            id: string;
            flightpathId: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.PersonStatus;
            userAccount: {
                id: string;
                inviteToken: string | null;
                isActive: boolean;
                lastLoginAt: Date | null;
            } | null;
        };
    }[]>;
    addExistingMember(tenantId: string, dto: AddExistingMemberDto): Promise<({
        person: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PersonStatus;
            flightpathId: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        roles: {
            id: string;
            tenantMembershipId: string;
            role: import(".prisma/client").$Enums.TenantRole;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        personId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MembershipStatus;
        tenantId: string;
        joinedAt: Date;
    }) | null>;
    quickCreateMember(tenantId: string, dto: QuickCreateMemberDto): Promise<{
        message: string;
        isNewPerson: boolean;
        inviteUrl: string | null;
        membership: ({
            person: {
                email: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PersonStatus;
                flightpathId: string;
                firstName: string;
                lastName: string;
                phone: string | null;
            };
            roles: {
                id: string;
                tenantMembershipId: string;
                role: import(".prisma/client").$Enums.TenantRole;
                assignedAt: Date;
            }[];
        } & {
            id: string;
            personId: string;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.MembershipStatus;
            tenantId: string;
            joinedAt: Date;
        }) | null;
    }>;
    updateMemberRoles(tenantId: string, memberId: string, dto: UpdateMemberRolesDto): Promise<({
        person: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PersonStatus;
            flightpathId: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        roles: {
            id: string;
            tenantMembershipId: string;
            role: import(".prisma/client").$Enums.TenantRole;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        personId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MembershipStatus;
        tenantId: string;
        joinedAt: Date;
    }) | null>;
    removeMember(tenantId: string, memberId: string): Promise<{
        message: string;
    }>;
}
