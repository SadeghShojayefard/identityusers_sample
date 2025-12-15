import { requireAuth } from "@/identityuser/lib/authGuard";
import { redirect } from "next/navigation";



export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string, username: string }> }) {

    const { locale, username } = await params;
    const session = await requireAuth(`/${locale}`);

    if (session.user.passwordExpire) {
        redirect(`/en/account/profile/${username}`);
    }
    return (
        <div className="h-fit w-full flex flex-row items-center justify-center " >
            <p className="text-center">
                Account Order Page
            </p>
        </div>

    );
}
