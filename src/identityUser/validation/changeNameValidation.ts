
import { z } from 'zod';

export const changeNameSchema = () => {
    return z.object({
        username: z
            .string(),
        ccs: z
            .string(),
        name: z
            .string({ required_error: "Please fill the Name field first" })
            .min(5, { message: "Name field should at least have 5 character." })
            .max(20, { message: "Name field should at most have 20 character." }),

    })
};

