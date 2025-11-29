
import '@/style/site/signIn/signIn.css'
import AccountSidebar from "@/components/account/sideBar/SideBar";
import { requireAuth } from '@/identityuser/lib/authGuard';
import AuthProvider from '@/identityuser/providers/SessionProvider';
import SessionWatcher from '@/identityuser/components/sessionWatcher/SessionWatcher';



export default async function AccountLayout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
    const { locale } = await params;


    const session = await requireAuth(`/${locale}`);
    return (
        <>
            <AuthProvider>
                <SessionWatcher locale={locale} />
                <div className="flex flex-row justify-start items-center  my-20  rounded-2xl 
        shadow-2xl shadow-black bg-white/30 backdrop-blur-md  ">
                    <div className="grid grid-cols-10 w-full  rounded-2xl gap-2 ">
                        {session === null ? (null) :
                            (
                                <>
                                    <AccountSidebar locale={locale}
                                        avatar={session.user.avatar} username={session.user.username} roles={session.user.roles} />

                                    <div className="sm:col-span-10 md:col-span-9   flex flex-col justify-start items-center   w-full rounded-2xl p-2">
                                        {children}

                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
            </AuthProvider >
        </>
    );
}


