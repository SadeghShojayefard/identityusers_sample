"use client"
import Toast from '@/components/share/toast/Toast';
import { AddUserAction } from '@/identityuser/helper/userAction';
import { useCustomForm } from '@/hooks/useCustomForm';
import '@/style/site/signIn/signIn.css'
import { claimType } from '@/type/claimType.type';
import { usersAddSchema } from '@/identityuser/validation/usersAddValidation';
import { useState } from 'react';

export default function UsersAddForm(
    { claims, roles }: {
        claims: claimType[] | [];
        roles: { id: string; name: string; }[] | [];
    }
) {

    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action: AddUserAction,
        schema: usersAddSchema(),
        showToast: true,
    });

    //  Maintain selected Claims IDs
    const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

    //  When a single checkbox is changed
    const handleCheckboxChange = (id: string) => {
        setSelectedClaims(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Select or deselect all
    const handleSelectAll = () => {
        if (selectedClaims.length === claims.length) {
            setSelectedClaims([]); // deselect all
        } else {
            setSelectedClaims(claims.map(c => c.id)); //  Select All
        }
    };

    return (
        <div className="formBody bg-white/10 rounded-2xl w-full" >
            <div className="form-style w-full">
                <h2 className="form-title">ADD NEW USERS</h2>

                {toastVisible && <Toast text={"New User Add Successfully"} />}

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>
                    <div className="input-group">
                        <label htmlFor="username" className="block text-sm">Username</label>
                        <input id='username' type="text" className="input-style"
                            key={fields.username.key}
                            name={fields.username.name} />
                        {fields.username.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.username.errors}
                            </p>}
                    </div>
                    <div className="input-group">
                        <label htmlFor="email" className="block text-sm">email</label>
                        <input id='email' type="email" className="input-style"
                            key={fields.email.key}
                            name={fields.email.name} />
                        {fields.email.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.email.errors}
                            </p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="block text-sm">Password</label>
                        <input id='password' type="password" className="input-style"
                            key={fields.password.key}
                            name={fields.password.name} />
                        {fields.password.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.password.errors}
                            </p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="role" className="block text-sm">Choose Role</label>

                        <select name="role" id="role" className="input-style" >
                            <option id={"noId"} value="false" className='bg-blue-200'>No Rule</option>
                            {roles.map(role => (
                                <option id={role.id} value={role.id} className='bg-blue-200'>{role.name}</option>

                            ))}
                        </select>
                    </div>

                    <hr />
                    <p className='text-2xl font-bold my-2 pl-5'>Choose Claims For User</p>

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
                            {isPending ? "Sending ..." : "Add User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
