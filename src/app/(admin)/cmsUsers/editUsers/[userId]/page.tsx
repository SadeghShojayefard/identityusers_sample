import UsersEditForm from "@/components/admin/users/usersEditForm/UsersEditForm";
import { getClaimsAction } from "@/identityuser/helper/claimsAction";
import { getUserByIdAction } from "@/identityuser/helper/userAction";
import { getRolesForAddUserAction } from "@/identityuser/helper/roleAction";
import { userEditType } from "@/type/UserEditType.type";

export default async function editUsersPage({ params }: { params: Promise<{ userId: string }> }) {


    const { userId } = await params;
    const roles = (await getRolesForAddUserAction()).payload;
    const Claims = await getClaimsAction();
    const user = (await getUserByIdAction(userId));


    if (user.status === "error") {
        return <div>No user found</div>;
    }

    return (
        <UsersEditForm
            claims={[...Claims.payload]}
            roles={[...roles]}
            user={user.payload}
        />
    );
}


