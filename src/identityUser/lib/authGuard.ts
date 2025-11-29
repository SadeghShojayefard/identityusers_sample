import { getServerSession } from "next-auth";
import { options } from "@/identityuser/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";


// if user is login redirect it to target page
export async function requireGuest(redirectTo: string = "/en") {
    const session = await getServerSession(options);


    if (session?.user) {
        redirect(redirectTo);
    }

    return null;
}

// if user is not login redirect it to target page| 
export async function requireAuth(redirectTo: string = "/en") {
    let session = null;
    try {
        session = await getServerSession(options);

        if (!session?.user === null || !session?.user === undefined) {
            redirect(redirectTo);
        }
        if (!session?.user?.username) {
            redirect(redirectTo);

        }
        if (!session?.user?.username) {
            redirect(redirectTo);
        }

        if (session?.user?.roles === null) {
            redirect(redirectTo);
        }

    } catch (err) {
        redirect(`/en`);
    }
    return session;
}
