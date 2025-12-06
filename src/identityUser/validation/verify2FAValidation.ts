
import { z } from 'zod';

export const verify2FASchema = () => {
    return z.object({
        userId: z
            .string(),
        token: z
            .string(),
    })
};

