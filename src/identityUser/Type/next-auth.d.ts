// types/next-auth.d.ts
import { NextAuth, DefaultSession } from 'next-auth';

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
            name: string;
            email: string;
            phoneNumber: string;
            avatar: string;
            roles?: string[];
            securityStamp: string;
            claims?: string[];
            emailConfirmed: boolean;
            phoneNumberConfirmed: boolean;
            twoFactorEnabled: boolean;
        };
        expire?: string;
    }

    interface User {
        id: string;
        username: string;
        name: string;
        email: string;
        phoneNumber: string;
        avatar: string;
        roles?: string[];
        securityStamp: string;
        claims?: string[];
        emailConfirmed: boolean;
        phoneNumberConfirmed: boolean;
        twoFactorEnabled: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        name: string;
        email: string;
        phoneNumber: string;
        avatar: string;
        roles?: string[];
        securityStamp: string;
        claims?: string[];
        emailConfirmed: boolean;
        phoneNumberConfirmed: boolean;
        twoFactorEnabled: boolean;
        lastSync?: number;


    }
}
