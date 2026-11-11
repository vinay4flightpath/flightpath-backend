import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto, SearchPeopleDto } from './dto/search-people.dto';
export declare class PeopleController {
    private readonly peopleService;
    constructor(peopleService: PeopleService);
    create(createPersonDto: CreatePersonDto): Promise<{
        inviteUrl: string | null;
        userAccount: {
            id: string;
            inviteToken: string | null;
            isSuperAdmin: boolean;
            isActive: boolean;
            lastLoginAt: Date | null;
            inviteExpiresAt: Date | null;
        } | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PersonStatus;
        flightpathId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
    }>;
    findAll(query: SearchPeopleDto): Promise<{
        data: {
            id: string;
            flightpathId: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.PersonStatus;
            createdAt: Date;
            userAccount: {
                id: string;
                inviteToken: string | null;
                isSuperAdmin: boolean;
                isActive: boolean;
                lastLoginAt: Date | null;
            } | null;
            memberships: {
                tenantId: string;
                tenantName: string;
                tenantCode: string;
                roles: import(".prisma/client").$Enums.TenantRole[];
            }[];
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        memberships: {
            membershipId: string;
            tenantId: string;
            tenantName: string;
            tenantCode: string;
            status: import(".prisma/client").$Enums.MembershipStatus;
            roles: import(".prisma/client").$Enums.TenantRole[];
        }[];
        userAccount: {
            id: string;
            inviteToken: string | null;
            isSuperAdmin: boolean;
            isActive: boolean;
            lastLoginAt: Date | null;
            inviteExpiresAt: Date | null;
        } | null;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PersonStatus;
        flightpathId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
    }>;
    update(id: string, updatePersonDto: UpdatePersonDto): Promise<{
        userAccount: {
            email: string;
            id: string;
            personId: string;
            inviteToken: string | null;
            passwordHash: string;
            isSuperAdmin: boolean;
            isActive: boolean;
            lastLoginAt: Date | null;
            inviteExpiresAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PersonStatus;
        flightpathId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
    }>;
    generateInvite(id: string): Promise<{
        message: string;
        inviteToken: string;
        inviteExpiresAt: Date;
        inviteUrl: string;
    }>;
}
