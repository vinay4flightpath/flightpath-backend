export interface AuthenticatedUser {
    id: string;
    personId: string;
    email: string;
    isSuperAdmin: boolean;
    flightpathId: string;
    firstName: string;
    lastName: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
