
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
import { deleteClaimsAction, getClaimsAction, updateClaimsAction } from "@/identityuser/helper/claimsAction";
import DeleteModal from "../../modals/deleteModal/DeleteModal";
import { useEffect, useState } from "react";
import EditModal from "../../modals/editModal/EditModal";
import EditModalInput from "../../modals/editModalInput/EditModalInput";
import { updateClaimsSchema } from "@/identityuser/validation/updateClaimsValidation";


export default function ClaimTable({ editClaim, deleteClaim }: { editClaim: boolean, deleteClaim: boolean }) {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [claimDetail, setClaimDetail] = useState({});



    useEffect(() => {
        async function fetchClaims() {
            try {
                const { status, payload } = await getClaimsAction();
                if (status === "success") {
                    setClaims(payload);
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
        setClaimDetail(prev => ({
            ...prev,
            [id]: value
        }));
    }

    if (loading) {
        return <div>Loading claims...</div>;
    }
    return (
        <div className="w-full  flex flex-col justify-center items-center gap-2 
         text-start  pb-5 shadow-2xl shadow-black rounded-2xl px-2 mt-5 bg-transparent">
            <b className="w-full p-1 font-bold text-2xl">Claims Table </b>
            <Table className="w-full shadow-lg shadow-black ">
                <TableHeader className=" shadow-lg shadow-black">
                    <TableRow  >
                        <TableHead className="text-left text-xl font-bold " >Line</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Claim Type</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Claim Value</TableHead>
                        <TableHead className="text-left text-xl font-bold" >Description</TableHead>
                        <TableHead className="text-center text-xl font-bold" >Operation</TableHead>

                    </TableRow>
                </TableHeader>
                <TableBody>
                    {claims.length > 0 ? (
                        claims.map((item, index) => (
                            <TableRow key={item.id} className="shadow-lg shadow-black hover:bg-cyan-900 hover:text-white">
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{item.claimType}</TableCell>
                                <TableCell>{item.claimValue}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="flex flex-row flex-wrap justify-center items-center gap-2 ">

                                    {/* claim update------------------------------------------------ */}
                                    {
                                        editClaim &&
                                        (
                                            <EditModal
                                                title="Edit Claim"
                                                text={`Are you sure you want Edit ${item.claimType}/${item.claimValue} Claim?`}
                                                isUpdate={handlePageChange}
                                                buttonText="Edit"
                                                action={updateClaimsAction}
                                                schema={updateClaimsSchema()}
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
                                                            inputType="text"
                                                            onUpdateInputs={handleUpdateInputs}
                                                            value={item.claimType}
                                                            placeholder="claimType."
                                                            id="claimType"
                                                            fieldKey="claimType"
                                                            fields={fields}
                                                        />
                                                        <EditModalInput
                                                            inputType="text"
                                                            onUpdateInputs={handleUpdateInputs}
                                                            value={item.claimValue}
                                                            placeholder="claimValue"
                                                            id="claimValue"
                                                            fieldKey="claimValue"
                                                            fields={fields}
                                                        />
                                                        <EditModalInput
                                                            inputType="text"
                                                            onUpdateInputs={handleUpdateInputs}
                                                            value={item.description}
                                                            placeholder="description"
                                                            id="description"
                                                            fieldKey="description"
                                                            fields={fields}
                                                        />

                                                    </>
                                                )}
                                            </EditModal>
                                        )
                                    }
                                    {
                                        deleteClaim &&
                                        (
                                            <DeleteModal
                                                title="Delete Claim"
                                                text={`Are you sure you want delete ${item.claimType}/${item.claimValue} Claim?`}
                                                buttonText="Delete"
                                                itemId={item.id}
                                                action={deleteClaimsAction}
                                                onSuccess={handlePageChange}
                                            />
                                        )
                                    }


                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                no Claim find
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

            </Table>
        </div>
    )
}

