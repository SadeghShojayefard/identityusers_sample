import NextAuth from "next-auth";
import { options } from "@/identityUser/api/auth/[...nextauth]/options";

export const GET = NextAuth(options);
export const POST = NextAuth(options);