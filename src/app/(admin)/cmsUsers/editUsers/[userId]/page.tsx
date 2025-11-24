import UsersEditForm from "@/components/admin/users/usersEditForm/UsersEditForm";
import { userEditType } from "@/Type/UserEditType.type";
import { get } from "http";
import { getClaimsAction } from "@/identityUser/helper/claimsAction";
import { getUserByIdAction } from "@/identityUser/helper/userAction";
import { getRolesForAddUserAction } from "@/identityUser/helper/roleAction";

export default async function editUsersPage({ params }: { params: Promise<{ userId: string }> }) {


    const { userId } = await params;
    const roles = (await getRolesForAddUserAction()).payload;
    const Claims = await getClaimsAction();
    const user = (await getUserByIdAction(userId)).payload;


    return (
        <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
            <UsersEditForm claims={[...Claims.payload]} roles={[...roles]} user={user as userEditType} />
        </div>

    );
}


