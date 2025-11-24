import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // List of supported languages
    const supportedLocales = ["fa", "en"];
    if (
        pathname.startsWith("/_next/") || // Next.js build files
        pathname.startsWith("/api/") || // API routes
        pathname.match(/\.(png|jpg|jpeg|gif|svg|woff|woff2|css|js|ico|rar)$/) || // Static files
        pathname.startsWith("/cms") // Routes (admin)
    ) {
        return NextResponse.next();
    }

    // If the path was exactly / => redirect to /en
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/en", request.url));
    }

    // Check the path: is it one of the locales first?
    const pathnameSegments = pathname.split("/").filter(Boolean);
    const firstSegment = pathnameSegments[0];

    const hasLocale = supportedLocales.includes(firstSegment);

    // If locale is not specified (i.e. path is like /aboutus), redirect to /en/aboutus
    if (!hasLocale) {
        const newPath = ["/en", ...pathnameSegments].join("/");
        return NextResponse.redirect(new URL(newPath, request.url));
    }

    // The path was correct => continue
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico).*)"], // All paths except special paths
};
