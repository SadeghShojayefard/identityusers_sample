// File: src/components/layout/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import "@/style/share/siteHeader.css";

export default function Header({ locale }: { locale: string }) {
    const pathname = usePathname();
    const router = useRouter();
    // base  - can only be recomputed once with useMemo
    const base = useMemo(() => pathname?.split("/")[1] || locale, [pathname, locale]);

    // next-auth hook
    const { data: session, status /* 'loading' | 'authenticated' | 'unauthenticated' */ } = useSession();
    const isLoggedIn = status === "authenticated";

    // This state causes the avatar/link to be displayed immediately if a login occurs (from the same tab or another tab)
    // without waiting for next-auth.
    const [forceUser, setForceUser] = useState<{ username?: string; avatar?: string } | null>(null);

    // Listener for BroadcastChannel messages and fallback: localStorage
    useEffect(() => {
        // BroadcastChannel (modern browsers)
        let bc: BroadcastChannel | null = null;
        try {
            bc = new BroadcastChannel("auth");
            bc.onmessage = (ev) => {
                const data = ev.data;
                if (!data) return;
                if (data.type === "logout") {
                    // Sign out of all tabs (next-auth cleanup)
                    signOut({ callbackUrl: `/${base}` });
                } else if (data.type === "login") {
                    // Set forceUser to update the UI immediately
                    setForceUser({ username: data.username, avatar: data.avatar });
                } else if (data.type === "refresh-session") {
                    // This message can be used if necessary
                    // For example, another tab wants to refresh the session.
                }
            };
        } catch (e) {
            bc = null;
        }

        // fallback: localStorage (for browsers that don't have BC or for security)
        const storageHandler = (e: StorageEvent) => {
            try {
                if (!e.key) return;
                if (e.key === "auth-login") {
                    const parsed = JSON.parse(e.newValue || "{}");
                    if (parsed?.type === "login") {
                        setForceUser({ username: parsed.username, avatar: parsed.avatar });
                    }
                } else if (e.key === "auth-logout") {
                    // Call next-auth when logout occurs
                    signOut({ callbackUrl: `/${base}` });
                }
            } catch (_) {
                // ignore malformed JSON
            }
        };

        window.addEventListener("storage", storageHandler);

        return () => {
            window.removeEventListener("storage", storageHandler);
            try {
                if (bc) {
                    bc.onmessage = null;
                    bc.close();
                }
            } catch (_) { }
        };
    }, [base]);

    // Clear forceUser when the real session is ready
    useEffect(() => {
        if (isLoggedIn && session?.user) {
            // When the real session comes, clear the forceUser to read everything from the session
            setForceUser(null);
        }
        // If logged out, clear
        if (status === "unauthenticated") {
            setForceUser(null);
        }
    }, [status, session]);

    // helper to show userName (first forceUser then session)
    const displayUsername = forceUser?.username ?? session?.user?.username;
    const displayAvatar = forceUser?.avatar ?? session?.user?.avatar;
    return (
        <header className="sticky top-0 w-full h-16 bg-white/30 backdrop-blur-md flex justify-between items-center px-4 z-50 p-0 m-0 shadow-md shadow-black">
            {/* mobile menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="md:hidden p-2 bg-gray-900 text-white rounded-md">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side={locale === "fa" ? "right" : "left"} className="w-64 h-full bg-white/70 backdrop-blur-md text-black flex flex-col gap-4 pt-10">
                    <NavBarMenu mobile locale={locale} />
                </SheetContent>
            </Sheet>

            {/* profile/avatar area */}
            <div className="flex flex-row gap-3 justify-center items-center">
                {displayUsername ? (
                    <div className="flex items-center gap-2">
                        <Link href={`/${base}/account/profile/${displayUsername}`}>
                            <Image
                                src={displayAvatar || "/Avatar/Default Avatar.png"}
                                width={50}
                                height={50}
                                alt="user-avatar"
                                className="rounded-full shadow shadow-black object-cover"
                            />
                        </Link>
                    </div>
                ) : (
                    <Link href={`/${base}/signin`}>
                        <IoPersonCircleOutline size={50} className="text-blue-300 hover:text-blue-400" />
                    </Link>
                )}
            </div>

            {/* desktop menu */}
            <div className="hidden md:flex flex-1 justify-center">
                <NavBarMenu locale={locale} />
            </div>
        </header>
    );
}


























function NavBarMenu({ mobile = false, locale = "en" }) {
    const pathname = usePathname();
    const base = pathname?.split("/")[1] || locale;

    const routes = [
        { name: "Home", href: `/${base}` },
        { name: "Store", href: `/${base}/stor` },
        { name: "About Us", href: `/${base}/aboutUs` },
        { name: "Contact Us", href: `/${base}/contactUs` },
    ];

    return (
        <nav className={`flex ${mobile ? "flex-col gap-4 items-start pr-2 text-right" : "flex-row gap-6 items-center"} text-base font-semibold`}>
            <ul className={`flex ${mobile ? `flex-col items-start gap-3 ${locale === "fa" ? "pr-4" : "pl-4"}` : "flex-row items-center gap-6"}`}>
                {routes.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link href={item.href} className={isActive ? "active-menu flex items-center gap-1" : "group menu_a_tag flex items-center gap-1"}>
                                <span>{item.name}</span>
                                <span className="menu_hover_animate"></span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
