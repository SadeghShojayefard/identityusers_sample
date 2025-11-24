"use client"
import Toast from '@/components/share/toast/Toast';
import { roleAddAction } from '@/identityUser/helper/roleAction';
import { useCustomForm } from '@/hooks/useCustomForm';
import '@/style/site/signIn/signIn.css'
import { claimType } from '@/type/claimType.type';
import { userRoleSchema } from '@/identityUser/validation/userRoleValidation';
import { useState } from 'react';

export default function UserRolesForm(
    { claims }: {
        claims: claimType[] | []
    }
) {
    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action: roleAddAction,
        schema: userRoleSchema(),
        showToast: true,
    });

    //  Maintain selected IDs
    const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

    // When a single checkbox is changed
    const handleCheckboxChange = (id: string) => {
        setSelectedClaims(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    //  Select or deselect all
    const handleSelectAll = () => {
        if (selectedClaims.length === claims.length) {
            setSelectedClaims([]); // Cancel All
        } else {
            setSelectedClaims(claims.map(c => c.id)); // Select All
        }
    };

    return (
        <div className="formBody bg-white/10 rounded-2xl w-full" dir='ltr'>
            <div className="form-style">
                <h2 className="form-title">ADD NEW ROLES</h2>

                {toastVisible && <Toast text={"New Role Add Successfully"} />}

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                    <div className="input-group">
                        <label htmlFor="name" className="block text-sm">name</label>
                        <input id='name' type="text" className="input-style"
                            key={fields.name.key}
                            name={fields.name.name} />
                        {fields.name.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.name.errors}
                            </p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="description" className="block text-sm">description</label>
                        <input id='description' type="text" className="input-style" dir='ltr'
                            key={fields.description.key}
                            name={fields.description.name} />
                        {fields.description.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.description.errors}
                            </p>}
                    </div>

                    <hr />
                    <p className='text-2xl font-bold my-2 pl-5'>Choose Role Claims</p>

                    {/*  Select All checkbox */}
                    <div className="mb-3">
                        <input
                            type="checkbox"
                            id="selectAll"
                            checked={selectedClaims.length === claims.length && claims.length > 0}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="selectAll" className='ml-2 font-semibold'>Select All</label>
                    </div>

                    {/* Checkbox list */}
                    {claims.map(claim => (
                        <div key={claim.id} className='flex items-center gap-2'>
                            <input
                                type="checkbox"
                                id={claim.id}
                                checked={selectedClaims.includes(claim.id)}
                                onChange={() => handleCheckboxChange(claim.id)}
                                name="claims"
                                value={claim.id}
                            />
                            <label htmlFor={claim.id}>{claim.description}</label>
                        </div>
                    ))}

                    <div className="w-full flex flex-row justify-center items-center mt-5">
                        <button className="w-1/2 formButton" disabled={isPending}>
                            {isPending ? "Sending ..." : "Add Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
