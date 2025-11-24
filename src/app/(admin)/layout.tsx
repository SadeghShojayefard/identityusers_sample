import Sidebar from "@/components/admin/sidebar/Sidebar";
import type { Metadata } from "next";
import "../globals.css";
import '@/style/site/signIn/signIn.css'
import SessionWatcher from "@/identityUser/components/sessionWatcher/SessionWatcher";
import AuthProvider from "@/identityUser/providers/SessionProvider";
import { requireAuth } from "@/identityUser/lib/authGuard";




export const metadata: Metadata = {
    title: "Identity",
};

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await requireAuth(`/en`);

    return (
        <html lang="en">
            <body className={` main-bg-color    `}  >
                <AuthProvider>
                    <SessionWatcher locale={"en"} />

                    <div className='flex flex-row bg-colors-white50' >
                        <Sidebar claims={session.user.claims} />
                        <div className='flex flex-col gap-1 w-full'>
                            <div className="w-full min-h-screen flex flex-row items-center justify-start px-3 py-5 shadow-2xl">
                                {children}
                            </div>
                        </div>
                    </div>
                </AuthProvider>

            </body>
        </html>
    );
}
