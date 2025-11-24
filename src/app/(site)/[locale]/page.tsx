
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {

  const { locale } = await params;


  return (
    <>
      <div className="h-screen w-full flex flex-row items-center justify-center " >
        <p className="text-center">
          Home Page
        </p>
      </div>
    </>
  );
}

