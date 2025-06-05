export enum UserRole {
    ADMIN = 'Admin',
    USER = 'User'
}

export interface User {
    userId: string;
    email: string;
    role: UserRole
}
