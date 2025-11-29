"use client"
import { canUserSignInAction, signInFailedAction, signInFormAction, signInSuccessAction } from "@/identityuser/helper/signInFormAction";
import { SignInSchema } from "@/identityuser/validation/signInValidation";
import { useCustomForm } from "@/hooks/useCustomForm";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";



export default function ForgetForm() {

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


    return (
        <div className="formBody bg-white/30 w-full ">
            <div className="form-style w-full md:w-1/2">
                {/* flex flex-row items-center justify-center */}
                <h2 className="form-title">Forget Password</h2>
                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>

                    <div className="input-group">
                        <label htmlFor="email_phone" className="block text-sm">Please Input valid Email/Phone Number</label>
                        <input
                            key={fields.email_phone.key}
                            name={fields.email_phone.name}
                            id="email_phone"
                            type="text"
                            className="input-style"
                            dir="ltr" />
                        {fields.email_phone.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.email_phone.errors}</p>
                        }
                    </div>

                    <div className="grid  grid-cols-2  flex-wrap justify-center items-center gap-2 w-full ">

                        <div className="sm:col-span-2 md:col-span-1 w-full">

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-teal-600 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer shadow-xl shadow-teal-800 hover:bg-teal-800"
                            >
                                {isPending ? 'Sending...' : "Submit"}
                            </button>
                        </div>
                        <div className="sm:col-span-2 md:col-span-1 w-full">

                            <Link
                                href={"./Signin"}
                                className="w-full bg-teal-500 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer shadow-xl shadow-teal-800 hover:bg-teal-600
                                flex flex-row justify-center items-center"
                            >
                                Remembered? Back to SignIn
                            </Link>
                        </div>


                    </div>
                </form>
            </div>
        </div>
    )
}

