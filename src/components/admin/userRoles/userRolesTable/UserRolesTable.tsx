"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import '@/style/site/signIn/signIn.css'
import { deleteRoleAction, getRolesAction } from "@/identityuser/helper/roleAction";
import DetailModal from "../../modals/detailModal/DetailModal";
import { useEffect, useState } from "react";
import DeleteModal from "../../modals/deleteModal/DeleteModal";
import Link from "next/link";

export default function UserRolesTable({ editClaim, deleteClaim, detailsClaim }: { editClaim: boolean, deleteClaim: boolean, detailsClaim: boolean }) {

    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [roleDetail, setRoleDetail] = useState({});

    useEffect(() => {
        async function fetchClaims() {
            try {
                const { status, payload } = await getRolesAction();
                if (status === "success") {
                    setRoles(payload);
                }
            } catch (error) {
                console.error("Error fetching claims:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchClaims();
    }, [reload]);

    const handlePageChange = () => {
        setReload(!reload);
    };

    const handleUpdateInputs = (id: string, value: string) => {
        setRoleDetail(prev => ({
            ...prev,
            [id]: value
        }));
    }

    if (loading) {
        return <div>Loading Roles...</div>;
    }
    console.log(roles);
    return (
        <div className="w-full  flex flex-col justify-center items-center gap-2 
         text-start  pb-5 shadow-2xl shadow-black rounded-2xl px-2 mt-5 bg-transparent" dir="ltr">
            <b className="w-full p-1 font-bold text-2xl">Roles Tables</b>
            <Table className="w-full shadow-lg shadow-black ">
                <TableHeader className=" shadow-lg shadow-black">
                    <TableRow  >
                        <TableHead className="text-left text-xl font-bold " >Line</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Name</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Description</TableHead>
                        <TableHead className="text-center text-xl font-bold" >Operation</TableHead>
                    </TableRow>

                </TableHeader>
                <TableBody>
                    {roles.length > 0 ? (
                        roles.map((role, index) => (
                            <TableRow key={role.id} className="shadow-lg shadow-black hover:bg-cyan-900 hover:text-white">
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{role.name}</TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell>
                                    <div className="w-full  flex flex-row flex-wrap items-center justify-center gap-2">
                                        {
                                            detailsClaim &&
                                            <DetailModal title="ClaimsList" action={null}>
                                                <ul className="w-full text-left list-disc" dir="ltr">
                                                    {role.claims && role.claims.length > 0 ? (
                                                        role.claims.map((item: any, index2: number) => (
                                                            <li key={index2}>{item.description}</li>
                                                        ))
                                                    ) : (
                                                        <p>No Claims for {role.name} role</p>
                                                    )}
                                                </ul>
                                            </DetailModal>
                                        }

                                        {
                                            editClaim &&
                                            <Link href={`./cmsRoles/editRoles/${role.id}`} target="_blank" className="formButton ">
                                                Edit
                                            </Link>
                                        }
                                        {
                                            deleteClaim &&
                                            < DeleteModal
                                                title="Remove Role"
                                                text={`Are you sure you want to delete ${role.name} role?`}
                                                buttonText="delete"
                                                itemId={role.id}
                                                action={deleteRoleAction}
                                                onSuccess={handlePageChange}
                                            />
                                        }

                                    </div>

                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">
                                هیچ نقشی یافت نشد
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

            </Table>
        </div >
    )
}

