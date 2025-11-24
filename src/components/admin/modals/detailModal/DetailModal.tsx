
"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import Image from "next/image";
import { DetailModalType } from "@/type/DetailModalType.type";

const DetailModal: React.FC<DetailModalType> = ({ title, children, action }) => {

    const [open, setOpen] = useState(false);
    const [hasRun, setHasRun] = useState(false); // To be executed only once.

    useEffect(() => {
        if (open && action && !hasRun) {
            action.action(action.data);
            action.onSuccess();
            setHasRun(true);
        }
    }, [open]);

    return (

        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <button className="formButton">
                    Details
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[95vh] overflow-auto bg-white/10 backdrop-blur-sm text-wrap mt-2 w-full  ">
                <DialogHeader className="text-center">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
                <DialogFooter className="">
                    <DialogClose asChild>
                        <div className="w-full flex flex-row items-center justify-start">
                            <Button type="button" className="bg-red-200 hover:bg-red-400 cursor-pointer " >
                                close
                            </Button>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}
export default DetailModal;