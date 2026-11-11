import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            personId: string;
            email: string;
            flightpathId: string;
            firstName: string;
            lastName: string;
            isSuperAdmin: boolean;
        };
        tenants: {
            membershipId: string;
            tenantId: string;
            tenantName: string;
            tenantCode: string;
            status: import(".prisma/client").$Enums.MembershipStatus;
            roles: import(".prisma/client").$Enums.TenantRole[];
        }[];
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userAccountId: string): Promise<{
        user: {
            id: string;
            personId: string;
            email: string;
            flightpathId: string;
            firstName: string;
            lastName: string;
            isSuperAdmin: boolean;
        };
        tenants: {
            membershipId: string;
            tenantId: string;
            tenantName: string;
            tenantCode: string;
            status: import(".prisma/client").$Enums.MembershipStatus;
            roles: import(".prisma/client").$Enums.TenantRole[];
        }[];
    }>;
    acceptInvite(acceptInviteDto: AcceptInviteDto): Promise<{
        user: {
            id: string;
            personId: string;
            email: string;
            flightpathId: string;
            firstName: string;
            lastName: string;
            isSuperAdmin: boolean;
        };
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    refreshToken(refreshTokenString: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
}
