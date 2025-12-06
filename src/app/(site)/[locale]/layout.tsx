import AuthProvider from "@/identityuser/providers/SessionProvider";
import "../../globals.css";
import Header from "@/components/share/Header/Header";




export default async function Layout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
  const { locale } = await params;


  return (
    <html lang={locale} >
      <body className={`main-bg-color font-vazir`}>
        <AuthProvider>
          <Header locale={locale} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}





