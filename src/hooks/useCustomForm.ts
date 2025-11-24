"use client"

// File: src/hooks/useCustomForm.ts
import { useActionState, useEffect, useState } from 'react';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import type { ActionResult } from '@/type/actionType.type';

import type { ZodSchema } from 'zod';

interface UseCustomFormProps {
    action: (prevState: unknown, formData: FormData) => Promise<ActionResult>;
    schema: ZodSchema;
    showToast?: boolean;
    id?: string;
    locale?: string;
}

export function useCustomForm({
    action,
    schema,
    showToast = false,
    id = 'form',
    locale = "en",
}: UseCustomFormProps) {
    const wrappedAction = async (prevState: unknown, formData: FormData) => {
        if (locale) {
            formData.append("locale", locale);
        }
        return action(prevState, formData);
    };

    const [lastResult, formAction, isPending] = useActionState<
        ActionResult,
        FormData
    >(wrappedAction, undefined);

    const [form, fields] = useForm({
        id,
        lastResult,

        onValidate({ formData }) {
            return parseWithZod(formData, { schema });
        },
        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
    });

    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (showToast && lastResult?.status === 'success') {
            setToastVisible(true);
            const timer = setTimeout(() => setToastVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastResult, showToast]);

    return { form, fields, lastResult, formAction, isPending, toastVisible, setToastVisible };
}


