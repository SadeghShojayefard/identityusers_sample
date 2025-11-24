"use server"
import UserInfo from "@/components/account/profile/userInfo/UserInfo";
import ChangePassword from "@/components/account/profile/changePassword/ChangePassword";
import ChangeName from "@/components/account/profile/changeName/ChangeName";
import { requireAuth } from "@/identityUser/lib/authGuard";
import { getCurrentCCSAction } from "@/identityUser/helper/userAction";

export default async function AccountProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const session = await requireAuth(`/${locale}`);
    const ccsDate = await getCurrentCCSAction(session?.user.username!);

    return (
        <div className="w-full  flex flex-col justify-start items-center gap-2  text-start  pb-5  ">
            <b className="font-extrabold text-2xl text-black text-shadow-xs text-shadow-black text-start w-full border-b">Profile</b>
            <UserInfo />

            <ChangeName
                username={session?.user.username!}
                name={session?.user.name!}
                locale={locale}
                ccs={ccsDate.data.ccs}
            />

            <ChangePassword
                username={session?.user.username!}
            />
        </div>

    );
}
