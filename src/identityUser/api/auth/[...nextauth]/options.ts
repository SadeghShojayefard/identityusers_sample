import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import identityUser_users from '@/identityuser/lib/models/identityUser_users';
import { checkPasswordExpire, comparePassword } from '@/identityuser/helper/sharedFunction';
import dbConnect from '@/identityuser/lib/db';
import { getUserByPhoneForSessionAction, getUserByUsernameForSessionAction } from '@/identityuser/helper/userAction';
import { hasPayload } from '@/type/actionType.type';
import { getToken } from 'next-auth/jwt';
import { verifyLogin2FACredentialAction, verifyPhoneForCredentialAction, verifyRecoveryCodeCredentialAction } from '@/identityuser/helper/signInAction';


// 7 days for persist session
// const SEVEN_DAYS = 7 * 24 * 60 * 60;


export const options: NextAuthOptions = {
    jwt: {
        maxAge: 7 * 24 * 60 * 60, //seven day
    },
    session: {
        strategy: 'jwt',
        maxAge: 1 * 24 * 60 * 60, // one day
        updateAge: 30 * 60, // 30 minutes
    },
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
                rememberMe: { label: "Remember Me", type: "checkbox" },

            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { username, password } = credentials;

                const rememberMe =
                    credentials.rememberMe === "true" ||
                    credentials.rememberMe === "on";
                await dbConnect();
                const user = await getUserByUsernameForSessionAction(username);

                if (!user) return null;

                if (!hasPayload(user) || user.status === "error") { return null }

                const userData = user.payload;


                if (!userData?.password) return null;

                const expired = await checkPasswordExpire(userData.passwordLastChanged);

                const isValid = await comparePassword(password, userData.password);
                if (!isValid) return null;

                return {
                    id: userData.id,
                    username: userData.username,
                    name: userData.name,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    avatar: userData.avatar,
                    securityStamp: userData.securityStamp,
                    roles: userData.roles ?? [],
                    claims: userData.claims ?? [],
                    emailConfirmed: userData.emailConfirmed,
                    phoneNumberConfirmed: userData.phoneNumberConfirmed,
                    twoFactorEnabled: userData.twoFactorEnabled,
                    rememberMe: expired ? false : rememberMe,
                    passwordExpire: expired
                };
            },
        }),
        CredentialsProvider({
            id: "Credentials_2FA",
            name: 'Credentials_2FA',
            credentials: {
                username: { label: 'username', type: 'text' },
                rememberMe: { label: "Remember Me", type: "checkbox" },
                token: { label: "Token", type: "text" },
                emailOrOTP: { label: "email Or OTP", type: "checkbox" },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                const { username, token } = credentials;
                const rememberMe =
                    credentials.rememberMe === "true" ||
                    credentials.rememberMe === "on";

                const emailOrOTP =
                    credentials.emailOrOTP === "true" ||
                    credentials.emailOrOTP === "on";

                const isVerify = await verifyLogin2FACredentialAction(username, token, rememberMe, emailOrOTP);

                if (isVerify.status === "error") {
                    throw new Error(isVerify.payload.message);
                }

                await dbConnect();

                const user = await getUserByUsernameForSessionAction(username);

                if (user.status === "error") {
                    throw new Error(user.payload.message);
                }

                if (!hasPayload(user)) {
                    throw new Error("user not find.");
                }

                const userData = user.payload;

                const expired = await checkPasswordExpire(userData.passwordLastChanged);


                return {
                    id: userData.id,
                    username: userData.username,
                    name: userData.name,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    avatar: userData.avatar,
                    securityStamp: userData.securityStamp,
                    roles: userData.roles ?? [],
                    claims: userData.claims ?? [],
                    emailConfirmed: userData.emailConfirmed,
                    phoneNumberConfirmed: userData.phoneNumberConfirmed,
                    twoFactorEnabled: userData.twoFactorEnabled,
                    rememberMe: expired ? false : rememberMe,
                    passwordExpire: expired

                };
            },
        }),
        CredentialsProvider({
            id: "Credentials_Recovery_Code",
            name: 'Credentials_Recovery_Code',
            credentials: {
                username: { label: 'username', type: 'text' },
                token: { label: "Token", type: "text" },
                rememberMe: { label: "Remember Me", type: "checkbox" },

            },
            async authorize(credentials) {
                if (!credentials) return null;

                const { username, token } = credentials;
                const rememberMe =
                    credentials.rememberMe === "true" ||
                    credentials.rememberMe === "on";

                const isVerify = await verifyRecoveryCodeCredentialAction(username, token);

                if (isVerify.status === "error") {
                    throw new Error(isVerify.payload.message);
                }

                await dbConnect();

                const user = await getUserByUsernameForSessionAction(username);

                if (user.status === "error") {
                    throw new Error(user.payload.message);
                }

                if (!hasPayload(user)) {
                    throw new Error("user not find.");
                }

                const userData = user.payload;
                const expired = await checkPasswordExpire(userData.passwordLastChanged);


                return {
                    id: userData.id,
                    username: userData.username,
                    name: userData.name,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    avatar: userData.avatar,
                    securityStamp: userData.securityStamp,
                    roles: userData.roles ?? [],
                    claims: userData.claims ?? [],
                    emailConfirmed: userData.emailConfirmed,
                    phoneNumberConfirmed: userData.phoneNumberConfirmed,
                    twoFactorEnabled: userData.twoFactorEnabled,
                    rememberMe: expired ? false : rememberMe,
                    passwordExpire: expired

                };
            },
        }),
        CredentialsProvider({
            id: "credentials_mobile_otp",
            name: 'Credentials_mobile_otp',
            credentials: {
                phoneNumber: { label: 'phoneNumber', type: 'text' },
                rememberMe: { label: "Remember Me", type: "checkbox" },
                otp: { label: 'otp', type: 'text' }
            },

            async authorize(credentials) {
                if (!credentials) return null;
                const { phoneNumber, otp } = credentials;
                const rememberMe =
                    credentials.rememberMe === "true" ||
                    credentials.rememberMe === "on";

                const isVerify = await verifyPhoneForCredentialAction(phoneNumber, otp);

                if (isVerify.status === "error") {
                    throw new Error(isVerify.payload.message);
                }



                await dbConnect();

                const user = await getUserByPhoneForSessionAction(phoneNumber);

                if (user.status === "error") {
                    throw new Error(user.payload.message);
                }

                if (!hasPayload(user)) {
                    throw new Error("user not find.");
                }

                const userData = user.payload;
                const expired = await checkPasswordExpire(userData.passwordLastChanged);


                return {
                    id: userData.id,
                    username: userData.username,
                    name: userData.name,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    avatar: userData.avatar,
                    securityStamp: userData.securityStamp,
                    roles: userData.roles ?? [],
                    claims: userData.claims ?? [],
                    emailConfirmed: userData.emailConfirmed,
                    phoneNumberConfirmed: userData.phoneNumberConfirmed,
                    twoFactorEnabled: userData.twoFactorEnabled,
                    rememberMe: expired ? false : rememberMe,
                    passwordExpire: expired

                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.name = user.name;
                token.email = user.email;
                token.phoneNumber = user.phoneNumber;
                token.avatar = user.avatar;
                token.roles = user.roles;
                token.securityStamp = user.securityStamp;
                token.claims = user.claims;
                token.emailConfirmed = user.emailConfirmed;
                token.phoneNumberConfirmed = user.phoneNumberConfirmed;
                token.twoFactorEnabled = user.twoFactorEnabled;
                token.lastSync = Date.now();
                token.rememberMe = user.rememberMe;
                token.loginAt = Date.now();
                token.passwordExpire = user.passwordExpire;
            }

            if (trigger === "update" && session?.user) {

                if (session.user.name !== undefined)
                    token.name = session.user.name;

                if (session.user.avatar !== undefined)
                    token.avatar = session.user.avatar;

                if (session.user.roles !== undefined)
                    token.roles = session.user.roles;

                if (session.user.claims !== undefined)
                    token.claims = session.user.claims;

                if (session.user.securityStamp !== undefined)
                    token.securityStamp = session.user.securityStamp;

                if (session.user.emailConfirmed === true) {
                    token.emailConfirmed = true;
                }
                else { token.emailConfirmed = false; }

                if (session.user.phoneNumberConfirmed === true) {
                    token.phoneNumberConfirmed = true;
                }
                else { token.phoneNumberConfirmed = false; }

                if (session.user.twoFactorEnabled === true) {
                    token.twoFactorEnabled = true;
                }
                else { token.twoFactorEnabled = false; }

            }
            //         //  Sync every 30 min
            const SYNC_INTERVAL = 30 * 60 * 1000;

            // If lastSync does not exist or 15 minutes have passed
            if (!token.lastSync || Date.now() - token.lastSync > SYNC_INTERVAL) {

                await dbConnect();

                //Read new user information from the database
                const freshUser = (await getUserByUsernameForSessionAction(token.username));

                if (!freshUser) { }
                else {
                    if (!hasPayload(freshUser) || freshUser.status === "error") { }
                    else {
                        const userData = freshUser.payload;
                        token.roles = userData.roles;
                        token.claims = userData.claims;
                        token.securityStamp = userData.securityStamp;
                    }
                }
                token.lastSync = Date.now();
            }
            return token;
        },

        async session({ session, token }) {

            await dbConnect();
            const user = await identityUser_users.findById(token.id);


            if (!user) {
                //Return an empty session so that next-auth knows the user needs to be logged out.
                return {
                    ...session,
                    user: undefined,
                    expires: new Date(0).toISOString(),
                };
            }

            // If securityStamp had changed
            if (user.securityStamp !== token.securityStamp) {
                return {
                    ...session,
                    user: undefined,
                    expires: new Date(0).toISOString(),
                };
            }



            const freshUser = (await getUserByUsernameForSessionAction(user.username));

            let expired = false;

            if (!freshUser) { }
            else {

                if (!hasPayload(freshUser) || freshUser.status === "error") { }
                else {
                    const userData = freshUser.payload;

                    // ------------------------------------------
                    // Compare roles
                    // ------------------------------------------
                    if (userData?.roles) {
                        const currentRoles = [...(token.roles || [])].sort();
                        const newRoles = [...userData.roles].sort();

                        const rolesChanged =
                            currentRoles.length !== newRoles.length ||
                            currentRoles.some((r, i) => r !== newRoles[i]);

                        if (rolesChanged) {
                            return {
                                ...session,
                                user: undefined,
                                expires: new Date(0).toISOString(),
                            };
                        }
                    }
                    // ------------------------------------------
                    // Compare claims 
                    // ------------------------------------------
                    if (userData?.claims) {
                        const currentClaims = [...(token.claims || [])].sort();
                        const newClaims = [...userData.claims].sort();

                        const claimsChanged =
                            currentClaims.length !== newClaims.length ||
                            currentClaims.some((c, i) => c !== newClaims[i]);

                        if (claimsChanged) {
                            return {
                                ...session,
                                user: undefined,
                                expires: new Date(0).toISOString(),
                            };
                        }
                    }
                }
            }


            session.user = {
                id: token.id as string,
                username: token.username as string,
                name: token.name as string,
                email: token.email as string,
                phoneNumber: token.phoneNumber as string,
                avatar: token.avatar as string,
                roles: token.roles as string[],
                securityStamp: token.securityStamp as string,
                claims: token.claims as string[],
                emailConfirmed: token.emailConfirmed as boolean,
                phoneNumberConfirmed: token.phoneNumberConfirmed as boolean,
                twoFactorEnabled: token.twoFactorEnabled as boolean,
                rememberMe: token.rememberMe as boolean,
                loginAt: token.loginAt as Date,
                passwordExpire: token.passwordExpire as boolean,

            };
            return session;
        },

    },
};



