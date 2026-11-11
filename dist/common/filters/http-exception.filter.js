"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorCode = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'object' && 'message' in res ? res.message : res;
            errorCode = 'HTTP_ERROR';
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002': {
                    status = common_1.HttpStatus.CONFLICT;
                    const target = exception.meta?.target?.join(', ') || 'field';
                    message = `Unique constraint violation on ${target}. A record with this value already exists.`;
                    errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
                    break;
                }
                case 'P2025': {
                    status = common_1.HttpStatus.NOT_FOUND;
                    message = 'The requested record was not found.';
                    errorCode = 'RECORD_NOT_FOUND';
                    break;
                }
                case 'P2003': {
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint failed.';
                    errorCode = 'FOREIGN_KEY_VIOLATION';
                    break;
                }
                default: {
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = `Database query error: ${exception.message}`;
                    errorCode = `PRISMA_${exception.code}`;
                }
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Unhandled Error: ${exception.message}`, exception.stack);
        }
        response.status(status).json({
            success: false,
            statusCode: status,
            errorCode,
            error: Array.isArray(message) ? message : [message],
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map