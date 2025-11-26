
import { z } from 'zod';

export const changeUserNameSchema = () => {
    return z.object({
        id: z
            .string(),
        newUserName: z
            .string({ required_error: "Please fill the newUserName field first" })
            .min(5, { message: "newUserName field should at least have 5 character." })
            .max(20, { message: "newUserName field should at most have 20 character." }),
    })
};

