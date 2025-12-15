
import { z } from 'zod';

export const SignInSchema = () => {
    return z.object({
        userName: z
            .string({ required_error: "Filling in the UserName is required." })
            .min(5, { message: "The UserName must be at least 5 characters." })
            .max(20, { message: "The UserName must be a maximum of 20 characters." }),
        password: z
            .string({ required_error: "Filling in the Password is required." })
            .min(5, { message: "The Password must be at least 8 characters." })
            .max(20, { message: "The Password must be a maximum of 20 characters." }),
        rememberMe: z
            .string()
            .optional()
            .transform(val => val === "on"),
    });
};
