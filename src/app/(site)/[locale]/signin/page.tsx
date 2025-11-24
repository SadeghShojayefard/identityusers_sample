import '@/style/site/signIn/signIn.css'
import LoginForm from "@/components/site/signIn/LoginForm";
import SignUpForm from "@/components/site/signIn/SignUpForm";
import { requireGuest } from '@/identityUser/lib/authGuard';
import AuthProvider from '@/identityUser/providers/SessionProvider';
import SessionWatcher from '@/identityUser/components/sessionWatcher/SessionWatcher';


export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    await requireGuest(`/${locale}`);



    return (
        <>
            <AuthProvider>
                <SessionWatcher locale={"en"} />
            </AuthProvider>
            <div className="relative w-full h-[calc(100vh-65px)] flex">



                <SignUpForm />
                <LoginForm />


            </div>
        </>
    );
}
