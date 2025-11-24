
import { z } from 'zod';

export const userRoleUpdateSchema = () => {
    return z.object({
        id: z.string(),
        concurrencyStamp: z.string(),
        name: z
            .string({ required_error: "Please fill the Name field first" })
            .min(2, { message: "Name field should at least have 2 character" })
            .max(20, { message: "Name field should at most have 20 character." }),
        description: z
            .string({ required_error: "Please fill the Description field first" })
            .min(2, { message: "Description field should at least have 2 character." })
            .max(20, { message: "Description field should at most have 20 character." }),
    });
};
