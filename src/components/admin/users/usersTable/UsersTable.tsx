"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Image from "next/image";
import EditModal from "../../modals/editModal/EditModal";
import EditModalInput from "../../modals/editModalInput/EditModalInput";
import { useEffect, useState } from "react";
import { changePasswordAction, deleteUserAction, disable2FAdAction, getAllUsersAction, LockUnlockUserAction, resetPasswordAction, resetSecurityStampAction } from "@/identityuser/helper/userAction";
import DetailModal from "../../modals/detailModal/DetailModal";
import DeleteModal from "../../modals/deleteModal/DeleteModal";
import { ChangePasswordUserShema } from "@/identityuser/validation/ChangePasswordUserValidation";
import Link from "next/link";
import { deleteSchema } from "@/identityuser/validation/deleteValidation";


export default function UsersTable({ editClaim, deleteClaim, detailsClaim, passwordClaim }:
    { editClaim: boolean, deleteClaim: boolean, detailsClaim: boolean, passwordClaim: boolean }) {


    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [userDetail, setUserDetail] = useState({});

    // Retrieving data from the server
    useEffect(() => {
        async function fetchUsers() {
            try {
                const { status, payload } = await getAllUsersAction();
                if (status === "success") {
                    setUsers(payload);
                }
            } catch (error) {
                console.error("Error fetching claims:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [reload]);

    // If there was an error or no data, display an empty array.
    const handlePageChange = () => {
        setReload(!reload);
    };

    const handleUpdateInputs = (id: string, value: string) => {
        setUserDetail(prev => ({
            ...prev,
            [id]: value
        }));
    }

    if (loading) {
        return <div>Loading Users...</div>;
    }





    return (
        <div className="w-full  flex flex-col justify-center items-center gap-2 
         text-start  pb-5 shadow-2xl shadow-black rounded-2xl px-2 mt-5 bg-transparent">
            <b className="w-full p-1 font-bold text-2xl">Users List</b>
            <Table className="w-full shadow-lg shadow-black ">
                <TableHeader className=" shadow-lg shadow-black">
                    <TableRow  >
                        <TableHead className="text-left text-xl font-bold " >Line</TableHead>
                        <TableHead className="text-left text-xl font-bold" >UserName</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Email </TableHead>
                        <TableHead className="text-left text-xl font-bold" >Role</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Register Time</TableHead>
                        <TableHead className="text-center text-xl font-bold" >Operations</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                Loading ...
                            </TableCell>
                        </TableRow>
                    ) : users != null && users.length > 0 ? (
                        users.map((item, index) => (
                            <TableRow key={item.id} className=" shadow-lg shadow-black hover:bg-cyan-900 hover:text-white ">
                                <TableCell className="font-medium ">{index + 1}</TableCell>
                                <TableCell>
                                    {item.username}
                                </TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.roleName}</TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleString('en')}</TableCell>

                                <TableCell className="flex flex-row flex-wrap justify-center items-center gap-2 ">

                                    {
                                        detailsClaim &&
                                        <DetailModal title="Users Detail" action={null}>
                                            <div className="w-full flex flex-col items-center justify-start gap-2 scroll-auto">
                                                <div className="relative w-20 h-20">
                                                    <Image
                                                        src={`${item.avatar}`}
                                                        fill={true}
                                                        alt="avatar"
                                                        className="rounded-full shadow shadow-black"
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <ul className="w-full">
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                Username: <span className="font-semibold text-lg text-white">
                                                                    {item.username}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                RoleName: <span className="font-semibold text-lg text-white">
                                                                    {item.roleName}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li className="border-b-2">
                                                            <p className="font-bold text-xl ">
                                                                UserClaims:
                                                            </p>
                                                            <ul className="w-full pl-5">
                                                                {
                                                                    item.claims != null && item.claims.length > 0 &&
                                                                    (item.claims.map((claim: any) => (
                                                                        <li id={claim.id} className="font-semibold text-lg text-white">
                                                                            {claim.description}
                                                                        </li>
                                                                    )))
                                                                }
                                                            </ul>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                name: <span className="font-semibold text-lg text-white">
                                                                    {item.name}
                                                                </span>
                                                            </p>
                                                        </li>

                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                Register Time:  <span className="font-semibold text-lg text-white">
                                                                    {new Date(item.createdAt).toLocaleString('en')}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                Email:  <span className="font-semibold text-lg text-white">
                                                                    {item.email}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                emailConfirmed:  <span className="font-semibold text-lg text-white">
                                                                    {item.emailConfirmed.toLocaleString()}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                phoneNumber:    <span className="font-semibold text-lg text-white">
                                                                    {item.phoneNumber}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                phoneNumberConfirmed:  <span className="font-semibold text-lg text-white">
                                                                    {item.phoneNumberConfirmed.toLocaleString()}
                                                                </span>
                                                            </p>
                                                        </li>

                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                twoFactorEnabled: <span className="font-semibold text-lg text-white">
                                                                    {item.twoFactorEnabled.toLocaleString()}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                accessFailedCount: <span className="font-semibold text-lg text-white">
                                                                    {item.accessFailedCount}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                accessFailedCount: <span className="font-semibold text-lg text-white">
                                                                    {item.lockoutEnabled.toLocaleString()}
                                                                </span>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <p className="font-bold text-xl border-b-2">
                                                                lockoutEnd: <span className="font-semibold text-lg text-white">
                                                                    {item.lockoutEnd}
                                                                </span>
                                                            </p>
                                                        </li>
                                                    </ul>
                                                </div>


                                            </div>
                                            <ul className="w-full text-left list-disc" dir="ltr">

                                            </ul>
                                        </DetailModal>
                                    }

                                    {
                                        passwordClaim &&
                                        <EditModal
                                            title="Change Password"
                                            text="Please Enter the New Password"
                                            isUpdate={handlePageChange}
                                            buttonText="Change Password"
                                            action={resetPasswordAction}
                                            schema={ChangePasswordUserShema()}
                                        >
                                            {(fields) => (
                                                <>

                                                    <EditModalInput
                                                        inputType="hidden"
                                                        onUpdateInputs={handleUpdateInputs}
                                                        value={item.id}
                                                        placeholder=""
                                                        id="id"
                                                        fieldKey="id"
                                                        fields={fields}
                                                    />
                                                    <EditModalInput
                                                        inputType="password"
                                                        onUpdateInputs={handleUpdateInputs}
                                                        value={""}
                                                        placeholder="Enter new password"
                                                        id="password"
                                                        fieldKey="password"
                                                        fields={fields}
                                                    />
                                                </>
                                            )}
                                        </EditModal>
                                    }


                                    {
                                        editClaim &&
                                        <Link href={`./cmsUsers/editUsers/${item.id}`} target="_blank" className="formButton ">
                                            Edit
                                        </Link>
                                    }

                                    {
                                        deleteClaim &&
                                        <DeleteModal
                                            title="Remove User"
                                            text={`Are you sure you want to delete ${item.username} User?`}
                                            buttonText="delete"
                                            itemId={item.id}
                                            action={deleteUserAction}
                                            onSuccess={handlePageChange}
                                        />
                                    }

                                    {
                                        // reset session
                                        <EditModal
                                            title="Reset User Session"
                                            text={`Are you sure you want to reset ${item.username} session?`}
                                            isUpdate={handlePageChange}
                                            buttonText="Reset Session"
                                            action={resetSecurityStampAction}
                                            schema={deleteSchema()}
                                        >
                                            {(fields) => (
                                                <>

                                                    <EditModalInput
                                                        inputType="hidden"
                                                        onUpdateInputs={handleUpdateInputs}
                                                        value={item.id}
                                                        placeholder=""
                                                        id="id"
                                                        fieldKey="id"
                                                        fields={fields}
                                                    />
                                                </>
                                            )}
                                        </EditModal>
                                    }

                                    {
                                        //LockUnlockUserAction
                                        <EditModal
                                            title={`${item.lockoutEnabled ? "Unlock User" : "Lock User"}`}
                                            text={`Are you sure you want to ${item.lockoutEnabled ? "Unlock" : "Lock"} ${item.username} session?`}
                                            isUpdate={handlePageChange}
                                            buttonText={`${item.lockoutEnabled ? "Unlock" : "Lock"}`}
                                            action={LockUnlockUserAction}
                                            schema={deleteSchema()}
                                        >
                                            {(fields) => (
                                                <>

                                                    <EditModalInput
                                                        inputType="hidden"
                                                        onUpdateInputs={handleUpdateInputs}
                                                        value={item.id}
                                                        placeholder=""
                                                        id="id"
                                                        fieldKey="id"
                                                        fields={fields}
                                                    />
                                                </>
                                            )}
                                        </EditModal>
                                    }

                                    {
                                        //Disable user 2FA
                                        item.twoFactorEnabled ?
                                            (<EditModal
                                                title={"Disable User 2FA"}
                                                text={`Are you sure you want to disable 2FA of user ${item.username} `}
                                                isUpdate={handlePageChange}
                                                buttonText={"Disable 2FA"}
                                                action={disable2FAdAction}
                                                schema={deleteSchema()}
                                            >
                                                {(fields) => (
                                                    <>

                                                        <EditModalInput
                                                            inputType="hidden"
                                                            onUpdateInputs={handleUpdateInputs}
                                                            value={item.id}
                                                            placeholder=""
                                                            id="id"
                                                            fieldKey="id"
                                                            fields={fields}
                                                        />
                                                    </>
                                                )}
                                            </EditModal>)
                                            :
                                            (
                                                <p
                                                    className="bg-sky-500 backdrop-blur-2xl text-white p-2 rounded-2xl  shadow-xl
                                                     shadow-sky-800 hover:hover:bg-sky-600   text-wrap font-bold px-3"
                                                >
                                                    No 2FA
                                                </p>
                                            )
                                    }

                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center">
                                {'There is no user data to show'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

            </Table>
        </div >
    )
}
