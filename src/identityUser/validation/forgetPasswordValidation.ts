import { z } from "zod";

export const forgetPasswordSchema = () => {
    return z.object({
        email_phone: z
            .string({ required_error: "Email or Phone is required" })
            .min(5, "Minimum 5 characters")
            .max(100, "Maximum 100 characters")
            .refine((val) => {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
                const isPhone = /^09\d{9}$/.test(val);
                return isEmail || isPhone;
            }, {
                message: "Please enter a valid email or phone number."
            }),
    });
};