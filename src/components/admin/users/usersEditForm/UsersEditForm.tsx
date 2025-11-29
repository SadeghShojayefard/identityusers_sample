"use client"
import Toast from '@/components/share/toast/Toast';
import { UserUpdateAction } from '@/identityuser/helper/userAction';
import { useCustomForm } from '@/hooks/useCustomForm';
import '@/style/site/signIn/signIn.css'
import { claimType } from '@/type/claimType.type';
import { userEditType } from '@/type/UserEditType.type';
import { usersEditSchema } from '@/identityuser/validation/usersEditValidation';
import { useState } from 'react';

export default function UsersEditForm(
    { claims, roles, user }: {
        claims: claimType[] | [];
        roles: { id: string; name: string; }[] | [];
        user: userEditType;
    }
) {
    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action: UserUpdateAction,
        schema: usersEditSchema(),
        showToast: true,
    });

    //  Maintain selected Claims IDs
    const userClaims = user.claims;

    const [selectedClaims, setSelectedClaims] = useState<string[]>(() =>
        userClaims.map((c) => c.claimID)
    );
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
                <h2 className="form-title">EDIT USERS</h2>

                {toastVisible && <Toast text={"New User Add Successfully"} />}

                <form className="form-group" id={form.id} onSubmit={form.onSubmit} action={formAction}>

                    <div className="input-group">
                        <input id='id' type="hidden" className="input-style"
                            key={fields.id.key}
                            name={fields.id.name}
                            defaultValue={user.id}
                        />
                    </div>

                    <div className="input-group">
                        <input id='concurrencyStamp' type="hidden" className="input-style"
                            key={fields.concurrencyStamp.key}
                            name={fields.concurrencyStamp.name}
                            defaultValue={user.concurrencyStamp}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="username" className="block text-sm">username</label>
                        <input id='username' type="text" className="input-style"
                            key={fields.username.key}
                            name={fields.username.name}
                            defaultValue={user.username}
                        />
                        {fields.username.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.username.errors}
                            </p>}
                    </div>
                    <div className="input-group">
                        <label htmlFor="name" className="block text-sm">name</label>
                        <input id='name' type="text" className="input-style"
                            key={fields.name.key}
                            name={fields.name.name}
                            defaultValue={user.name}
                        />
                        {fields.name.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.name.errors}
                            </p>}
                    </div>


                    <div className="input-group">
                        <label htmlFor="email" className="block text-sm">email</label>
                        <input id='email' type="email" className="input-style"
                            key={fields.email.key}
                            name={fields.email.name}
                            defaultValue={user.email} />
                        {fields.email.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.email.errors}
                            </p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="emailConfirmed" className="block text-sm">emailConfirmed </label>
                        <select name="emailConfirmed" id="emailConfirmed" className="input-style" defaultValue={user.emailConfirmed.toString()} >
                            <>
                                <option value="true" className='bg-blue-200' >true</option>
                                <option value="false" className='bg-blue-200'>false</option>
                            </>
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="phoneNumber" className="block text-sm">phoneNumber</label>
                        <input id='phoneNumber' type="text" className="input-style"
                            key={fields.phoneNumber.key}
                            name={fields.phoneNumber.name}
                            defaultValue={user.phoneNumber}
                        />
                        {fields.phoneNumber.errors &&
                            <p className='text-md bg-red-300/50 backdrop-blur-2xl mt-5 p-1 inline-block rounded-2xl'>
                                {fields.phoneNumber.errors}
                            </p>}
                    </div>


                    <div className="input-group">
                        <label htmlFor="phoneNumberConfirmed" className="block text-sm">Phone Number Confirmed</label>
                        <select name="phoneNumberConfirmed" id="phoneNumberConfirmed" className="input-style" defaultValue={user.phoneNumberConfirmed.toString()} >

                            <option value="true" className='bg-blue-200' >true</option>
                            <option value="false" className='bg-blue-200'>false</option>

                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="accessFailedCount" className="block text-sm">accessFailedCount</label>
                        <input id='accessFailedCount' type="number" className="input-style"
                            key={fields.accessFailedCount.key}
                            name={fields.accessFailedCount.name}
                            defaultValue={user.accessFailedCount} />

                    </div>





                    <div className="input-group">
                        <label htmlFor="role" className="block text-sm">Choose Role</label>

                        <select name="role" id="role" className="input-style" defaultValue={user.roles.length > 0 ? user.roles[0].roleId : "false"}>
                            <option key={"1"} id={"1"} value="false" className='bg-blue-200' >No Rule</option>
                            {roles.map(item => (

                                <option key={item.id} id={item.id} value={item.id} className='bg-blue-200' >{item.name}</option>

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
                            {isPending ? "Sending ..." : "EDIT User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
