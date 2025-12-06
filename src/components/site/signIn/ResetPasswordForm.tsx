"use client"
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";
import { hasPayload } from "@/type/actionType.type";
import { resetPasswordSchema } from "@/identityuser/validation/resetPasswordValidation";
import { useRouter } from "next/navigation";
import { resetForgetPasswordAction } from "@/identityuser/helper/signInAction";
import Toast from "@/components/share/toast/Toast";

export default function ResetPasswordForm({ token }: { token: string }) {

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { form, fields, formAction, isPending, lastResult, toastVisible } = useCustomForm({
        action: resetForgetPasswordAction,
        schema: resetPasswordSchema(),
        showToast: true,
        id: "Reset-Password-Form",
        locale: "en"
    });
    const router = useRouter();

    useEffect(() => {
        if (lastResult?.status === 'success') {
            setInterval(() => {
                router.push(`/en/signin`);
            }, 5000);
        }
        else {
            if (hasPayload(lastResult)) {
                const { message } = lastResult.payload;
                setErrorMessage(message);
                setShowError(true);
            }
        }
    }, [lastResult]);


    return (
        <div className="formBody  bg-white/10 w-full">
            <div className="form-style w-1/2">
                <h2 className="form-title">Reset Password</h2>
                {toastVisible && (
                    <Toast text={"Password Change Successfully"} />

                )}
                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                    <div className="input-group">
                        <input
                            key={fields.token.key}
                            name={fields.token.name}
                            id="token"
                            type="hidden"
                            className="input-style"
                            dir="ltr"
                            defaultValue={token}
                        />

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
                    {
                        showError &&
                        (
                            <>
                                <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl">
                                    {errorMessage}
                                </p>
                            </>
                        )
                    }
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
                            {isPending ? 'Reset password in sec...' : "Reset Password"}

                        </button>
                    </div>


                </form>
            </div>
        </div>
    )
}

