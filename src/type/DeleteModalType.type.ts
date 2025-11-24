import { ActionResult } from "./actionType.type";

export type DeleteModalType = {
    title: string;
    text: string;
    buttonText: string;
    itemId: string;
    action: (prevState: unknown, formData: FormData) => Promise<ActionResult>;
    onSuccess: () => void;
};

