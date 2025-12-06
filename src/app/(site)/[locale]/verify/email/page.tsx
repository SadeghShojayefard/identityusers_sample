"use client"
import { verifyEmailToken } from "@/identityuser/helper/signInAction";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailVerifyPage() {

    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [resultState, setResultState] = useState("error");
    const [resultMessage, setResultMessage] = useState("");
    const [resultUsername, setResultUsername] = useState("");


    useEffect(() => {
        if (!token || !email) return;

        (async () => {
            const result = await verifyEmailToken(token, email);
            setResultState(result.status);
            setResultMessage(result.payload.message);
        })();
    }, []);


    return (
        <>
            <div className="h-screen w-full flex flex-col items-center justify-center gap-5" >
                {
                    resultState === "success" ?
                        (
                            <p className="text-center text-wrap bg-lime-400 text-black rounded-xl p-2">
                                {resultMessage}
                            </p>
                        )
                        :
                        resultMessage !== "" && (

                            <p className="text-center text-wrap bg-red-400 text-black rounded-xl p-2">
                                {resultMessage}
                            </p>
                        )

                }

                {
                    resultState === "success" ?
                        (
                            <Link href={`/en/signin`}
                                className={"bg-green-500 rounded-2xl px-5 py-2 flex flex-row items-center justify-center text-center no-underline"} >
                                Profile
                            </Link>

                        )
                        :
                        (
                            <Link href={`/en`}
                                className={"bg-red-500 rounded-2xl px-5 py-2 flex flex-row items-center justify-center text-center no-underline"} >
                                Home Page
                            </Link>
                        )

                }

            </div >
        </>
    );
}

