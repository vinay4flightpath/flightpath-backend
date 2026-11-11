import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FlightpathIdGenerator {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a collision-resistant sequential Flightpath ID.
   * Format: FP-YYYY-XXXXX (e.g. FP-2026-00001)
   */
  async generateNextId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `FP-${currentYear}-`;

    // Find the latest person created with the current year's prefix
    const latestPerson = await this.prisma.person.findFirst({
      where: {
        flightpathId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        flightpathId: 'desc',
      },
      select: {
        flightpathId: true,
      },
    });

    let nextNumber = 1;
    if (latestPerson && latestPerson.flightpathId) {
      const parts = latestPerson.flightpathId.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          nextNumber = lastSeq + 1;
        }
      }
    }

    const paddedNumber = String(nextNumber).padStart(5, '0');
    return `${prefix}${paddedNumber}`;
  }
}
