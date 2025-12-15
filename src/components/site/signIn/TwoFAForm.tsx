"use client"
import { create2FA_FallBackToken, signInFailedAction, signInSuccessAction, verifyLoginForm2FAAction } from "@/identityuser/helper/signInAction";
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";
import { hasPayload } from "@/type/actionType.type";
import { verify2StepSchema } from "@/identityuser/validation/verify2StepValidation";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { fallbackVerifySchema } from "@/identityuser/validation/fallbackValidation";

export default function TwoFAForm({ username }: { username: string }) {


    const searchParams = useSearchParams();
    const rememberMe = searchParams.get('rememberMe') || "";


    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);


    const verifyLogin2FAForm = useCustomForm({
        action: verifyLoginForm2FAAction,
        schema: verify2StepSchema(),
        showToast: true,
        id: "verifyLogin2FA"
    });

    const sendCodeToEmail = useCustomForm({
        action: create2FA_FallBackToken,
        schema: fallbackVerifySchema(),
        showToast: true,
        id: "Send_Fallbacl_Code"
    });
    const router = useRouter();



    useEffect(() => {

        if (verifyLogin2FAForm.lastResult?.status === "success" && hasPayload(verifyLogin2FAForm.lastResult)) {
            const { token, emailOrOTP } = verifyLogin2FAForm.lastResult.payload;
            (async () => {
                const res = await signIn("Credentials_2FA", {
                    username,
                    rememberMe,
                    token,
                    emailOrOTP,
                    redirect: false,
                    callbackUrl: `/en/account/profile/${username}`
                });
                if (res?.ok) {
                    setShowError(false);
                    setError("");
                    setSuccessMessage("verify Pass");
                    setShowSuccessMessage(true);
                    await signInSuccessAction(username);
                    try {
                        const bc = new BroadcastChannel("auth");
                        bc.postMessage({ type: "login", username, avatar: "/Avatar/Default Avatar.png" });
                        bc.close();
                    } catch (_) { }
                    // fallback for older browsers

                    localStorage.setItem("auth-login", JSON.stringify({ type: "login", username, avatar: "/Avatar/Default Avatar.png", time: Date.now() }));
                    router.push(`/en/account/profile/${username}`);


                } else if (res?.error) {
                    signInFailedAction(username);
                    setShowError(true);
                    setError(res.error);
                }

            })();

        }
    }, [verifyLogin2FAForm.lastResult]);





    return (
        <div className="formBody bg-white/30 w-full h-full ">

            <div className="form-style w-full md:w-1/3  shadow-2xl shadow-black p-3 rounded-2xl border-sky-200 border-2">
                <h3 className="form-title">verify form  </h3>

                {verifyLogin2FAForm.toastVisible && showSuccessMessage === true &&
                    (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {successMessage}
                        </p>
                    )

                }



                <form className="form-group" id={verifyLogin2FAForm.form.id} onSubmit={verifyLogin2FAForm.form.onSubmit} action={verifyLogin2FAForm.formAction}>
                    <input id="username" type="hidden" defaultValue={username}
                        key={verifyLogin2FAForm.fields.username.key}
                        name={verifyLogin2FAForm.fields.username.name} />

                    <div className="input-group">
                        <label htmlFor="token" className="block text-sm">Enter your code:</label>
                        <input id="token" type="text" className="input-style text-center"
                            key={verifyLogin2FAForm.fields.token.key}
                            name={verifyLogin2FAForm.fields.token.name}
                        />
                        {verifyLogin2FAForm.fields.token.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{verifyLogin2FAForm.fields.token.errors}</p>
                        }
                    </div>
                    <div className="flex flex-row items-center justify-start gap-5">
                        <label htmlFor="remember" className="block text-sm">Remember This Browser:</label>
                        <input id="remember" type="checkbox"
                            key={verifyLogin2FAForm.fields.remember.key}
                            name={verifyLogin2FAForm.fields.remember.name}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-start gap-5">
                        <label htmlFor="emailOrOTP" className="block text-sm">can not login with 2FA? click on send code to email and check this.</label>
                        <input id="emailOrOTP" type="checkbox"
                            key={verifyLogin2FAForm.fields.emailOrOTP.key}
                            name={verifyLogin2FAForm.fields.emailOrOTP.name}
                        />
                    </div>

                    {verifyLogin2FAForm.lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(verifyLogin2FAForm.lastResult) && verifyLogin2FAForm.lastResult.payload.message}
                        </p>
                    )}

                    {showError && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {error}
                        </p>
                    )}



                    <div className="w-full flex flex-row justify-center items-center ">
                        <button className="w-1/2  bg-sky-500 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer
                             shadow-xl  shadow-sky-800 
                               hover:hover:bg-sky-600 hover:backdrop-blur-2xl text-wrap font-bold  "
                            type="submit"
                            disabled={verifyLogin2FAForm.isPending}
                        >

                            {verifyLogin2FAForm.isPending ? 'pending...' : "Send Code"}

                        </button>
                    </div>


                </form>


                <form className="form-group" id={sendCodeToEmail.form.id} onSubmit={sendCodeToEmail.form.onSubmit} action={sendCodeToEmail.formAction}>
                    <input id="username" type="hidden" defaultValue={username}
                        key={sendCodeToEmail.fields.username.key}
                        name={sendCodeToEmail.fields.username.name} />

                    {sendCodeToEmail.lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(sendCodeToEmail.lastResult) && sendCodeToEmail.lastResult.payload.message}
                        </p>
                    )}

                    <div className="w-full flex flex-row justify-start items-start ">
                        <button className="w-full  md:w-1/2   text-black  mt-1  cursor-pointer
                              transition-all duration-300 ease-in-out transform 
                               hover:text-white/50 text-wrap font-bold text-left "
                            type="submit"
                            disabled={sendCodeToEmail.isPending}
                        >

                            {sendCodeToEmail.isPending ? 'pending...' : "email code?"}

                        </button>

                        {sendCodeToEmail.toastVisible && (
                            <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                                {hasPayload(sendCodeToEmail.lastResult) && sendCodeToEmail.lastResult.payload.message}
                            </p>
                        )}
                    </div>


                </form>

            </div>
        </div >
    )
}
