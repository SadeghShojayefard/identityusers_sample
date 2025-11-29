import UserRolesForm from "@/components/admin/userRoles/userRolesForm/UserRolesForm";
import { getClaimsAction } from "@/identityuser/helper/claimsAction";

export default async function addRolesPage() {

    const Claims = await getClaimsAction();

    return (
        <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
            <UserRolesForm claims={[...Claims.payload]} />
        </div>

    );
}



