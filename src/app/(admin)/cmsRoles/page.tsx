import UserRolesTable from "@/components/admin/userRoles/userRolesTable/UserRolesTable";
import { hasClaim } from "@/identityuser/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function userRolesPage() {

    const isClaim = await hasClaim("cmsRoles");

    if (!isClaim) {
        redirect(`/en`);
    }
    else {
        return (
            <div className="w-full h-full flex flex-col justify-start items-start gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
                <b className="text-2xl font-bold w-full border-b pb-2">Roles</b>
                {
                    await hasClaim("add-roles") &&
                    <Link href={'./cmsRoles/addRoles'} target="_blank" className="formButton ">
                        Add New Roles
                    </Link>
                }

                <UserRolesTable deleteClaim={await hasClaim("delete-roles")} editClaim={await hasClaim("edit-roles")} detailsClaim={await hasClaim("details-Roles")} />
            </div>

        );
    }
}
