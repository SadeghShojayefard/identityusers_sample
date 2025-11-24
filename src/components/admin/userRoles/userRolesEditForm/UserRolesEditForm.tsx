"use client"
import Toast from '@/components/share/toast/Toast';
import { roleUpdateAction } from '@/identityUser/helper/roleAction';
import { useCustomForm } from '@/hooks/useCustomForm';
import '@/style/site/signIn/signIn.css'
import { claimType, roleType } from '@/type/claimType.type';
import { userRoleUpdateSchema } from '@/identityUser/validation/userRoleUpdateValidation';
import { useEffect, useState } from 'react';

export default function UserRolesEditForm(
    { claims, role }: {
        claims: claimType[] | [];
        role: roleType;
    }
) {

    const roleClaims = role.claims;

    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action: roleUpdateAction,
        schema: userRoleUpdateSchema(),
        showToast: true,
    });

    // Initial value of selectedClaims based on role.claims
    const [selectedClaims, setSelectedClaims] = useState<string[]>(() =>
        roleClaims.map((c) => c.id)
    );

    useEffect(() => {
        setSelectedClaims(roleClaims.map((c) => c.id));
    }, [roleClaims]);

    const handleCheckboxChange = (id: string) => {
        setSelectedClaims(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedClaims.length === claims.length) {
            setSelectedClaims([]); // Cancel all
        } else {
            setSelectedClaims(claims.map(c => c.id)); // Select all
        }
    };

    return (
        <div className="formBody bg-white/10 rounded-2xl w-full" dir='ltr'>
            <div className="form-style" >
                <h2 className="form-title">EDIT ROLES</h2>

                {toastVisible && <Toast text={"New Role Add Successfully"} />}

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                    <div className="input-group">
                        <input id='id' type="hidden"
                            key={fields.id.key}
                            name={fields.id.name}
                            defaultValue={role.id}
                        />
                        <input id='concurrencyStamp' type="hidden"
                            key={fields.concurrencyStamp.key}
                            name={fields.concurrencyStamp.name}
                            defaultValue={role.concurrencyStamp}
                        />

                        <label htmlFor="name" className="block text-sm">name</label>
                        <input id='name' type="text" className="input-style"
                            key={fields.name.key}
                            name={fields.name.name}
                            defaultValue={role.name} />
                        {fields.name.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.name.errors}
                            </p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="description" className="block text-sm">description</label>
                        <input id='description' type="text" className="input-style" dir='ltr'
                            key={fields.description.key}
                            name={fields.description.name}
                            defaultValue={role.description} />
                        {fields.description.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.description.errors}
                            </p>}
                    </div>

                    <hr />
                    <p className='text-2xl font-bold my-2 pl-5'>Choose Role Claims</p>


                    {/* Select All checkbox */}
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
                            {isPending ? "Sending ..." : "Edit Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
