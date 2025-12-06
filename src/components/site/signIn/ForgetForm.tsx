"use client"
import { forgotPasswordRequestAction } from "@/identityuser/helper/signInAction";
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";
import Link from "next/link";
import { forgetPasswordSchema } from "@/identityuser/validation/forgetPasswordValidation";
import { hasPayload } from "@/type/actionType.type";
import OtpModal from "../modals/otpModal/OtpModal";

export default function ForgetForm() {

    const [showMessage, setShowMessage] = useState(false);

    const [forgetMessage, setForgetMessage] = useState({
        message: "",
        showOtpModal: false,
        expiresAt: 0,
        modalVersion: 0,
        identifier: ""
    });

    const { form, fields, formAction, isPending, lastResult } = useCustomForm({
        action: forgotPasswordRequestAction,
        schema: forgetPasswordSchema(),
        showToast: false,
        id: "Forget-Password-form",
        locale: "en"
    });


    useEffect(() => {
        if (hasPayload(lastResult)) {
            const { message, showOtpModal, expiresAt, identifier } = lastResult.payload;

            setForgetMessage(prev => ({
                message,
                showOtpModal,
                expiresAt: Number(expiresAt),
                modalVersion: prev.modalVersion + 1,
                identifier: identifier,
            }));

            setShowMessage(true);
        }
    }, [lastResult]);


    return (
        <div className="formBody bg-white/30 w-full ">
            <div className="form-style w-full md:w-1/2">
                <h2 className="form-title">Forget Password</h2>

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>

                    <div className="input-group">
                        <label htmlFor="email_phone" className="block text-sm">
                            Please Input valid Email/Phone Number
                        </label>

                        <input
                            key={fields.email_phone.key}
                            name={fields.email_phone.name}
                            id="email_phone"
                            type="text"
                            className="input-style"
                            dir="ltr"
                        />

                        {fields.email_phone.errors && (
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.email_phone.errors}
                            </p>
                        )}
                    </div>


                    {showMessage && (
                        <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                            {forgetMessage.message}

                            {forgetMessage.expiresAt > 0 && !forgetMessage.showOtpModal && (
                                <>
                                    <br />
                                    {Math.floor(forgetMessage.expiresAt / 1000)} second remain to try again
                                </>
                            )}
                        </p>
                    )}


                    <div className="grid grid-cols-2 gap-2 w-full ">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-teal-600 text-white p-2 mt-4 rounded-2xl shadow-xl shadow-teal-800 hover:bg-teal-800 cursor-pointer"
                        >
                            {isPending ? 'Sending...' : "Submit"}
                        </button>

                        <Link
                            href={"./Signin"}
                            className="w-full bg-teal-500 text-white p-2 mt-4 rounded-2xl shadow-xl shadow-teal-800 hover:bg-teal-600 flex justify-center items-center"
                        >
                            Remembered? Back to SignIn
                        </Link>
                    </div>
                </form>
            </div>


            {/* 🔥 OTP Modal با modalVersion */}
            {forgetMessage.showOtpModal && (
                <OtpModal
                    key={forgetMessage.modalVersion}       // ← مهم‌ترین بخش
                    showOtpModal={forgetMessage.showOtpModal}
                    expiresAt={forgetMessage.expiresAt}
                    phoneNumber={forgetMessage.identifier}
                />
            )}
        </div>
    )
}
