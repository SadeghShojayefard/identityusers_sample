import '@/style/site/signIn/signIn.css'
import { requireGuest } from '@/identityuser/lib/authGuard';
import AuthProvider from '@/identityuser/providers/SessionProvider';
import SessionWatcher from '@/identityuser/components/sessionWatcher/SessionWatcher';
import TwoFAForm from '@/components/site/signIn/TwoFAForm';
import RecoveryCodeForm from '@/components/site/signIn/RecoveryCodeForm';


export default async function TwoStepPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    await requireGuest(`/en`);



    return (
        <>
            <div className="relative w-full h-[calc(100vh-65px)] flex flex-col items-center justify-evenly">

                <TwoFAForm username={username} />

                <RecoveryCodeForm username={username} />
            </div>
        </>
    );
}
