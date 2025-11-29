"use client"
import { signUpformAction } from "@/identityuser/helper/signUpformAction";
import { useCustomForm } from "@/hooks/useCustomForm";
import { signUpSchema } from "@/identityuser/validation/signUpValidation";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { hasPayload } from "@/type/actionType.type";

export default function SignUpForm() {
    const { form, fields, formAction, isPending, lastResult } = useCustomForm({
        action: signUpformAction,
        schema: signUpSchema(),
        showToast: false,
        id: "signUp-form",
        locale: "en"
    });

    useEffect(() => {
        if (lastResult?.status === 'success') {
            if (hasPayload(lastResult)) {
                const { username, password } = lastResult.payload;
                (async () => {
                    try {
                        const bc = new BroadcastChannel("auth");
                        bc.postMessage({ type: "login", username, avatar: "/Avatar/Default Avatar.png" });
                        bc.close();
                    } catch (_) { }
                    // fallback for older browsers
                    localStorage.setItem("auth-login", JSON.stringify({ type: "login", username, avatar: "/Avatar/Default Avatar.png", time: Date.now() }));
                    await signIn("credentials", {
                        username,
                        password,
                        redirect: true,

                        callbackUrl: `/en/account/profile/${username}`,
                    });

                })();
            }
        }
    }, [lastResult]);



    return (
        <div className="formBody  bg-white/10 w-1/2">
            <div className="form-style w-full">
                <h2 className="form-title">Sign Up</h2>
                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>

                    <div className="input-group">
                        <label htmlFor="username" className="block text-sm">Username</label>
                        <input
                            key={fields.username.key}
                            name={fields.username.name}
                            id="username"
                            type="text"
                            className="input-style"
                            dir="ltr" />
                        {fields.username.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.username.errors}</p>
                        }
                    </div>
                    <div className="input-group">
                        <label htmlFor="email" className="block text-sm">Email </label>
                        <input
                            key={fields.email.key}
                            name={fields.email.name}
                            id="email"
                            type="email"
                            className="input-style"
                            dir="ltr" />
                        {fields.email.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.email.errors}</p>
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
                            dir="ltr"
                        />
                        {fields.password.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.password.errors}</p>
                        }
                    </div>
                    <div className="input-group">
                        <label htmlFor="password2" className="block text-sm">Confirm Password</label>
                        <input
                            key={fields.password2.key}
                            name={fields.password2.name}
                            id="password2"
                            type="password"
                            className="input-style"
                            dir="ltr"
                        />
                        {fields.password2.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>
                                {fields.password2.errors}</p>
                        }
                    </div>
                    <div className=" w-full flex flex-col ">
                        {
                            lastResult && lastResult.status === 'error' && hasPayload(lastResult) && lastResult.payload?.message === 'username' ? (
                                <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                                    Username or Email already exist
                                </p>
                            ) : lastResult && lastResult.status === 'error' && hasPayload(lastResult) && lastResult.payload?.message === 'email' ? (
                                <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                                    Username or Email already exist
                                </p>
                            ) : null
                        }
                        <button className="w-1/2  bg-sky-500 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer
                    shadow-xl  shadow-sky-800 
                       hover:hover:bg-sky-600 hover:backdrop-blur-2xl text-wrap font-bold  "
                            disabled={isPending}
                        >
                            {isPending ? 'Register in sec...' : "Sign Up"}

                        </button>
                    </div>


                </form>
            </div>
        </div>
    )
}

