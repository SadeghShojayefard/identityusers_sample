// File: src/components/EditModal.tsx
"use client"
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { EditModalType } from "@/type/EditModalType.type";
import { useCustomForm } from "@/hooks/useCustomForm";
import Toast from "@/components/share/toast/Toast";

const EditModal: React.FC<EditModalType> = ({
    title,
    text,
    buttonText,
    isUpdate,
    children,
    action,
    schema,
}) => {
    const [open, setOpen] = useState(false);

    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action,
        schema,
        showToast: true,
        id: `update-form-${title}`, // Unique id for each modal
    });
    // Close the modal when toast is displayed.
    useEffect(() => {
        if (toastVisible) {
            isUpdate();
            setOpen(false); // Close the modal.
        }
    }, [toastVisible]);

    return (
        <>
            {toastVisible && <Toast text="data edit successfully" />}


            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger asChild>
                    <button className="formButton">{buttonText}</button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px] max-h-[95vh] overflow-auto bg-white/10 backdrop-blur-sm" >
                    <DialogHeader className="w-full text-right">
                        <DialogTitle className="w-full text-center">{title}</DialogTitle>
                        <DialogDescription className="w-full text-left">{text}</DialogDescription>
                    </DialogHeader>
                    <form className="flex flex-col w-full mt-5" id={form.id} action={formAction} onSubmit={form.onSubmit}>
                        {children(fields)}
                        <DialogFooter className="mt-10 flex flex-row justify-center items-center gap-2 w-full">
                            <Button type="submit" className="formButton" disabled={isPending}>
                                {isPending ? "Sending..." : "Edit"}
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    className="bg-red-200 p-2 rounded-2xl backdrop-blur-2xl shadow-red-200 shadow hover:bg-red-400 cursor-pointer"
                                >
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EditModal;

