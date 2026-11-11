import { PrismaService } from '../../prisma/prisma.service';
export declare class FlightpathIdGenerator {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateNextId(): Promise<string>;
}
