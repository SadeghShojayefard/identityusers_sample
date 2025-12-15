// File: src/components/OtpModal.tsx
"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomForm } from "@/hooks/useCustomForm";
import { canUserSignInAction, signInFailedAction, signInSuccessAction, verifyPhoneForLoginFormAction } from "@/identityuser/helper/signInAction";
import { otpValidationSchema } from "@/identityuser/validation/otpValidation";
import { hasPayload } from "@/type/actionType.type";
import { signIn } from "next-auth/react";

interface OtpModalProps {
    showOtpModal: boolean;
    expiresAt: number; // in ms
    phoneNumber: string,
    username: string,
    rememberMe: boolean,
}

export default function OTPLoginModal({ showOtpModal, expiresAt, phoneNumber, username, rememberMe }: OtpModalProps) {
    const [open, setOpen] = useState(showOtpModal);
    const [statusMessage, setStatusMessage] = useState("");
    const [resultMessage, setResultMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);


    const [countdown, setCountdown] = useState(Math.floor(expiresAt / 1000));
    const router = useRouter();

    const { form, fields, formAction, isPending, lastResult } = useCustomForm({
        action: verifyPhoneForLoginFormAction,
        schema: otpValidationSchema(),
        showToast: false,
        id: "verify-phone-form",
        locale: "en"
    });

    useEffect(() => {
        setOpen(showOtpModal);
    }, [showOtpModal]);

    // Countdown handler
    useEffect(() => {
        if (!open) return;
        if (countdown <= 0) {
            setStatusMessage("OTP expired. Please request a new one.");
            return;
        }

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatusMessage("OTP expired. Please request a new one.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open, countdown]);

    // Auto close when expired
    useEffect(() => {
        if (countdown === 0) {
            setTimeout(() => setOpen(false), 2000);
        }
    }, [countdown]);


    // reset countdown whenever expiresAt changes
    useEffect(() => {
        if (typeof expiresAt !== "number") return;
        if (expiresAt > 0) {
            setCountdown(Math.floor(expiresAt / 1000));
            setStatusMessage("");
            setShowErrorMessage(false);
            setResultMessage("");
        } else {
            setCountdown(0);
            setStatusMessage("OTP expired. Please request a new one.");
        }
    }, [expiresAt]);

    // change the countdown handler useEffect to not depend on countdown itself (so it restarts correctly):
    useEffect(() => {
        if (!open) return;
        if (countdown <= 0) {
            setStatusMessage("OTP expired. Please request a new one.");
            return;
        }

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatusMessage("OTP expired. Please request a new one.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open, /* NOTE: countdown not included here so it doesn't recreate unnecessarily */]);

    useEffect(() => {
        if (hasPayload(lastResult)) {
            if (lastResult.status === "error") {
                setResultMessage(lastResult.payload?.message);
                setShowErrorMessage(true);
            }
            else if (lastResult.status === "success" && username != "") {
                const { phoneNumber, otp } = lastResult.payload;
                (async () => {
                    const logInAllow = await canUserSignInAction(username);

                    if (logInAllow?.status === "success") {
                        const res = await signIn("credentials_mobile_otp", {
                            phoneNumber,
                            otp,
                            rememberMe,
                            redirect: false,
                            callbackUrl: `/en/account/profile/${username}`,

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

                            router.push(res.url || `/en/account/profile/${username}`);

                        } else if (res?.error) {
                            await signInFailedAction(username);
                            setShowError(true);
                            setError(res.error);
                        }
                    }
                })();


            }
        }
    }, [lastResult]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] max-h-[95vh] overflow-auto bg-white ">
                <DialogHeader className="w-full text-right">
                    <DialogTitle className="w-full text-center">Confirm Code</DialogTitle>
                    <DialogDescription className="w-full text-left">
                        Please enter the verification code sent to your phone.
                    </DialogDescription>
                </DialogHeader>

                <form id={form.id} onSubmit={form.onSubmit} action={formAction} className="flex flex-col w-full mt-5">

                    <div className="input-group">

                        <input
                            key={fields.phoneNumber.key}
                            name={fields.phoneNumber.name}
                            id="phoneNumber"
                            type="hidden"
                            defaultValue={phoneNumber}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            key={fields.otp.key}
                            name={fields.otp.name}
                            id="otp"
                            type="text"
                            className="input-style"
                            dir="ltr"
                        />

                        {fields.otp.errors && (
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.otp.errors}
                            </p>
                        )}
                    </div>
                    {
                        showSuccessMessage &&
                        <p className="text-sm text-black-700 bg-lime-400 px-4 py-2 rounded-xl mb-2">
                            {successMessage}
                        </p>
                    }

                    {countdown > 0 && (
                        <p className="text-sm text-gray-700 mb-2">
                            Time remaining: {countdown} seconds
                        </p>
                    )}

                    {statusMessage && (
                        <p className="text-sm text-red-600 mb-2">{statusMessage}</p>
                    )}

                    {showErrorMessage && (
                        <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                            {resultMessage}
                        </p>
                    )}
                    {showError && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">
                            {error}
                        </p>
                    )}

                    <DialogFooter className="mt-4 flex justify-center gap-2">
                        <Button className=" bg-teal-600 text-white p-2  rounded-2xl 
                          hover:bg-teal-800 cursor-pointer
                        " type="submit"
                            disabled={isPending}
                        >
                            {isPending ? 'Sending...' : "Confirm"}
                        </Button>

                        <DialogClose asChild>
                            <Button
                                type="button"
                                className="bg-red-200 p-2 rounded-2xl backdrop-blur-2xl shadow-red-200 shadow hover:bg-red-400 cursor-pointer"
                            >
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    );
}
