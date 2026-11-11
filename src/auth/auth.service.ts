import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { MembershipStatus, PersonStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const userAccount = await this.prisma.userAccount.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        person: {
          include: {
            memberships: {
              where: { status: MembershipStatus.ACTIVE },
              include: {
                tenant: true,
                roles: true,
              },
            },
          },
        },
      },
    });

    if (!userAccount) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!userAccount.isActive) {
      throw new UnauthorizedException(
        'Your account is deactivated or your invitation has not been accepted yet.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userAccount.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Update last login timestamp
    await this.prisma.userAccount.update({
      where: { id: userAccount.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens({
      sub: userAccount.id,
      personId: userAccount.personId,
      email: userAccount.email,
      isSuperAdmin: userAccount.isSuperAdmin,
    });

    const formattedTenants = userAccount.person.memberships.map((m) => ({
      membershipId: m.id,
      tenantId: m.tenant.id,
      tenantName: m.tenant.name,
      tenantCode: m.tenant.code,
      status: m.status,
      roles: m.roles.map((r) => r.role),
    }));

    return {
      ...tokens,
      user: {
        id: userAccount.id,
        personId: userAccount.personId,
        email: userAccount.email,
        flightpathId: userAccount.person.flightpathId,
        firstName: userAccount.person.firstName,
        lastName: userAccount.person.lastName,
        isSuperAdmin: userAccount.isSuperAdmin,
      },
      tenants: formattedTenants,
    };
  }

  async getProfile(userAccountId: string) {
    const userAccount = await this.prisma.userAccount.findUnique({
      where: { id: userAccountId },
      include: {
        person: {
          include: {
            memberships: {
              where: { status: MembershipStatus.ACTIVE },
              include: {
                tenant: true,
                roles: true,
              },
            },
          },
        },
      },
    });

    if (!userAccount) {
      throw new NotFoundException('User profile not found.');
    }

    const formattedTenants = userAccount.person.memberships.map((m) => ({
      membershipId: m.id,
      tenantId: m.tenant.id,
      tenantName: m.tenant.name,
      tenantCode: m.tenant.code,
      status: m.status,
      roles: m.roles.map((r) => r.role),
    }));

    return {
      user: {
        id: userAccount.id,
        personId: userAccount.personId,
        email: userAccount.email,
        flightpathId: userAccount.person.flightpathId,
        firstName: userAccount.person.firstName,
        lastName: userAccount.person.lastName,
        isSuperAdmin: userAccount.isSuperAdmin,
      },
      tenants: formattedTenants,
    };
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto) {
    const { token, password } = acceptInviteDto;

    const userAccount = await this.prisma.userAccount.findUnique({
      where: { inviteToken: token },
      include: {
        person: true,
      },
    });

    if (!userAccount) {
      throw new BadRequestException('Invalid or expired invitation token.');
    }

    if (
      userAccount.inviteExpiresAt &&
      userAccount.inviteExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Invitation token has expired. Please ask an administrator to resend.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const updatedAccount = await this.prisma.userAccount.update({
      where: { id: userAccount.id },
      data: {
        passwordHash,
        inviteToken: null,
        inviteExpiresAt: null,
        isActive: true,
        person: {
          update: {
            status: PersonStatus.ACTIVE,
          },
        },
      },
      include: {
        person: {
          include: {
            memberships: {
              include: {
                tenant: true,
                roles: true,
              },
            },
          },
        },
      },
    });

    const tokens = await this.generateTokens({
      sub: updatedAccount.id,
      personId: updatedAccount.personId,
      email: updatedAccount.email,
      isSuperAdmin: updatedAccount.isSuperAdmin,
    });

    return {
      message: 'Account activated successfully.',
      ...tokens,
      user: {
        id: updatedAccount.id,
        personId: updatedAccount.personId,
        email: updatedAccount.email,
        flightpathId: updatedAccount.person.flightpathId,
        firstName: updatedAccount.person.firstName,
        lastName: updatedAccount.person.lastName,
        isSuperAdmin: updatedAccount.isSuperAdmin,
      },
    };
  }

  async refreshToken(refreshTokenString: string) {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'flightpath-development-refresh-secret-2026';
      const payload = this.jwtService.verify(refreshTokenString, {
        secret: refreshSecret,
      });

      const userAccount = await this.prisma.userAccount.findUnique({
        where: { id: payload.sub },
        include: { person: true },
      });

      if (!userAccount || !userAccount.isActive) {
        throw new UnauthorizedException('User account is invalid or inactive.');
      }

      return this.generateTokens({
        sub: userAccount.id,
        personId: userAccount.personId,
        email: userAccount.email,
        isSuperAdmin: userAccount.isSuperAdmin,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  private async generateTokens(payload: {
    sub: string;
    personId: string;
    email: string;
    isSuperAdmin: boolean;
  }) {
    const accessSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'flightpath-development-super-secret-key-2026';
    const accessExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') || '15m';

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'flightpath-development-refresh-secret-2026';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
