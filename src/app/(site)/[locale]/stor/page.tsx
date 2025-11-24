


export default async function storPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <div className="h-screen w-full flex flex-row items-center justify-center " >
            <p className="text-center">
                Store Page
            </p>
        </div>
    );
}
