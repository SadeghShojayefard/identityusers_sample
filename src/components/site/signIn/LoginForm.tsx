"use client"
import { canUserSignInAction, signInFailedAction, signInFormAction, signInSuccessAction } from "@/identityuser/helper/signInFormAction";
import { SignInSchema } from "@/identityuser/validation/signInValidation";
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasPayload } from "@/type/actionType.type";
import Link from "next/link";



export default function LoginForm() {

    const [signInError, setSignInError] = useState(false);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [remainingLockoutMinutes, setRemainingLockoutMinutes] = useState(0);

    const router = useRouter();
    const { form, fields, formAction, isPending, lastResult } = useCustomForm({
        action: signInFormAction,
        schema: SignInSchema(),
        showToast: false,
        id: "signIn-form",
        locale: "en"
    });
    useEffect(() => {
        if (lastResult?.status === 'success') {
            if (hasPayload(lastResult)) {

                const { username, password } = lastResult.payload;

                (async () => {
                    try {
                        const logInAllow = await canUserSignInAction(username);

                        if (logInAllow?.status === "success") {
                            const res = await signIn("credentials", {
                                username,
                                password,
                                redirect: false,
                                callbackUrl: `/en/account/profile/${username}`,

                            });

                            if (res?.ok) {
                                setSignInError(false);
                                signInSuccessAction(username);
                                try {
                                    const bc = new BroadcastChannel("auth");
                                    bc.postMessage({ type: "login", username, avatar: "/Avatar/Default Avatar.png" });
                                    bc.close();
                                } catch (_) { }
                                // fallback for older browsers
                                localStorage.setItem("auth-login", JSON.stringify({ type: "login", username, avatar: "/Avatar/Default Avatar.png", time: Date.now() }));

                                router.push(res.url || `/en/account/profile/${username}`);

                            } else {
                                signInFailedAction(username);
                                setSignInError(true);

                            }
                        }
                        else {
                            setRemainingLockoutMinutes(Number(logInAllow?.message))
                            setIsLockedOut(true);
                        }

                    } catch (error) {
                        setSignInError(true);
                    }
                })();
            }
        }
    }, [lastResult]);

    return (
        <div className="formBody bg-white/30 w-1/2 ">
            <div className="form-style w-full">
                <h2 className="form-title">Sign In</h2>
                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>

                    <div className="input-group">
                        <label htmlFor="userName" className="block text-sm">Username</label>
                        <input
                            key={fields.userName.key}
                            name={fields.userName.name}
                            id="userName"
                            type="text"
                            className="input-style"
                            dir="ltr" />
                        {fields.userName.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.userName.errors}</p>
                        }
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" className="block text-sm">Password</label>
                        <input
                            key={fields.password.key}
                            name={fields.password.name}
                            id="password"
                            type="password"
                            className="input-style"
                            dir="ltr" />
                        {fields.password.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.password.errors}</p>
                        }

                    </div>
                    {isLockedOut && (
                        <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                            {"You can not Login Now"} |
                            <span>{remainingLockoutMinutes}</span>
                            <span> Minutes Remain to Try Again</span>
                        </p>
                    )}

                    {signInError && (
                        <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                            {"Username or Passwrod is wrong."}
                        </p>
                    )}
                    <div className="grid  grid-cols-2  flex-wrap justify-center items-center gap-2 w-full ">

                        <div className="sm:col-span-2 md:col-span-1 w-full">

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-teal-600 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer shadow-xl shadow-teal-800 hover:bg-teal-800"
                            >
                                {isPending ? 'login in sec...' : "Login"}
                            </button>


                        </div>

                        {/* <div className="sm:col-span-2 md:col-span-1 w-full">

                            <Link
                                href={"./forgetPassword"}
                                className="w-full bg-teal-500 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer shadow-xl shadow-teal-800 hover:bg-teal-600
                                flex flex-row justify-center items-center"
                            >
                                Forget Password ?
                            </Link>
                        </div> */}


                    </div>
                </form>


            </div>
        </div>
    )
}

