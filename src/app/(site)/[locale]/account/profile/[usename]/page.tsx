"use server"
import UserInfo from "@/components/account/profile/userInfo/UserInfo";
import ChangePassword from "@/components/account/profile/changePassword/ChangePassword";
import ChangeName from "@/components/account/profile/changeName/ChangeName";
import { requireAuth } from "@/identityuser/lib/authGuard";
import { getCurrentCCSAction } from "@/identityuser/helper/userAction";
import Varification from "@/components/account/profile/varification/Varification";


export default async function AccountProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const session = await requireAuth(`/${locale}`);
    const ccsDate = await getCurrentCCSAction(session?.user.username!);
    return (

        <div className="w-full  flex flex-col justify-start items-center gap-2  text-start  pb-5  ">
            {
                !session.user.passwordExpire &&
                (
                    <>

                        <UserInfo username={session.user.username} name={session.user.name} email={session.user.email} phoneNumber={session.user.phoneNumber} />
                        <Varification
                            id={session.user.id}
                            email={session.user.email}
                            phoneNumber={session.user.phoneNumber}
                            emailConfirmed={session.user.emailConfirmed}
                            phoneNumberConfirmed={session.user.phoneNumberConfirmed}
                            twoFactorEnabled={session.user.twoFactorEnabled}
                        />
                        <ChangeName
                            username={session?.user.username!}
                            name={session?.user.name!}
                            locale={locale}
                            ccs={ccsDate.data.ccs}
                        />
                    </>
                )

            }
            <b className="font-extrabold text-2xl text-black text-shadow-xs text-shadow-black text-start w-full border-b">Password is expire</b>
            <ChangePassword
                username={session?.user.username!}
                passwordExpire={session.user.passwordExpire}
            />
        </div>

    );
}
