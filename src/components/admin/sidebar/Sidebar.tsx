"use client"

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, Home, ShoppingCart, Users, MessageSquare, Percent, Receipt, ShieldUser, PhoneOutgoing, Tickets } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SideBarType } from "@/type/SideBarType.type";
import { DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";

export default function Sidebar({ claims }: { claims?: string[] }) {

    const pathname = usePathname();
    useEffect(() => {
        const handleLogout = () => {
            window.location.href = `/en`;
        };

        window.addEventListener("storage", (event) => {
            if (event.key === "logout") {
                handleLogout();
            }
        });

        return () => {
            window.removeEventListener("storage", handleLogout);
        };
    }, []);
    return (
        <div className="rtl flex  md:w-80 bg-white/30 backdrop-blur-2xl shadow-xl shadow-black">
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="fixed top-[60px] right-0 z-50 p-2 bg-gray-900 text-white rounded-md md:hidden">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-72 bg-colors-menuBlue text-white  overflow-auto bg-white/30 backdrop-blur-2xl shadow-xl shadow-black">

                    <SidebarMenu pathname={pathname} />
                    <DialogTitle className="sr-only"> site sidebar </DialogTitle>

                </SheetContent>
            </Sheet>

            <div className="sticky top-0 hidden md:flex flex-col  h-screen flex-1 bg-colors-menuBlue shadow-xl shadow-black text-white overflow-auto">
                <SidebarMenu pathname={pathname} claims={claims} />
            </div>
        </div>
    );
}

function SidebarMenu({ pathname, claims }: { pathname: string; claims?: string[] }) {
    const sidebarConfig = [
        { href: "/", text: "Home", icon: Home, claim: null, firstChild: true },
        { href: "/cmsDashboard", text: "Dashboard", icon: ShieldUser, claim: "cmsDashboard" },
        { href: "/cmsClaims", text: "Claims", icon: ShieldUser, claim: "cmsClaims" },
        { href: "/cmsRoles", text: "Roles", icon: ShieldUser, claim: "cmsRoles" },
        { href: "/cmsUsers", text: "Users", icon: Users, claim: "cmsUsers" },
        { href: "/cmsProduct", text: "Product", icon: ShoppingCart, claim: "cmsProduct" },
        { href: "/cmsComments", text: "Comment", icon: MessageSquare, claim: "cmsComments" },
        { href: "/cmsTickets", text: "Tickets", icon: Tickets, claim: "cmsTickets" },
        { href: "/cmsContactUs", text: "Contact", icon: PhoneOutgoing, claim: "cmsContactUs" },
        { href: "/cmsOrders", text: "Orders", icon: Receipt, claim: "cmsOrders" },
        { href: "/cmsOffs", text: "Offs", icon: Percent, claim: "cmsOffs" },
    ];


    const hasClaim = (claim: string | null, claims: string[] = []) => {
        if (!claim) return true;
        return claims.includes(claim);
    };

    return (
        <>
            <h2 className="text-lg font-semibold p-4 border-b-2 border-black mt-2 shadow-black shadow-md">Welcome to your Panel</h2>
            <ul className="mt-4 space-y-2">

                {sidebarConfig.map((item) => {
                    if (!hasClaim(item.claim, claims)) return null;

                    return (
                        <SidebarItem
                            key={item.href}
                            pathname={pathname}
                            href={item.href}
                            Icon={item.icon}
                            text={item.text}
                            firstChild={item.firstChild}

                        />
                    );
                })}


            </ul>
        </>
    );
}

const SidebarItem: React.FC<SideBarType> = ({ Icon, text, href, firstChild = false, pathname }) => {
    const isActive: boolean = pathname === href;

    return (
        <li>
            <Link
                href={href}
                className={`flex items-center gap-2 px-4 py-1 text-lg rounded-md  transition-all duration-200 
                    ${isActive ? "bg-sky-800/20" : "hover:bg-sky-800/20"}
                      ${firstChild && "mb-6"} `}
            >
                <Icon className="w-5 h-5" />
                {text}
            </Link>
        </li>
    );
}

