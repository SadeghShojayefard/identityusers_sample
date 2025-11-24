import { LucideIcon } from "lucide-react";

export type SideBarType = {
    Icon: LucideIcon;
    text: string;
    href: string;
    firstChild?: boolean;
    pathname: string;
};

