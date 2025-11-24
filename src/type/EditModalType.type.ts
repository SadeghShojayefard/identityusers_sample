
import { ZodSchema } from 'zod';
import { ActionResult } from '@/Type/actionType.type';
import { ReactNode } from 'react';

export interface Field {
    name: string;
    key: string | undefined;
    errors?: string[];
}

export interface FormFields {
    [key: string]: Field;
}

export interface EditModalType {
    title: string;
    text: string;
    buttonText: string;
    isUpdate: () => void;
    children: (fields: FormFields) => ReactNode;
    action: (prevState: unknown, formData: FormData) => Promise<ActionResult>;
    schema: ZodSchema;
}