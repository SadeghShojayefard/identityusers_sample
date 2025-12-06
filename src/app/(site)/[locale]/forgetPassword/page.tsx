import '@/style/site/signIn/signIn.css'
import { requireGuest } from '@/identityuser/lib/authGuard';
import AuthProvider from '@/identityuser/providers/SessionProvider';
import SessionWatcher from '@/identityuser/components/sessionWatcher/SessionWatcher';
import ForgetForm from '@/components/site/signIn/ForgetForm';


export default async function ForgetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    await requireGuest(`/${locale}`);



    return (
        <>

            <div className="relative w-full h-[calc(100vh-65px)] flex">

                <ForgetForm />


            </div>
        </>
    );
}
