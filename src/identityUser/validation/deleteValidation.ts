
import { z } from 'zod';


export const deleteSchema = () => {
    return z.object({
        id: z
            .string()
    })
};
