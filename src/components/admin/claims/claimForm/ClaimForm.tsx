"use client"
import Toast from '@/components/share/toast/Toast';
import { useCustomForm } from '@/hooks/useCustomForm';
import { addClaimAction } from '@/identityUser/helper/claimsAction';
import { claimsSchema } from '@/identityUser/validation/claimsValidation';
import '@/style/site/signIn/signIn.css'



export default function ClaimForm() {
    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action: addClaimAction,
        schema: claimsSchema(),
        showToast: true,
    });


    return (
        <div className="formBody  bg-white/10  rounded-2xl w-full">
            <div className="form-style">
                <h2 className="form-title">Add New Claims </h2>
                {toastVisible && (
                    <Toast text={"New Claim add successfully"} />

                )}
                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                    <div className="input-group">
                        <label htmlFor="claimType" className="block text-sm"> claimType</label>
                        <input id='claimType' type="text" className="input-style" dir='ltr'
                            key={fields.claimType.key}
                            name={fields.claimType.name} />
                        {fields.claimType.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.claimType.errors}</p>
                        }
                    </div>
                    <div className="input-group">
                        <label htmlFor="claimValue" className="block text-sm"> claimValue</label>
                        <input id='claimValue' type="text" className="input-style" dir='ltr'
                            key={fields.claimValue.key}
                            name={fields.claimValue.name} />
                        {fields.claimValue.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.claimValue.errors}</p>
                        }
                    </div>
                    <div className="input-group">
                        <label htmlFor="description" className="block text-sm">description</label>
                        <input id='description' type="text" className="input-style"
                            key={fields.description.key}
                            name={fields.description.name} />
                        {fields.description.errors &&
                            <p className=' text-md bg-red-300/50 backdrop-blur-2xl  mt-5 p-1 inline-block rounded-2xl'>{fields.description.errors}</p>
                        }
                    </div>

                    <div className="w-full flex flex-row justify-center items-center ">
                        <button className="w-1/2 formButton   "
                            disabled={isPending}>
                            {isPending ? "Sending..." : "Add Claims"}
                        </button>
                    </div>


                </form>
            </div>
        </div>
    )
}

