import { requireAuth } from "@/identityuser/lib/authGuard";


export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await requireAuth(`/${locale}`);

    return (
        <div className="h-fit w-full flex flex-row items-center justify-center " >
            <p className="text-center">
                Account Ticket Page
            </p>
        </div>


    );
}
