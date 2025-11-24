import { hasClaim } from "@/identityUser/lib/session";
import { redirect } from "next/navigation";


export default async function CmsTicketsPage() {

    const isClaim = await hasClaim("cmsTickets");

    if (!isClaim) {
        redirect(`/en`);
    }
    else {
        return (
            <div className="w-full h-full flex flex-col justify-start items-center gap-2   py-5 
        shadow-2xl shadow-black rounded-2xl px-2 ">
                <b className="text-2xl font-bold w-full border-b pb-2">Tickets </b>

            </div>

        );
    }
}
