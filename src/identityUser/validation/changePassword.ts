
import { z } from 'zod';

export const changePasswordSchema = () => {
    return z.object({
        username: z
            .string({ required_error: "Filling in the UserName is required." })
            .min(5, { message: "The UserName must be at least 5 characters." })
            .max(20, { message: "The UserName must be a maximum of 20 characters." }),
        currentPassword: z
            .string({ required_error: "Filling in the CurrentPasswor is required." })
            .min(8, { message: "The CurrentPasswor must be at least 8 characters." })
            .max(20, { message: "The CurrentPasswor must be a maximum of 20 characters." }),
        newPassword: z
            .string({ required_error: "Filling in the Password is required." })
            .min(8, { message: "The ConfirmPassword must be at least 2 characters." })
            .max(20, { message: "The ConfirmPassword must be a maximum of 20 characters." })
            .regex(/[A-Z]/, "One uppercase letter required")
            .regex(/[a-z]/, "One lowercase letter required")
            .regex(/[0-9]/, "One number required")
            .regex(/[^A-Za-z0-9]/, "One special character required"),
        newPassword2: z
            .string({ required_error: "Filling in the ConfirmPassword is required." })
            .min(8, { message: "The ConfirmPassword must be at least 2 characters." })
            .max(20, { message: "The Password must be a maximum of 20 characters." })
            .regex(/[A-Z]/, "One uppercase letter required")
            .regex(/[a-z]/, "One lowercase letter required")
            .regex(/[0-9]/, "One number required")
            .regex(/[^A-Za-z0-9]/, "One special character required"),
    }).refine((data) => data.newPassword === data.newPassword2, {
        message: "The ConfirmPassword and password is not equals",
        path: ['newPassword2'],
    });
};
