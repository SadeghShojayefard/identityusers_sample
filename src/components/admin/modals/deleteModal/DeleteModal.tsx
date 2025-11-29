'use client'
import Toast from "@/components/share/toast/Toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCustomForm } from "@/hooks/useCustomForm";
import { deleteSchema } from "@/identityuser/validation/deleteValidation";
import { DeleteModalType } from "@/type/DeleteModalType.type";
import { useEffect, useState } from "react";

const DeleteModal: React.FC<DeleteModalType> = ({ title, text, buttonText, itemId, action, onSuccess }) => {
    const [open, setOpen] = useState(false);

    const { form, fields, formAction, isPending, toastVisible } = useCustomForm({
        action,
        schema: deleteSchema(),
        showToast: true,
        id: `update-form-${title}`, // Unique id for each modal
    });
    // oClose the mdal when it is displayed.
    useEffect(() => {
        if (toastVisible) {
            setOpen(false); // Close the mdal
            onSuccess();
        }
    }, [toastVisible]);
    return (
        <>
            {toastVisible && <Toast text="اطلاعات با موفقیت به‌روزرسانی شد" />}


            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger asChild>
                    <button className="formButton">{buttonText}</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white/10 backdrop-blur-sm" dir="ltr">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription className="text-left">{text}</DialogDescription>
                    </DialogHeader>
                    <form className="flex flex-col w-full mt-5" id={form.id} action={formAction} onSubmit={form.onSubmit}>
                        <input
                            type="hidden"
                            id="id"
                            name={fields.id.name}
                            defaultValue={itemId}
                            key={fields.id.key}
                            readOnly />

                        <DialogFooter className="flex flex-row w-full justify-between items-center">
                            <div className="flex flex-row w-full justify-between items-center">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        className="bg-red-200 p-2 rounded-xl backdrop-blur-2xl shadow-red-200 shadow hover:bg-red-400 cursor-pointer"
                                    >
                                        No
                                    </Button>
                                </DialogClose>

                                <Button type="submit" className="formButton">
                                    Yes
                                </Button>

                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DeleteModal;