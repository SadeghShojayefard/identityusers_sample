
import { z } from 'zod';

export const changePhoneNumebrSchema = () => {
    return z.object({
        id: z
            .string(),
        newPhone: z
            .string({ required_error: "Please fill the newPhone field first" })
            .min(10, { message: "newPhone field should at least have 10 character." })
            .max(20, { message: "newPhone field should at most have 20 character." }),
    })
};


