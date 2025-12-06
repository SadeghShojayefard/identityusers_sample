
import { z } from 'zod';


export const twoStepEnableSchema = () => {
    return z.object({
        id: z
            .string(),
    })
};
