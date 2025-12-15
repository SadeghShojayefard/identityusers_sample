
import { z } from 'zod';

export const signInOTPSchema = () => {
    return z.object({
        phoneNumber: z
            .string({ required_error: "Please fill the phoneNumber field first" })
            .min(5, { message: "phoneNumber field should at least have 5 character" })
            .max(20, { message: "phoneNumber field should at most have 20 character." }),
        rememberMe: z
            .string()
            .optional()
            .transform(val => val === "on"),
    });
};
