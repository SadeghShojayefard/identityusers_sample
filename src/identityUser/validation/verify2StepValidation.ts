
import { z } from 'zod';

export const verify2StepSchema = () => {
    return z.object({
        username: z
            .string(),
        token: z
            .string(),
        remember: z
            .string()
            .optional()
            .transform(val => val === "on"),
        emailOrOTP: z
            .string()
            .optional()
            .transform(val => val === "on"),
    })
};

