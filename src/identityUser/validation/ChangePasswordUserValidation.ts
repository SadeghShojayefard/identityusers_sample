
import { z } from 'zod';

export const ChangePasswordUserShema = () => {
    return z.object({
        id: z.string(),
        password: z
            .string({ required_error: "Please fill the Password field first" })
            .min(8, { message: "Password field should at least have 8 character" })
            .max(20, { message: "Password field should at most have 20 character." })
            .regex(/[A-Z]/, "One uppercase letter required")
            .regex(/[a-z]/, "One lowercase letter required")
            .regex(/[0-9]/, "One number required")
            .regex(/[^A-Za-z0-9]/, "One special character required"),
    })
};
