"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightpathIdGenerator = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FlightpathIdGenerator = class FlightpathIdGenerator {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNextId() {
        const currentYear = new Date().getFullYear();
        const prefix = `FP-${currentYear}-`;
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
};
exports.FlightpathIdGenerator = FlightpathIdGenerator;
exports.FlightpathIdGenerator = FlightpathIdGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlightpathIdGenerator);
//# sourceMappingURL=flightpath-id.generator.js.map