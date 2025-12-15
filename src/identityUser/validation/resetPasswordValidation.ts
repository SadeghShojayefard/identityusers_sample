
import { z } from 'zod';

export const resetPasswordSchema = () => {
    return z.object({
        password: z
            .string({ required_error: "Filling in the Password is required." })
            .min(8, { message: "The ConfirmPassword must be at least 2 characters." })
            .max(20, { message: "The ConfirmPassword must be a maximum of 20 characters." })
            .regex(/[A-Z]/, "One uppercase letter required")
            .regex(/[a-z]/, "One lowercase letter required")
            .regex(/[0-9]/, "One number required")
            .regex(/[^A-Za-z0-9]/, "One special character required"),
        password2: z
            .string({ required_error: "Filling in the ConfirmPassword is required." })
            .min(8, { message: "The ConfirmPassword must be at least 2 characters." })
            .max(20, { message: "The Password must be a maximum of 20 characters." })
            .regex(/[A-Z]/, "One uppercase letter required")
            .regex(/[a-z]/, "One lowercase letter required")
            .regex(/[0-9]/, "One number required")
            .regex(/[^A-Za-z0-9]/, "One special character required"),
        token: z
            .string(),
    }).refine((data) => data.password === data.password2, {
        message: "The ConfirmPassword and password is not equals",
        path: ['password2'],
    });;
};
