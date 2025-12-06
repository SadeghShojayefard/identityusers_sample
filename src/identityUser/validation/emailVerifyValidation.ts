
import { z } from 'zod';


export const emailVerifySchema = () => {
    return z.object({
        id: z
            .string(),
    })
};
