import '@/style/site/signIn/signIn.css'
import { requireGuest } from '@/identityuser/lib/authGuard';
import AuthProvider from '@/identityuser/providers/SessionProvider';
import SessionWatcher from '@/identityuser/components/sessionWatcher/SessionWatcher';
import ResetPasswordForm from '@/components/site/signIn/ResetPasswordForm';


export default async function resetPasswordPage({ params }: { params: Promise<{ locale: string, token: string }> }) {
    const { locale, token } = await params;

    await requireGuest(`/${locale}`);



    return (
        <>
            <div className="relative w-full h-[calc(100vh-65px)] flex">

                <ResetPasswordForm token={token} />

            </div>
        </>
    );
}
