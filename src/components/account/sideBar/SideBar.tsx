"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { nullable } from "zod";

export default function AccountSidebar({
    locale,
    avatar,
    username,
    roles,
    passwordExpire
}: {
    locale: string;
    avatar?: string;
    username: string,
    roles?: string[],
    passwordExpire: Boolean,
}) {
    const pathname = usePathname();

    return (
        <div className="col-span-10 md:col-span-1  flex flex-col justify-start items-center  
                        rounded-2xl border border-sky-700 shadow shadow-black gap-1 p-1 w-full md:h-80 md:sticky md:top-[70px] ">
            <Image
                src={avatar || "/Avatar/Default Avatar.png"}
                width={75}
                height={75}
                alt="site-logo"
                className="rounded-full shadow shadow-black"
            />
            <p className="w-full text-center my-2 font-bold text-xl text-shadow-md text-shadow-cyan-300 border-b">
                {username}
            </p>
            <AccountMenu locale={locale} username={username} roles={roles} passwordExpire={passwordExpire} />
        </div>
    );
}


function AccountMenu({ locale, username, roles, passwordExpire }:
    { locale: string, username: string, roles?: string[], passwordExpire: Boolean }) {
    const pathname = usePathname();
    const routes = [
        { name: "Profile", href: `/${pathname.split("/")[1]}/account/profile/${username}` },
        { name: "Orders", href: `/${pathname.split("/")[1]}/account/orders/${username}` },
        { name: "Tickets", href: `/${pathname.split("/")[1]}/account/tickets/${username}` },
        { name: "Admin Panel", href: '/cmsDashboard', },
        { name: "Sign Out", href: `#`, func: true },
    ];
    const logoutUser = () => {
        localStorage.setItem("logout", Date.now().toString());
        signOut({
            callbackUrl: `/${locale}`
        })
    }

    if (passwordExpire) {
        return (
            <ul className={`flex  flex-col justify-end  items-start gap-2 h-full w-full mb-5`}>
                <li className="w-full shadow flex flex-row justify-center items-center hover:bg-cyan-500">
                    <Link
                        href="/en"
                        className={`w-full border shadow-md shadow-black  } 
                 pl-2 rounded-md text-justify`}
                        onClick={(e) => {
                            e.preventDefault();
                            logoutUser();
                        }}
                    >
                        Sign Out
                    </Link>
                </li>
            </ul>
        );
    }
    else {
        return (
            <ul className={`flex  flex-col items-start gap-2  w-full mb-5`}>

                {routes.map((item) => {
                    const isActive = pathname === item.href;

                    if (item.href === "/cmsDashboard") {
                        const allowedRoles = ["Admin", "Owner", "Seller"];
                        const canAccessCms = roles?.some(r => allowedRoles.includes(r));

                        return canAccessCms && (
                            <li key={item.href} className="w-full shadow flex flex-row justify-center items-center">
                                <Link
                                    href={item.href}
                                    className={`w-full border shadow-md shadow-black ${isActive ? "bg-sky-300" : "hover:bg-cyan-500"} 
                    ${locale === "fa" ? "pr-2" : "pl-2"} rounded-md text-justify`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        );
                    }

                    return (
                        <li key={item.href} className="w-full shadow flex flex-row justify-center items-center">
                            <Link
                                href={item.href}
                                className={`w-full border shadow-md shadow-black ${isActive ? "bg-sky-300" : "hover:bg-cyan-500"} 
                ${locale === "fa" ? "pr-2" : "pl-2"} rounded-md text-justify`}
                                onClick={(e) => {
                                    if (item.func) {
                                        e.preventDefault();
                                        logoutUser();
                                    }
                                }}
                            >
                                {item.name}
                            </Link>
                        </li>
                    );
                })}


            </ul >
        )
    }
}
