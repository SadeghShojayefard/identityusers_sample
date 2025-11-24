import UsersTable from "@/components/admin/users/usersTable/UsersTable";
import { hasClaim } from "@/identityUser/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function usersPage() {
    const isClaim = await hasClaim("cmsUsers");

    if (!isClaim) {
        redirect(`/en`);
    }
    else {

        return (
            <div className="w-full h-full flex flex-col justify-start items-start gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
                <b className="text-2xl font-bold w-full border-b pb-2">Users  </b>


                {
                    await hasClaim("add-user") &&
                    <Link href={'./cmsUsers/addUsers'} target="_blank" className="formButton ">
                        Add New Users
                    </Link>
                }

                <UsersTable
                    editClaim={await hasClaim("edit-user")}
                    deleteClaim={await hasClaim("delete-User")}
                    detailsClaim={await hasClaim("detail-User")}
                    passwordClaim={await hasClaim("change-password-user")} />
            </div>

        );
    }
}
