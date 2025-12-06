"use client"

import VerifyModal from "@/components/site/modals/verifyModal/VerifyModal";
import { useCustomForm } from "@/hooks/useCustomForm";
import { createEmailVerificationToken, creatPhoneVerificationOTP, generate2FASecretAction } from "@/identityuser/helper/signInAction";
import { changeNameAction } from "@/identityuser/helper/userAction";
import { emailVerifySchema } from "@/identityuser/validation/emailVerifyValidation";
import { phoneVerifySchema } from "@/identityuser/validation/phoneVerifyValidation";
import { twoStepEnableSchema } from "@/identityuser/validation/twoStepEnableValidation";
import { hasPayload } from "@/type/actionType.type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserInfo({
    id,
    email,
    phoneNumber,
    emailConfirmed,
    phoneNumberConfirmed,
    twoFactorEnabled,
}:
    {
        id?: string,
        email?: string,
        phoneNumber?: string,
        emailConfirmed?: boolean,
        phoneNumberConfirmed?: boolean,
        twoFactorEnabled?: boolean,
    }) {

    const router = useRouter();

    const [forgetMessage, setForgetMessage] = useState({
        message: "",
        showOtpModal: false,
        expiresAt: 0,
        modalVersion: 0,
        identifier: ""
    });

    const emailVarificationForm = useCustomForm({
        action: createEmailVerificationToken,
        schema: emailVerifySchema(),
        showToast: true,
        id: "email-Varification-form"
    });

    const phoneVarificationForm = useCustomForm({
        action: creatPhoneVerificationOTP,
        schema: phoneVerifySchema(),
        showToast: true,
        id: "phone-Varification-form"
    });

    const twoStepEnable = useCustomForm({
        action: generate2FASecretAction,
        schema: twoStepEnableSchema(),
        showToast: true,
        id: "two-Step-Enable"
    });

    useEffect(() => {
        if (hasPayload(phoneVarificationForm.lastResult)) {
            const { message, showOtpModal, expiresAt, identifier } = phoneVarificationForm.lastResult.payload;

            setForgetMessage(prev => ({
                message,
                showOtpModal,
                expiresAt: Number(expiresAt),
                modalVersion: prev.modalVersion + 1,
                identifier: identifier,
            }));
        }
    }, [phoneVarificationForm.lastResult]);

    useEffect(() => {
        if (hasPayload(twoStepEnable.lastResult)) {
            const { redirectTo } = twoStepEnable.lastResult.payload;

            if (!twoFactorEnabled && redirectTo) {
                setTimeout(() => {
                    router.push(redirectTo);
                }, 2000);
            }
            else {
                setTimeout(() => {
                    setTimeout(() => window.location.reload(), 2000);
                }, 2000);

            }
        }
    }, [twoStepEnable.lastResult]);

    return (


        <div className="w-full  flex flex-row flex-wrap justify-evenly items-center gap-2  p-2  shadow-xl shadow-black rounded-xl  mt-5 ">
            <b className="font-bold text-lg text-black text-shadow-xs text-shadow-black text-start w-full"></b>

            <div className="w-full p-10 flex items-center justify-start text-black z-10 shadow-2xl shadow-black  bg-white/10 rounded-2xl ">
                <div className="form-style w-full ">
                    <h2 className="form-title">Account Varification:  </h2>
                    {emailVarificationForm.toastVisible && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(emailVarificationForm.lastResult) && emailVarificationForm.lastResult.payload.message}
                        </p>
                    )}
                    {phoneVarificationForm.toastVisible && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(phoneVarificationForm.lastResult) && phoneVarificationForm.lastResult.payload.message}
                        </p>
                    )}
                    {twoStepEnable.toastVisible && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(twoStepEnable.lastResult) && twoStepEnable.lastResult.payload.message}
                        </p>
                    )}
                    {emailVarificationForm.lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(emailVarificationForm.lastResult) && emailVarificationForm.lastResult.payload.message}
                        </p>
                    )}
                    {phoneVarificationForm.lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(phoneVarificationForm.lastResult) && phoneVarificationForm.lastResult.payload.message}
                        </p>
                    )}
                    {twoStepEnable.lastResult?.status === "error" && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {hasPayload(twoStepEnable.lastResult) && twoStepEnable.lastResult.payload.message}
                        </p>
                    )}

                    <div className="w-full flex flex-row justify-evenly items-center gap-4 flex-wrap mt-5">
                        {/* Email Verify */}
                        <div className="w-1/4 flex justify-center items-center">
                            {emailConfirmed ? (
                                <p className="bg-lime-400 px-5 py-2 rounded-xl shadow-xl shadow-lime-700 text-center w-full h-12 flex justify-center items-center">
                                    email confirmed
                                </p>
                            ) : (
                                <form
                                    className="w-full flex justify-center items-center"
                                    id={emailVarificationForm.form.id}
                                    onSubmit={emailVarificationForm.form.onSubmit}
                                    action={emailVarificationForm.formAction}
                                >
                                    <input id="id" type="hidden" className="input-style text-center" defaultValue={id}
                                        key={emailVarificationForm.fields.id.key}
                                        name={emailVarificationForm.fields.id.name} />

                                    <input id="email" type="hidden" className="input-style text-center" defaultValue={email}
                                        key={emailVarificationForm.fields.email.key}
                                        name={emailVarificationForm.fields.email.name} />

                                    <button
                                        className="w-full h-12 bg-sky-500 text-white rounded-2xl shadow-xl shadow-sky-800 hover:bg-sky-600 flex justify-center items-center font-bold"
                                        type="submit"
                                        disabled={emailVarificationForm.isPending}
                                    >
                                        {emailVarificationForm.isPending ? "pending..." : "verify email"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Phone Verify */}
                        <div className="w-1/4 flex justify-center items-center">
                            {phoneNumberConfirmed ? (
                                <p className="bg-lime-400 px-5 py-2 rounded-xl shadow-xl shadow-lime-700 text-center w-full h-12 flex justify-center items-center">
                                    phone confirmed
                                </p>
                            ) : (
                                <form
                                    className="w-full flex justify-center items-center"
                                    id={phoneVarificationForm.form.id}
                                    onSubmit={phoneVarificationForm.form.onSubmit}
                                    action={phoneVarificationForm.formAction}
                                >
                                    <input id="id" type="hidden" className="input-style text-center" defaultValue={id}
                                        key={phoneVarificationForm.fields.id.key}
                                        name={phoneVarificationForm.fields.id.name} />
                                    <input id="phone" type="hidden" className="input-style text-center" defaultValue={phoneNumber}
                                        key={phoneVarificationForm.fields.phone.key}
                                        name={phoneVarificationForm.fields.phone.name} />
                                    <button
                                        className="w-full h-12 bg-sky-500 text-white rounded-2xl shadow-xl shadow-sky-800 hover:bg-sky-600 flex justify-center items-center font-bold"
                                        type="submit"
                                        disabled={phoneVarificationForm.isPending}
                                    >
                                        {phoneVarificationForm.isPending ? "pending..." : "verify phone"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Two Step Enable */}
                        <div className="w-1/4 flex justify-center items-center">
                            <form
                                className="w-full flex justify-center items-center"
                                id={twoStepEnable.form.id}
                                onSubmit={twoStepEnable.form.onSubmit}
                                action={twoStepEnable.formAction}
                            >
                                <input id="id" type="hidden" defaultValue={id}
                                    key={twoStepEnable.fields.id.key}
                                    name={twoStepEnable.fields.id.name} />
                                <button
                                    className="w-full h-12 bg-sky-500 text-white rounded-2xl shadow-xl shadow-sky-700
                                     hover:bg-sky-600 flex justify-center items-center font-bold cursor-pointer
                                     "
                                    type="submit"
                                    disabled={twoStepEnable.isPending}
                                >
                                    {twoStepEnable.isPending ? "pending..." : `${twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}`}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            {forgetMessage.showOtpModal && (
                <VerifyModal
                    key={forgetMessage.modalVersion}       // ← مهم‌ترین بخش
                    showOtpModal={forgetMessage.showOtpModal}
                    expiresAt={forgetMessage.expiresAt}
                    phoneNumber={forgetMessage.identifier}
                />
            )}
        </div >
    );
}
