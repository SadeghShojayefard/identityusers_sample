
import { z } from 'zod';


export const fallbackVerifySchema = () => {
    return z.object({
        username: z
            .string(),
    })
};
