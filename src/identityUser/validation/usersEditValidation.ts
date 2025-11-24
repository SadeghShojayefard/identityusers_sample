
import { z } from 'zod';

export const usersEditSchema = () => {
    return z.object({
        id: z.string(),
        concurrencyStamp: z.string(),
        username: z
            .string({ required_error: "Please fill the Username field first" })
            .min(2, { message: "Username field should at least have 2 character" })
            .max(50, { message: "Username field should at most have 50 character." }),
        email: z
            .string({ required_error: "Please fill the Email field first" })
            .email({ message: "Email is not Valid" }),
        emailConfirmed: z.string(),
        name: z
            .string({ required_error: "Please fill the Name field first" })
            .min(5, { message: "Name field should at least have 5 character" })
            .max(20, { message: "Name field should at most have 20 character." })
            .optional(),
        phoneNumber: z
            .string({ required_error: "Please fill the Name field first" })
            .min(5, { message: "Name field should at least have 5 character" })
            .max(20, { message: "Name field should at most have 20 character." })
            .optional(),
        phoneNumberConfirmed: z.string(),
        accessFailedCount: z.number(),
    })
};


