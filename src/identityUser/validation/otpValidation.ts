
import { z } from 'zod';

export const otpValidationSchema = () => {
    return z.object({
        phoneNumber: z
            .string(),
        otp: z
            .string({ required_error: "Filling  the OTP field is required." })
            .min(6, { message: "The OTP must be the 6 characters." })
            .max(6, { message: "The OTP must be the 6 characters." })
    })
};
