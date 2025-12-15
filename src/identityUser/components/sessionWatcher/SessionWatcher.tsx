"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionWatcher({ locale }: { locale: string }) {
    const { data: session, status } = useSession();

    // --- 1) If Session is not valid → Log out all tabs ---
    useEffect(() => {
        if (status === "authenticated" && !session?.user) {
            // Record in localStorage so other tabs can understand
            localStorage.setItem("logout", Date.now().toString());

            signOut({
                callbackUrl: `/${locale}`,
            });
        }
    }, [session, status, locale]);

    // --- 2) Listen for logout changes in other tabs ---
    useEffect(() => {
        const handler = (event: StorageEvent) => {
            if (event.key === "logout") {
                // When logged out of a tab, this tab is also logged out
                signOut({
                    callbackUrl: `/${locale}`,
                });
            }
        };

        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [locale]);


    useEffect(() => {
        if (!session?.user) return;

        const { rememberMe, loginAt } = session.user;


        // If rememberMe not checked session expire after 1 hour and user force to log out 
        if (!rememberMe) {

            const ONE_HOUR = 60 * 60 * 1000; // (adjust if needed)

            const check = () => {
                const now = Date.now();

                if (now - Number(loginAt) > ONE_HOUR) {
                    // خروج از تمام تب‌ها
                    localStorage.setItem("logout", Date.now().toString());

                    signOut({
                        callbackUrl: `/${locale}`,
                    });
                }
            };

            // اجرای اولیه
            check();

            // هر 30 ثانیه چک می‌کند
            const interval = setInterval(check, 30_000);

            return () => clearInterval(interval);
        }
    }, [session, locale]);






    return null;
}