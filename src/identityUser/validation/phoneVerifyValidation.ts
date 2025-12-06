
import { z } from 'zod';


export const phoneVerifySchema = () => {
    return z.object({
        id: z
            .string(),
    })
};
