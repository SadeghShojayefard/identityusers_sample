"use client"
import { createPhoneLoginOTP } from "@/identityuser/helper/signInAction";
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";

import { hasPayload } from "@/type/actionType.type";
import { signInOTPSchema } from "@/identityuser/validation/signInOTPValidation";
import OTPLoginModal from "../modals/OTPLoginModal/OTPLoginModal";



export default function LoginOTPForm() {


    const [Message, setMessage] = useState({
        message: "",
        showOtpModal: false,
        expiresAt: 0,
        modalVersion: 0,
        identifier: "",
        username: "",
        rememberMe: false
    });


    const { form, fields, formAction, isPending, lastResult, toastVisible } = useCustomForm({
        action: createPhoneLoginOTP,
        schema: signInOTPSchema(),
        showToast: false,
        id: "signIn-phone-otp",
        locale: "en"
    });


    useEffect(() => {
        if (hasPayload(lastResult)) {
            const { message, showOtpModal, expiresAt, identifier, username, rememberMe } = lastResult.payload;

            setMessage(prev => ({
                message,
                showOtpModal,
                expiresAt: Number(expiresAt),
                modalVersion: prev.modalVersion + 1,
                identifier,
                username,
                rememberMe,
            }));
        }
    }, [lastResult]);

    return (
        <div className=" bg-white/30 w-full h-full p-10 border-t-2 border-sky-400 ">
            <div className="form-style w-full">
                <h2 className="form-title">Sign In with Phone</h2>
                {toastVisible && (
                    <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                        {hasPayload(lastResult) && lastResult.payload.message}
                    </p>
                )}

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>

                    <div className="flex flex-row items-center justify-start gap-5">
                        <input id="phoneNumber" type="text" className="input-style text-center"
                            key={fields.phoneNumber.key}
                            name={fields.phoneNumber.name} />
                    </div>

                    <div className="flex flex-row items-center justify-start mt-5 gap-5">
                        <label htmlFor="rememberMe" className="block text-sm">rememberMe:</label>
                        <input id="rememberMe" type="checkbox"
                            key={fields.rememberMe.key}
                            name={fields.rememberMe.name}
                        />
                    </div>
                    {lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(lastResult) && lastResult.payload.message}
                        </p>
                    )}

                    <button
                        className="w-full h-12 bg-sky-500 text-white rounded-2xl shadow-xl shadow-sky-800 hover:bg-sky-600 
                        flex justify-center items-center font-bold mt-10"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? "pending..." : "Get Code"}
                    </button>
                </form>


            </div>
            {Message.showOtpModal && (
                <OTPLoginModal
                    key={Message.modalVersion}       // ← مهم‌ترین بخش
                    showOtpModal={Message.showOtpModal}
                    expiresAt={Message.expiresAt}
                    phoneNumber={Message.identifier}
                    username={Message.username}
                    rememberMe={Message.rememberMe}
                />
            )}
        </div>
    )
}

