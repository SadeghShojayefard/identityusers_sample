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
<<<<<<< HEAD
            rememberMe: boolean;
            loginAt: Date;
            passwordExpire: Boolean;
        };
        expires: string;
=======
        };
        expire?: string;
>>>>>>> be9c483b74454327489f9e0de268e1c6b4423d09
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
        rememberMe: boolean;
        passwordExpire: Boolean;
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
        rememberMe: boolean;
        passwordExpire: Boolean;
        lastSync?: number;
    }
}
