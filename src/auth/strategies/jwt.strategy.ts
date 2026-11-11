import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userAccountId
  personId: string;
  email: string;
  isSuperAdmin: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'flightpath-development-super-secret-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const userAccount = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      include: {
        person: true,
      },
    });

    if (!userAccount || !userAccount.isActive) {
      throw new UnauthorizedException('User account is inactive or does not exist.');
    }

    return {
      id: userAccount.id,
      personId: userAccount.personId,
      email: userAccount.email,
      isSuperAdmin: userAccount.isSuperAdmin,
      flightpathId: userAccount.person.flightpathId,
      firstName: userAccount.person.firstName,
      lastName: userAccount.person.lastName,
    };
  }
}
