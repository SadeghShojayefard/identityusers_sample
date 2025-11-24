
import { z } from 'zod';

export const signUpSchema = () => {
    return z.object({
        username: z
            .string({ required_error: "Filling in the UserName is required." })
            .min(2, { message: "The UserName must be at least 5 characters." })
            .max(50, { message: "The UserName must be a maximum of 20 characters." }),
        email: z
            .string({ required_error: "Filling in the Email is required." })
            .email({ message: "The Email is not valid" }),
        password: z
            .string({ required_error: "Filling in the Password is required." })
            .min(8, { message: "The ConfirmPassword must be at least 2 characters." })
            .max(20, { message: "The ConfirmPassword must be a maximum of 20 characters." }),
        password2: z
            .string({ required_error: "Filling in the ConfirmPassword is required." })
            .min(8, { message: "The ConfirmPassword must be at least 2 characters." })
            .max(20, { message: "The Password must be a maximum of 20 characters." }),
        locale: z
            .string().optional(),
    }).refine((data) => data.password === data.password2, {
        message: "The ConfirmPassword and password is not equals",
        path: ['password2'],
    });;
};
