
import { z } from 'zod';

export const usersAddSchema = () => {
    return z.object({
        username: z
            .string({ required_error: "Please fill the Username field first" })
            .min(2, { message: "Username field should at least have 2 character" })
            .max(50, { message: "Username field should at most have 50 character." }),
        email: z
            .string({ required_error: "Please fill the Email field first" })
            .email({ message: "Email is not Valid" }),
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


