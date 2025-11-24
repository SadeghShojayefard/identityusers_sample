
import { z } from 'zod';

export const ChangePasswordUserShema = () => {
    return z.object({
        id: z.string(),
        password: z
            .string({ required_error: "Please fill the Password field first" })
            .min(8, { message: "Password field should at least have 8 character" })
            .max(20, { message: "Password field should at most have 20 character." }),
    })
};
