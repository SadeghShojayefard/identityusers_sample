"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generateQRCodeAction, verify2FAAction } from "@/identityuser/helper/signInAction";
import { useCustomForm } from "@/hooks/useCustomForm";
import { verify2FASchema } from "@/identityuser/validation/verify2FAValidation";
import { hasPayload } from "@/type/actionType.type";

export default function TwoFactorPage() {

    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || "";

    const [loading, setLoading] = useState(true);
    const [qr, setQr] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [recoveryCode, setRecoveryCode] = useState([]);

    const { form, fields, formAction, isPending, toastVisible, lastResult } = useCustomForm({
        action: verify2FAAction,
        schema: verify2FASchema(),
        showToast: true,
        id: "verify2FA"
    });


    useEffect(() => {
        if (!userId) return;
        else {
            async function loadQR() {

                const res = await generateQRCodeAction(userId);

                if (res.status === "success") {
                    setQr(res.payload.qr);
                } else {
                    setError(res.payload.message);
                }

                setLoading(false);
            }

            loadQR();
        }
    }, [userId]);


    useEffect(() => {
        if (lastResult?.status === "success" && hasPayload(lastResult)) {
            setRecoveryCode(lastResult.payload?.rawCodes)
            const timer = setTimeout(() => {
                window.location.reload();
            }, 30000);
        }
    }, [lastResult]);


    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-5">
            {loading && <p>Loading...</p>}

            {error && <p className="text-red-500">{error}</p>}

            {qr && (
                <>
                    <p>scan the QR CODE with your smart phone and enter the code on verify form.</p>
                    <img src={qr} alt="QR Code" />

                    <div className="form-style w-1/3  shadow-2xl shadow-black p-3 rounded-2xl border-sky-200 border-2 gap-5">
                        <h3 className="form-title">verify form  </h3>

                        {toastVisible && (
                            <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                                {hasPayload(lastResult) && lastResult.payload.message}
                            </p>
                        )}

                        {
                            recoveryCode.length != 0 &&
                            <div className="flex flex-col items-center justify-center rounded-2xl shadow-black shadow-xl border-2">
                                <p>
                                    Recovery codes to recover two-step verification. Please keep them in a safe place. These codes are for one-time use.
                                </p>
                                <ul >
                                    {recoveryCode.map((code) => (
                                        <>
                                            <li key={code}>
                                                {code}
                                            </li>
                                        </>
                                    ))}
                                </ul>
                            </div>

                        }

                        <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                            <input id="userId" type="hidden" className="input-style text-center" defaultValue={userId}
                                key={fields.userId.key}
                                name={fields.userId.name} />



                            <div className="input-group">
                                <label htmlFor="token" className="block text-sm">Token </label>
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
                </>
            )
            }
        </div>
    );
}
