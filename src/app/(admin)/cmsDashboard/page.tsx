import { hasClaim } from "@/identityuser/lib/session";
import { redirect } from "next/navigation";


export default async function CmsDashboardPage() {

    const isClaim = await hasClaim("cmsDashboard");

    if (isClaim) {
        return (
            <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
                <b className="text-2xl font-bold w-full border-b pb-2">Dashboard  </b>
            </div>

        );
    }
    else {
        redirect(`/en`);
    }

}
