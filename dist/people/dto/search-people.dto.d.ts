import { PersonStatus } from '@prisma/client';
export declare class UpdatePersonDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: PersonStatus;
}
export declare class SearchPeopleDto {
    search?: string;
    page?: number;
    limit?: number;
}
