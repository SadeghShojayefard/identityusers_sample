import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import identityUser_users from '@/identityuser/lib/models/identityUser_users';
import { comparePassword } from '@/identityuser/helper/sharedFunction';
import dbConnect from '@/identityuser/lib/db';
import { getUserByUsernameForSessionAction } from '@/identityuser/helper/userAction';

export const options: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { username, password } = credentials;

                await dbConnect();
                const user = await getUserByUsernameForSessionAction(username);

                if (!user) return null;
                const userData = user.payload;

                if (!userData?.password) return null;

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
                const freshUser = (await getUserByUsernameForSessionAction(token.username)).payload;

                if (freshUser) {
                    token.roles = freshUser.roles;
                    token.claims = freshUser.claims;
                    token.securityStamp = freshUser.securityStamp;
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



            const freshUser = (await getUserByUsernameForSessionAction(user.username)).payload;

            // ------------------------------------------
            // Compare roles
            // ------------------------------------------
            if (freshUser?.roles) {
                const currentRoles = [...(token.roles || [])].sort();
                const newRoles = [...freshUser.roles].sort();

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
            if (freshUser?.claims) {
                const currentClaims = [...(token.claims || [])].sort();
                const newClaims = [...freshUser.claims].sort();

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
            };
            return session;
        },

    }
};


