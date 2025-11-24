
import { z } from 'zod';

export const claimsSchema = () => {
    return z.object({
        claimType: z
            .string({ required_error: "Please fill the claimType field first." })
            .min(2, { message: "ClaimType field should at least have 2 character." })
            .max(20, { message: "ClaimType field should at most have 20 character." }),
        claimValue: z
            .string({ required_error: "Please fill the claimValue field first." })
            .min(2, { message: "ClaimValue field should at least have 2 character." })
            .max(20, { message: "ClaimValue field should at most have 20 character." }),
        description: z
            .string({ required_error: "Please fill the Description field first." })
            .min(2, { message: "Description field should at least have 2 character." })
            .max(40, { message: "Description field should at most have 20 character." }),
    });
};


