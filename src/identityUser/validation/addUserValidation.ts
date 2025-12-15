
import { z } from 'zod';

export const addUserShema = () => {
    return z.object({
        username: z
            .string({ required_error: "Please fill the Username field first" })
            .min(5, { message: "Username field should at least have 5 character." })
            .max(20, { message: "Username field should at most have 20 character." }),
        email: z
            .string({ required_error: "Please fill the Email field first" })
            .email({ message: "Email is invalid" }),
        password: z
            .string({ required_error: "Please fill the Passworad field first" })
            .min(8, { message: "Passworad field should at least have 8 character." })
            .max(20, { message: "Passworad field should at most have 20 character." })
            .regex(/[A-Z]/, "One uppercase letter required")
            .regex(/[a-z]/, "One lowercase letter required")
            .regex(/[0-9]/, "One number required")
            .regex(/[^A-Za-z0-9]/, "One special character required"),
    })
};

