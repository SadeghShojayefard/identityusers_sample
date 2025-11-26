
import { z } from 'zod';

export const changeEmailSchema = () => {
    return z.object({
        id: z
            .string(),
        newEmail: z
            .string({ required_error: "Filling in the Email is required." })
            .email({ message: "The Email is not valid" }),
    })
};


