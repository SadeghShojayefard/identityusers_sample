import ClaimForm from "@/components/admin/claims/claimForm/ClaimForm";
import ClaimTable from "@/components/admin/claims/claimTable/ClaimTable";
import { hasClaim } from "@/identityuser/lib/session";
import { redirect } from "next/navigation";


export default async function ClaimsPage() {

    const isClaim = await hasClaim("cmsClaims");

    if (isClaim) {
        return (
            <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
                <b className="text-2xl font-bold w-full border-b pb-2">Claims</b>
                {
                    await hasClaim("add-Claims") &&
                    <ClaimForm />
                }


                <ClaimTable editClaim={await hasClaim("edit-Claims")} deleteClaim={await hasClaim("delete-Claims")} />
            </div>

        );
    }
    else {
        redirect(`/en`);
    }
}
