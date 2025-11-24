

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;


    return (
        <div className="h-screen w-full flex flex-row items-center justify-center " >
            <p className="text-center">
                About Us Page
            </p>
        </div>
    );
}




