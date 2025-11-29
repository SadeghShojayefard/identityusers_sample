import UserRolesEditForm from "@/components/admin/userRoles/userRolesEditForm/UserRolesEditForm";
import { getClaimsAction } from "@/identityuser/helper/claimsAction";
import { getRoleByIDAction } from "@/identityuser/helper/roleAction";
import { roleType } from "@/Type/claimType.type";

export default async function editRolesPage({ params }: { params: Promise<{ roleId: string }> }) {

    const { roleId } = await params;
    const Claims = await getClaimsAction();
    const roleData = (await getRoleByIDAction(roleId)).payload;
    return (
        <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
            <UserRolesEditForm claims={[...Claims.payload]} role={roleData as roleType} />
        </div>

    );
}



