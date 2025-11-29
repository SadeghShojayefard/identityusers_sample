import UsersAddForm from "@/components/admin/users/usersAddForm/UsersAddForm";
import { getClaimsAction } from "@/identityuser/helper/claimsAction";
import { getRolesForAddUserAction } from "@/identityuser/helper/roleAction";

export default async function addUsersPage() {

    const Claims = await getClaimsAction();
    const roles = (await getRolesForAddUserAction()).payload;

    return (
        <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
            <UsersAddForm claims={[...Claims.payload]} roles={[...roles]} />
        </div>

    );
}

