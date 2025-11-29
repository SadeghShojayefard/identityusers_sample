import { getServerSession } from "next-auth";
import { options } from "@/identityuser/api/auth/[...nextauth]/options";

export async function getSession() {
    return await getServerSession(options);
}

// Check if a specific claim exists
export async function hasClaim(claim: string): Promise<boolean> {
    const session = await getSession();
    return session?.user?.claims?.includes(claim) ?? false;
}

// Check if a specific role exists
export async function hasRole(role: string): Promise<boolean> {
    const session = await getSession();
    return session?.user?.roles?.includes(role) ?? false;
}

// Check if user has at least one claim
export async function hasAnyClaim(): Promise<boolean> {
    const session = await getSession();
    return !!(session?.user?.claims?.length);
}

// Check if user has at least one role
export async function hasAnyRole(): Promise<boolean> {
    const session = await getSession();
    return !!(session?.user?.roles?.length);
}
