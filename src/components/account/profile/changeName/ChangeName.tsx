"use client"

import { useCustomForm } from "@/hooks/useCustomForm";
import { changeNameAction } from "@/identityuser/helper/userAction";
import { changeNameSchema } from "@/identityuser/validation/changeNameValidation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ChangeName: React.FC<{
    username: string;
    locale: string;
    name: string;
    ccs: string;
}> = ({ username, locale, name, ccs }) => {

    const [currentName, setCurrentName] = useState(name);
    const { form, fields, formAction, isPending, toastVisible, lastResult } = useCustomForm({
        action: changeNameAction,
        schema: changeNameSchema(),
        showToast: true,
        id: "change-name-form"
    });

    const { update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (lastResult?.status === 'success') {
            (async () => {
                try {
                    const res = await fetch('/api/session/update');
                    if (!res.ok) {
                        console.error("session update api failed");
                        return;
                    }

                    const json = await res.json();

                    if (json.status === 'success' && json.user) {
                        // Create user object for update 
                        setCurrentName(json.user.name)
                        const updatedSessionData = {
                            user: {
                                id: json.user.id,
                                username: json.user.username,
                                name: json.user.name,
                                email: json.user.email,
                                phoneNumber: json.user.phoneNumber,
                                avatar: json.user.avatar,
                                securityStamp: json.user.securityStamp,
                                roles: json.user.roles ?? [],
                                claims: json.user.claims ?? [],
                                emailConfirmed: json.user.emailConfirmed,
                                phoneNumberConfirmed: json.user.phoneNumberConfirmed,
                                twoFactorEnabled: json.user.twoFactorEnabled,
                            }

                        };

                        // call session update 
                        const result = await update(updatedSessionData);
                        if (result) {
                            router.refresh();
                            setTimeout(() => window.location.reload(), 3000);
                        }

                    } else {
                        console.error('Session update API responded with error:', json);
                    }
                } catch (error) {
                    console.error('Error updating session:', error);
                }
            })();
        }
    }, [lastResult]);
    return (

        <div className="w-full  flex flex-row flex-wrap justify-evenly items-center gap-2  p-2  shadow-xl shadow-black rounded-xl  mt-5 ">
            <b className="font-bold text-lg text-black text-shadow-xs text-shadow-black text-start w-full"></b>

            <div className="w-full p-10 flex items-center justify-start text-black z-10 shadow-2xl shadow-black  bg-white/10 rounded-2xl ">
                <div className="form-style w-full ">
                    <h2 className="form-title">Change Name   </h2>

                    {toastVisible && (
                        <p className=" bg-sky-500 backdrop-blur-2xl text-white px-5 py-2  rounded-lg mt-2
                             transition-all duration-300 ease-in-out transform shadow-xl shaodw-black text-center">Name changed successfully</p>
                    )}
                    <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                        <input id="username" type="hidden" className="input-style text-center" defaultValue={username}
                            key={fields.username.key}
                            name={fields.username.name} />
                        <input id="ccs" type="hidden" className="input-style text-center" defaultValue={ccs}
                            key={fields.ccs.key}
                            name={fields.ccs.name} />

                        <div className="input-group">
                            <label htmlFor="name" className="block text-sm">New Name </label>
                            <input id="name" type="text" className="input-style text-center"
                                key={fields.name.key}
                                name={fields.name.name}
                                defaultValue={currentName}
                            />
                            {fields.name.errors &&
                                <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.name.errors}</p>
                            }
                        </div>

                        <div className="w-full flex flex-row justify-center items-center ">
                            <button className="w-1/2  bg-sky-500 backdrop-blur-2xl text-white p-2 mt-4 rounded-2xl cursor-pointer
                             shadow-xl  shadow-sky-800 
                               hover:hover:bg-sky-600 hover:backdrop-blur-2xl text-wrap font-bold  "
                                type="submit"
                                disabled={isPending}
                            >

                                {isPending ? 'pending...' : "Change Name"}

                            </button>
                        </div>


                    </form>
                </div>
            </div>

        </div>
    );
}
export default ChangeName;


