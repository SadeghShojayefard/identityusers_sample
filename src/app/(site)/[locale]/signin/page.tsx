import '@/style/site/signIn/signIn.css'
import LoginForm from "@/components/site/signIn/LoginForm";
import SignUpForm from "@/components/site/signIn/SignUpForm";
import { requireGuest } from '@/identityuser/lib/authGuard';
import LoginOTPForm from '@/components/site/signIn/LoginOTPForm';


export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    await requireGuest(`/${locale}`);



    return (
        <>
            <div className=" w-full h-[calc(100vh-65px)] flex flex-col md:flex-row">
                <SignUpForm />
                <div className='w-full h-[calc(100vh-65px)] flex flex-col '>
                    <div className='h-full w-full flex flex-row items-center justify-center'>
                        <LoginForm />
                    </div>
                    <div className='h-full  w-full flex flex-row items-center justify-center'>
                        <LoginOTPForm />
                    </div>
                </div>
            </div>
        </>
    );
}
