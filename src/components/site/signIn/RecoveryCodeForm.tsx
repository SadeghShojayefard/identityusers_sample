"use client"
import { signInFailedAction, signInSuccessAction, verifyLogin2FAAction, verifyRecoveryCodeAction } from "@/identityuser/helper/signInAction";
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";
import { hasPayload } from "@/type/actionType.type";
import { verify2StepSchema } from "@/identityuser/validation/verify2StepValidation";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RecoveryCodeForm({ username }: { username: string }) {

    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);

    const { form, fields, formAction, isPending, toastVisible, lastResult } = useCustomForm({
        action: verifyRecoveryCodeAction,
        schema: verify2StepSchema(),
        showToast: true,
        id: "Recovery2FA"
    });
    const router = useRouter();

    useEffect(() => {
        const password = sessionStorage.getItem("pendingPassword");

        if (!password) {
            setShowError(true);
            setError("Session expired, please login again.");
            router.push(`/en/signin`);
            return;
        }

        if (lastResult?.status === "success" && hasPayload(lastResult)) {
            const { username } = lastResult.payload;
            (async () => {
                const res = await signIn("credentials", {
                    username,
                    password,
                    redirect: false,
                    callbackUrl: `/en/account/profile/${username}`
                });
                if (res?.ok) {
                    sessionStorage.removeItem("pendingPassword");
                    setShowError(false);
                    setError("");
                    signInSuccessAction(username);
                    try {
                        const bc = new BroadcastChannel("auth");
                        bc.postMessage({ type: "login", username, avatar: "/Avatar/Default Avatar.png" });
                        bc.close();
                    } catch (_) { }
                    // fallback for older browsers

                    localStorage.setItem("auth-login", JSON.stringify({ type: "login", username, avatar: "/Avatar/Default Avatar.png", time: Date.now() }));
                    router.push(`/en/account/profile/${username}`);


                } else {
                    signInFailedAction(username);
                }

            })();

        }
    }, [lastResult]);




    return (
        <div className="formBody bg-white/30 w-full h-full ">

            <div className="form-style w-full md:w-1/3  shadow-2xl shadow-black p-3 rounded-2xl border-sky-200 border-2">
                <h3 className="form-title">Recovery form  </h3>

                {toastVisible && (
                    <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                        {hasPayload(lastResult) && lastResult.payload.message}
                    </p>
                )}

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                    <input id="username" type="hidden" className="input-style text-center" defaultValue={username}
                        key={fields.username.key}
                        name={fields.username.name} />



                    <div className="input-group">
                        <label htmlFor="token" className="block text-sm">Enter your Recovery code:</label>
                        <input id="token" type="text" className="input-style text-center"
                            key={fields.token.key}
                            name={fields.token.name}
                        />
                        {fields.token.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.token.errors}</p>
                        }
                    </div>

                    {lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(lastResult) && lastResult.payload.message}
                        </p>
                    )}

                    <div className="w-full flex flex-row justify-center items-center ">
                        <button className="w-1/2  bg-sky-500 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer
                             shadow-xl  shadow-sky-800 
                               hover:hover:bg-sky-600 hover:backdrop-blur-2xl text-wrap font-bold  "
                            type="submit"
                            disabled={isPending}
                        >

                            {isPending ? 'pending...' : "Send Code"}

                        </button>
                    </div>


                </form>
            </div>
        </div>
    )
}
