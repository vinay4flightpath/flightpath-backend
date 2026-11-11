import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto, RefreshTokenDto } from './dto/accept-invite.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: AuthenticatedUser): Promise<{
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
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
