import { requireAuth } from "@/identityUser/lib/authGuard";



export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string, username: string }> }) {

    const { locale } = await params;
    const session = await requireAuth(`/${locale}`);

    return (
        <div className="h-fit w-full flex flex-row items-center justify-center " >
            <p className="text-center">
                Account Order Page
            </p>
        </div>

    );
}
