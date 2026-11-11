import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { TenantRole, MembershipStatus } from '@prisma/client';

@Injectable()
export class TenantAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated.');
    }

    // SuperAdmin has unconditional tenant administration rights
    if (user.isSuperAdmin) {
      return true;
    }

    // Extract tenant ID from route params or header
    const tenantId =
      request.params.tenantId ||
      request.params.id ||
      request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('Target tenant ID was not specified.');
    }

    // Verify active membership with ADMIN role
    const membership = await this.prisma.tenantMembership.findUnique({
      where: {
        personId_tenantId: {
          personId: user.personId,
          tenantId: tenantId,
        },
      },
      include: {
        roles: true,
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException(
        'You are not an active member of this tenant.',
      );
    }

    const hasAdminRole = membership.roles.some(
      (r) => r.role === TenantRole.ADMIN,
    );

    if (!hasAdminRole) {
      throw new ForbiddenException(
        'Tenant Admin privileges required for this operation.',
      );
    }

    request.tenantMembership = membership;
    return true;
  }
}
