import NextAuth, { getServerSession, AuthOptions } from "next-auth";
import { options } from "@/identityuser/api/auth/[...nextauth]/options";

export const getSession = () => getServerSession(options);

export const signIn = async (provider: string, data: any) => {
    const { signIn } = await import("next-auth/react");
    return signIn(provider, data);
};

export const auth = () => NextAuth(options);