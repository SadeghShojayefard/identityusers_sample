
import { z } from 'zod';

export const forgetPasswordSchema = () => {
    return z.object({
        email_phone: z
            .string({ required_error: "Filling in the Email/Phone is required" })
            .min(5, { message: "The Email/Phone must be at least 5 characters." })
            .max(100, { message: "The Email/Phone must be a maximum of 100 characters." }),

    });
};
