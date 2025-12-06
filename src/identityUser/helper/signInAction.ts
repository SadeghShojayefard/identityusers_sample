'use server';
import dbConnect from "@/identityuser/lib/db";
import { SignInSchema } from "@/identityuser/validation/signInValidation";
import { parseWithZod } from "@conform-to/zod";
import identityUser_users from "@/identityuser/lib/models/identityUser_users";
import { checkUserExistByEmailAction, checkUserExistByPhoneNumberAction, checkUserExistByUserNameAction, getUserByEmailAction } from "./userAction";
import { forgetPasswordSchema } from "../validation/forgetPasswordValidation";
import identityUser_Tokens from "@/identityuser/lib/models/identityUser_Tokens";
import { comparePassword, hashPassword } from "./sharedFunction";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { resetPasswordSchema } from "../validation/resetPasswordValidation";
import { headers } from "next/headers";
import { emailLimiter, globalLimiter, ipLimiter, PhoneLimiter } from "../lib/utils/rateLimit";
import { otpValidationSchema } from "../validation/otpValidation";
import { emailVerifySchema } from "@/identityuser/validation/emailVerifyValidation";
import { randomUUID } from "crypto";
import { phoneVerifySchema } from "../validation/phoneVerifyValidation";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { twoStepEnableSchema } from "../validation/twoStepEnableValidation";
import { verify2FASchema } from "../validation/verify2FAValidation";
import { verify2StepSchema } from "../validation/verify2StepValidation";

export async function signInFormAction(prevState: unknown, formData: FormData) {
    try {

        const subMission = parseWithZod(formData, {
            schema: SignInSchema(),
        });

        if (subMission.status !== "success") {
            return {
                status: "error",
                payload: { message: subMission.reply() }
            } as const;
        }

        const username = subMission.value.userName;
        const password = subMission.value.password;
        await dbConnect();
        // 1)Check if username exist or not
        const user = await identityUser_users.findOne({ username });

        if (!user) {
            return {
                status: "success",
                payload: {
                    username,
                    password
                }
            } as const;
        }

        const isCorrect = await comparePassword(password, user.passwordHash);

        if (!isCorrect) {
            return {
                status: "success",
                payload: {
                    username,
                    password
                }
            } as const;
        }

        // If 2FA enable
        if (user.twoFactorEnabled === true) {
            return {
                status: "success-2fa",
                payload: {
                    username,
                    password
                }
            } as const;
        }

        // If two step disable
        return {
            status: "success",
            payload: {
                username,
                password
            }
        } as const;
    } catch (error) {
        return {
            status: 'error',
            payload: {
                message: 'Something wrong please try later',
            },
        } as const;
    }
}

export async function canUserSignInAction(username: string) {

    try {
        await dbConnect();
        const usernameResult = await checkUserExistByUserNameAction(username);

        if (usernameResult.status === "success") {

            const userData = await identityUser_users.findById(usernameResult.data.id);
            if (userData.lockoutEnabled) {
                const now = new Date();
                if (userData.lockoutEnd && userData.lockoutEnd > now) {

                    const remaining = Math.ceil(
                        ((userData.lockoutEnd.getTime() - now.getTime()) / (60 * 1000))
                    );


                    return {
                        status: 'error',
                        message: remaining,
                    };
                }
                else {

                    return {
                        status: 'success',
                        message: "",
                    };
                }
            }
            else {

                return {
                    status: 'success',
                    message: ""
                } as const;
            }


        }
    } catch (error) {
        return {
            status: 'error',
            payload: {
                message: 'Something wrong please try later',
            },
        } as const;
    }

}


export async function signInFailedAction(username: string) {
    try {
        await dbConnect();
        const usernameResult = await checkUserExistByUserNameAction(username);

        if (usernameResult.status === "success") {

            const userData = await identityUser_users.findById(usernameResult.data.id);
            let accessFailed = userData.accessFailedCount + 1;
            let lockoutEnabled = false;
            let lockoutEnd = null;

            if (accessFailed >= 5) {
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
                lockoutEnabled = true;
                lockoutEnd = expiresAt;
            }

            const updatedProduct = await identityUser_users.findByIdAndUpdate(
                usernameResult.data.id,
                {
                    $set: {
                        accessFailedCount: accessFailed,
                        lockoutEnabled: lockoutEnabled,
                        lockoutEnd: lockoutEnd,
                    }
                },
                { new: true }
            ).exec();
        }
        else {
            return {
                status: 'error',
                payload: {
                    message: 'Something wrong please try later',
                },
            } as const;
        }
    } catch (error) {
        return {
            status: 'error',
            payload: {
                message: 'Something wrong please try later',
            },
        } as const;
    }

}

export async function signInSuccessAction(username: string) {
    try {
        await dbConnect();
        const usernameResult = await checkUserExistByUserNameAction(username);

        if (usernameResult.status === "success") {

            const userData = await identityUser_users.findById(usernameResult.data.id);
            let accessFailed = 0;
            let lockoutEnabled = false;
            let lockoutEnd = null;

            const updatedProduct = await identityUser_users.findByIdAndUpdate(
                usernameResult.data.id,
                {
                    $set: {
                        accessFailedCount: accessFailed,
                        lockoutEnabled: lockoutEnabled,
                        lockoutEnd: lockoutEnd,
                    }
                },
                { new: true }
            ).exec();
        }
        else {
            return {
                status: 'error',
                payload: {
                    message: 'Something wrong please try later',
                },
            } as const;
        }
    } catch (error) {
        return {
            status: 'error',
            payload: {
                message: 'Something wrong please try later',
            },
        } as const;
    }

}

export async function forgotPasswordRequestAction(prevState: unknown, formData: FormData) {

    const submission = parseWithZod(formData, { schema: forgetPasswordSchema() });
    if (submission.status !== "success") {
        return {
            status: "error",
            payload: {
                message: submission.reply(),
            }
        } as const;
    }

    const identifier = submission.value.email_phone.trim();
    await dbConnect();

    // Detect input type
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^09\d{9}$/.test(identifier);

    let remainingMs = 0;

    // Get client IP (works on Vercel)
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

    // Limiter keys
    const emailKey = `reset:email:${identifier}`;
    const phoneKey = `reset:phone:${identifier}`;
    const ipKey = `reset:ip:${ip}`;

    // ======================================================
    // EMAIL BRANCH
    // ======================================================
    if (isEmail) {

        // Check if user exists (returns always success for protection)
        const existing = await checkUserExistByEmailAction(identifier);

        if (existing.status === "success") {
            // User exists → generate token
            const user = await identityUser_users.findOne({
                normalizedEmail: identifier.toUpperCase(),
            });

            await createEmailPasswordResetTokenAction(
                user?._id.toString(),
                user?.email
            );
        }

        // Apply rate limiters (always)
        const lim1 = await emailLimiter.limit(emailKey);
        const lim2 = await ipLimiter.limit(ipKey);

        if (!lim1.success) remainingMs = lim1.reset - Date.now();
        if (!lim2.success) remainingMs = lim2.reset - Date.now();

        return {
            status: "success",
            payload: {
                message: "If an account exists, a recovery link has been sent.",
                showOtpModal: false,      // IMPORTANT: Email → no modal
                modalVersion: Date.now(), // Forces frontend modal update
                expiresAt: remainingMs,   // Time before user can try again
                identifier: identifier,
            }
        } as const;
    }

    // ======================================================
    // PHONE BRANCH
    // ======================================================
    if (isPhone) {

        // Check if phone exists (always hides true/false)
        const existing = await checkUserExistByPhoneNumberAction(identifier);

        let otpCode = "-1";

        if (existing.status === "success") {
            // User exists → generate OTP
            const userPhone = await identityUser_users.findOne({ phoneNumber: identifier });

            otpCode = await createPhonePasswordResetTokenAction(
                userPhone?._id.toString(),
                userPhone?.phoneNumber
            );
        }

        // Check if an active OTP already exists (limit user spam)
        const existingOtp = await identityUser_Tokens.findOne({
            identifier,
            type: "phone"
        });

        if (existingOtp) {
            // User already has an OTP → calculate remaining time
            remainingMs = existingOtp.expireAt.getTime() - Date.now();
        } else {
            // Apply rate limiters for phone + IP
            const lim1 = await PhoneLimiter.limit(phoneKey);
            const lim2 = await ipLimiter.limit(ipKey);

            if (!lim1.success) remainingMs = lim1.reset - Date.now();
            if (!lim2.success) remainingMs = lim2.reset - Date.now();
        }
        return {
            status: "success",
            payload: {
                message: "If an account exists, a recovery code has been sent.",
                showOtpModal: true,      // Phone → show OTP modal
                modalVersion: Date.now(), // Always forces modal refresh
                expiresAt: remainingMs,
                identifier: identifier
            }
        } as const;
    }

    // ======================================================
    // Should never reach here (Zod already validates input)
    // ======================================================
    return {
        status: "error",
        payload: {
            message: "Invalid input format.",
            showOtpModal: false,
            modalVersion: Date.now(),
            expiresAt: 0,
            identifier: identifier
        }
    } as const;
}


/////////////// here for the reset password with email ////////////////////
async function createEmailPasswordResetTokenAction(userId: string, email: string) {
    try {

        // 0. GET HEADERS (Next.js 15+ → async)
        const h = await headers();
        const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

        const emailKey = `reset:email:${email}`;
        const ipKey = `reset:ip:${ip}`;
        const globalKey = `reset:global:${ip}`;

        // 2. Apply all rate limits
        const emailRes = await emailLimiter.limit(emailKey);
        if (!emailRes.success) return false;

        const ipRes = await ipLimiter.limit(ipKey);
        if (!ipRes.success) return false;

        const globalRes = await globalLimiter.limit(globalKey);
        if (!globalRes.success) return false;

        // 1. Create Token
        const rawToken = randomBytes(48).toString("hex");

        // 2. Hash Token
        const hashedToken = await hashPassword(rawToken);

        // 3. Delete any previous tokens
        await identityUser_Tokens.deleteMany({
            user: userId,
            type: "email"
        });

        // 4. Save token
        const test = await identityUser_Tokens.create({
            user: userId,
            identifier: email,
            type: "email",
            hashedToken,
            expireAt: new Date(Date.now() + 15 * 60 * 1000),
        });
        // 5. Create reset link
        const resetLink = `${process.env.NEXTAUTH_URL}/forgetPassword/${rawToken}`;

        // 6. Send email
        await sendPasswordResetEmail(email, resetLink);
        return true;
    }
    catch (error) {
        return false;
    }
}


const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(to: string, link: string) {

    try {
        await resend.emails.send({
            // from: "Your App <no-reply@yourdomain.com>",
            from: 'identityUser <identityUser@resend.dev>',
            to,
            subject: "Reset your password",
            html: `
                <div>
                    <p>Click the link below to reset your password:</p>
                    <a href="${link}" target="_blank">${link}</a>
                    <p>This link will expire in 15 minutes.</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("email error:", error);
        return false;
    }
}


export async function resetForgetPasswordAction(prevState: unknown, formData: FormData) {

    const submission = parseWithZod(formData, {
        schema: resetPasswordSchema(),
    });

    if (submission.status !== "success") {
        return {
            status: "error",
            payload: { message: submission.reply() }
        } as const;
    }

    const { password, token } = submission.value;

    try {
        await dbConnect();

        // 1) Find ALL tokens that are not expired
        const tokenRecords = await identityUser_Tokens.find({
            expireAt: { $gt: new Date() }  // valid (not expired)
        });

        if (!tokenRecords.length) {
            return {
                status: "error",
                payload: { message: "Token invalid or expired." }
            } as const;
        }

        let matchedRecord = null;

        // 2) Compare raw token with hashed tokens using bcrypt.compare
        for (const record of tokenRecords) {
            const match = await comparePassword(token, record.hashedToken);
            if (match) {
                matchedRecord = record;
                break;
            }
        }

        if (!matchedRecord) {
            return {
                status: "error",
                payload: { message: "Token invalid or expired." }
            } as const;
        }

        // 3) Update user password
        const hashed = await hashPassword(password);

        await identityUser_users.findByIdAndUpdate(matchedRecord.user, {
            passwordHash: hashed
        });

        // 4) Delete the token so it cannot be reused
        await identityUser_Tokens.deleteOne({ _id: matchedRecord._id });

        return {
            status: "success",
            payload: { message: "Password reset successfully." }
        } as const;

    } catch (error) {
        console.error("resetForgetPasswordAction error:", error);
        return {
            status: "error",
            payload: { message: "Something went wrong, try again." }
        } as const;
    }
}


/////////////// here for the reset password with Phone ////////////////////


async function createPhonePasswordResetTokenAction(userId: string, phoneNumber: string) {
    try {
        // 1) Get IP for rate-limiting (server-side)
        const h = await headers();
        const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim();

        // 2) Apply rate-limits (global, ip, phone)
        const g = await globalLimiter.limit(`global:${ip}`);

        const otp = generateNumericOTP(6); // helper below
        if (!g.success) return otp;

        const ipRes = await ipLimiter.limit(`reset:ip:${ip}`);
        if (!ipRes.success) return otp;

        const phoneKey = `reset:phone:${phoneNumber}`;
        const phoneRes = await PhoneLimiter.limit(phoneKey);
        if (!phoneRes.success) return otp;

        // 3) Hash OTP before saving
        const hashedOtp = await hashPassword(otp);

        // IMPORTANT: delete previous tokens using the same field name 'identifier'
        await identityUser_Tokens.deleteMany({
            identifier: phoneNumber,   // <-- FIXED: use identifier, not phoneNumber field
            type: "phone",
        });

        const userPhone = await identityUser_users.findOne({ phoneNumber: phoneNumber.trim() });

        // store new OTP record (expireAt 2 min here — you can set 2*60*1000 if you want 2 minutes)
        await identityUser_Tokens.create({
            user: userPhone?._id,
            identifier: phoneNumber,
            type: "phone",
            hashedToken: hashedOtp,
            expireAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minute (adjust if needed)
            attempts: 0,
        });

        if (process.env.NODE_ENV !== "production") {
            console.log("DEV OTP for", phoneNumber, "=", otp);
        }

        // (you should write SMS code API here)

        // 5) Always return the raw OTP for dev/testing (remove in production)
        return otp;
    } catch (err) {
        console.error("createPhonePasswordResetTokenAction error:", err);
        return "-1";
    }
}


export async function verifyOtpAction(prevState: unknown, formData: FormData) {
    // 1) validate input
    const submission = parseWithZod(formData, {
        schema: otpValidationSchema(),
    });

    if (submission.status !== "success") {
        return {
            status: "error",
            payload: { message: submission.reply() }
        } as const;
    }

    const { phoneNumber, otp } = submission.value;
    try {
        await dbConnect();

        // find the OTP record for this identifier
        const tokenRecord = await identityUser_Tokens.findOne({
            identifier: phoneNumber,
            type: "phone",
        });
        // If no token record => generic error (avoid enumeration)
        if (!tokenRecord) {
            return {
                status: "error",
                payload: { message: "Invalid or expired code." },
            } as const;
        }

        // Check expiration
        const now = Date.now();
        if (tokenRecord.expireAt.getTime() <= now) {
            // expired -> delete record to allow new request later
            await identityUser_Tokens.deleteMany({
                identifier: phoneNumber,
                type: "phone",
            });

            return {
                status: "error",
                payload: { message: "Invalid or expired code." },
            } as const;
        }

        // Check attempts limit
        const MAX_ATTEMPTS = 5;
        if ((tokenRecord.attempts ?? 0) >= MAX_ATTEMPTS) {
            return {
                status: "error",
                payload: { message: "Too many attempts. Please request a new code." },
            } as const;
        }

        // Compare OTP with hashedToken in DB
        const trimmedOtp = String(otp).trim();

        // use your helper comparePassword (makes bcrypt.compare). fallback to bcrypt if needed
        const isValid = await comparePassword(trimmedOtp, tokenRecord.hashedToken);

        if (!isValid) {
            // Increment attempts
            tokenRecord.attempts = (tokenRecord.attempts ?? 0) + 1;
            await tokenRecord.save();

            const attemptsLeft = Math.max(0, MAX_ATTEMPTS - tokenRecord.attempts);

            return {
                status: "error",
                payload: { message: `Invalid code. Attempts left: ${attemptsLeft}` },
            } as const;
        }


        // OTP is valid -> create a RESET token (raw + hashed) and delete/mark OTP as used
        const rawResetToken = randomBytes(48).toString("hex");
        const hashedResetToken = await hashPassword(rawResetToken);

        // remove all phone OTPs for this identifier (prevent reuse)
        await identityUser_Tokens.deleteMany({
            identifier: phoneNumber,
            type: "phone",
        });

        const test = await identityUser_Tokens.create({
            user: tokenRecord.user,
            identifier: tokenRecord.identifier,
            type: "phone",
            hashedToken: hashedResetToken,
            expireAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            attempts: 0,
        });


        // Return raw reset token (used in redirect URL)
        const redirectUrl = `${process.env.NEXTAUTH_URL ?? ""}/forgetPassword/${rawResetToken}`;
        return {
            status: "success",
            payload: { redirectUrl },
        } as const;
    } catch (err) {
        console.error("verifyOtpAction error:", err);
        return {
            status: "error",
            payload: { message: "Server error. Please try again later." },
        } as const;
    }
}

/////////////// BLOCK OF EMAIL VERIFY ////////////////////

export async function createEmailVerificationToken(prevState: unknown, formData: FormData) {

    const submission = parseWithZod(formData, {
        schema: emailVerifySchema(),
    });

    if (submission.status !== "success") {
        return {
            status: "error",
            payload: { message: submission.reply() }
        } as const;
    }
    const { id } = submission.value;

    // 1. check if user email already verify or not
    const existUser = await identityUser_users.findById(id);

    if (existUser.emailConfirmed) {
        return {
            status: "error",
            payload: { message: "Email alrady confirmed" },
        } as const;
    }


    //2. Check if the token exist or not
    const existingToken = await identityUser_Tokens.findOne({
        user: id,
        type: "email-verify",
    });
    //3. Check the token expire or not if exist
    if (existingToken && existingToken.expireAt > new Date()) {
        return {
            status: "error",
            payload: { message: "A confirmation email has already been sent and has not yet expired. Please check your email." },
        } as const;
    }
    //4. If token expire then delete it
    if (existingToken) {
        await identityUser_Tokens.deleteOne({ _id: existingToken._id });
    }
    //5. Create new token
    const rawToken = randomBytes(48).toString("hex");
    const hashedToken = await hashPassword(rawToken);

    //6. Token storage with 24-hour expiration.
    //          2 * 60 * 1000 // 2 minute (adjust if needed)
    //           24 * 60 * 60 * 1000 // 24 hours minute (adjust if needed)
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await identityUser_Tokens.create({
        user: id,
        identifier: existUser.email.trim(),
        type: "email-verify",
        hashedToken,
        expireAt,
    });
    // 7. Create link    
    const verifyLink = `${process.env.NEXTAUTH_URL}/en/verify/email?token=${rawToken}&email=${existUser.email.trim()}`;

    const sendEmailResult = await sendVerifyTokenForEmail(existUser.email.trim(), verifyLink);
    if (sendEmailResult) {
        return {
            status: "success",
            payload: { message: "Check your email please" }
        } as const;
    }
    else {
        return {
            status: "error",
            payload: { message: "Something went wrong, try again." }
        } as const;
    }
}

async function sendVerifyTokenForEmail(to: string, link: string) {

    try {
        const test = await resend.emails.send({
            // from: "Your App <no-reply@yourdomain.com>",
            from: 'identityUser <identityUser@resend.dev>',
            to,
            subject: "Verify your email",
            html: `
                <div>
                    <p>Click the link below to verify your email:</p>
                    <a href="${link}" target="_blank">${link}</a>
                    <p>This link will expire in 24 hours.</p>
                </div>
            `,
        });
        console.log(test);

        return true;
    } catch (error) {

        console.error("email error:", error);
        return false;
    }
}

export async function verifyEmailToken(token: string, email: string) {


    if (!token || !email) {
        return {
            status: "error",
            payload: { message: "Something went wrong, try again. please try again later" }
        } as const;
    }

    try {
        await dbConnect();

        // 1) Find ALL tokens that are not expired
        const tokenRecords = await identityUser_Tokens.find({
            expireAt: { $gt: new Date() }  // valid (not expired)
        });

        if (!tokenRecords.length) {
            return {
                status: "error",
                payload: { message: "Token invalid or expired." }
            } as const;
        }

        let matchedRecord = null;

        // 2) Compare raw token with hashed tokens using bcrypt.compare
        for (const record of tokenRecords) {
            const match = await comparePassword(token, record.hashedToken);
            if (match) {
                matchedRecord = record;
                break;
            }
        }

        if (!matchedRecord) {
            return {
                status: "error",
                payload: { message: "Token invalid or expired." }
            } as const;
        }

        // 3) Update user to verify email

        const user = await identityUser_users.findByIdAndUpdate(matchedRecord.user, {
            emailConfirmed: true,
            securityStamp: randomUUID(),
            concurrencyStamp: randomUUID(),
        });

        // 4) Delete the token so it cannot be reused
        await identityUser_Tokens.deleteOne({ _id: matchedRecord._id });

        return {
            status: "success",
            payload: {
                message: "Email verify successfully. Please log in to your account again.",
            }
        } as const;

    } catch (error) {
        console.error("resetForgetPasswordAction error:", error);
        return {
            status: "error",
            payload: { message: "Something went wrong, try again." }
        } as const;
    }
}


/////////////// BLOCK OF Phone Number VERIFY ////////////////////
export async function creatPhoneVerificationOTP(prevState: unknown, formData: FormData) {
    try {
        const submission = parseWithZod(formData, {
            schema: phoneVerifySchema(),
        });

        if (submission.status !== "success") {
            return {
                status: "error",
                payload: {
                    message: "Invalid input format.",
                    showOtpModal: false,
                    modalVersion: Date.now(),
                    expiresAt: 0,
                    identifier: ""
                }
            } as const;
        }
        const { id } = submission.value;

        // 1. check if user phone already verify or not
        const existUser = await identityUser_users.findById(id);

        if (existUser.phoneNumberConfirmed) {
            return {
                status: "error",
                payload: { message: "Phone alrady confirmed" },
            } as const;
        }

        //2. Check if the token exist or not
        const existingToken = await identityUser_Tokens.findOne({
            user: id,
            type: "phone-verify",
        });
        //3. Check the token expire of not if exist
        if (existingToken && existingToken.expireAt.getTime() > Date.now()) {
            return {
                status: "success",
                payload: {
                    message: "A code has already been sent and has not yet expired. Please check your phone.",
                    showOtpModal: true,
                    modalVersion: Date.now(),
                    expiresAt: existingToken.expireAt.getTime() - Date.now(),
                    identifier: existUser.phoneNumber.trim(),
                }
            } as const;
        }
        //4. If token expire then delete it
        if (existingToken) {
            await identityUser_Tokens.deleteOne({ _id: existingToken._id });
        }



        // 5. Create and Hash new otp
        const otp = generateNumericOTP(6); // helper below
        const hashedOtp = await hashPassword(otp);

        //6. store new OTP record (expireAt 2 min here — you can set 2*60*1000 if you want 2 minutes)
        const newToken = await identityUser_Tokens.create({
            user: id,
            identifier: existUser.phoneNumber.trim(),
            type: "phone-verify",
            hashedToken: hashedOtp,
            expireAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minute (adjust if needed)
            attempts: 0,
        });

        if (process.env.NODE_ENV !== "production") {
            console.log("DEV OTP for", existUser.phoneNumber.trim(), "=", otp);
        }

        // (you should write SMS code API here)

        return {
            status: "success",
            payload: {
                message: "Check your phone",
                showOtpModal: true,      // IMPORTANT: sms → no modal
                modalVersion: Date.now(), // Forces frontend modal update
                expiresAt: newToken.expireAt.getTime() - Date.now(),   // Time before user can try again
                identifier: existUser.phoneNumber.trim(),
            }
        } as const;

    } catch (err) {
        return {
            status: "error",
            payload: {
                message: "Something went wrong, try again. please try again later",
                showOtpModal: false,
                modalVersion: Date.now(),
                expiresAt: 0,
                identifier: ""
            }
        } as const;
    }
}

export async function verifyPhoneAction(prevState: unknown, formData: FormData) {
    // 1) validate input
    const submission = parseWithZod(formData, {
        schema: otpValidationSchema(),
    });

    if (submission.status !== "success") {
        return {
            status: "error",
            payload: { message: submission.reply() }
        } as const;
    }

    const { phoneNumber, otp } = submission.value;
    try {
        await dbConnect();

        // find the OTP record for this identifier
        const tokenRecord = await identityUser_Tokens.findOne({
            identifier: phoneNumber,
            type: "phone-verify",
        });
        // If no token record => generic error (avoid enumeration)
        if (!tokenRecord) {
            return {
                status: "error",
                payload: { message: "Invalid or expired code." },
            } as const;
        }

        // Check expiration
        const now = Date.now();
        if (tokenRecord.expireAt.getTime() <= now) {
            // expired -> delete record to allow new request later
            await identityUser_Tokens.deleteMany({
                identifier: phoneNumber,
                type: "phone-verify",
            });

            return {
                status: "error",
                payload: { message: "Invalid or expired code." },
            } as const;
        }

        // Check attempts limit
        const MAX_ATTEMPTS = 5;
        if ((tokenRecord.attempts ?? 0) >= MAX_ATTEMPTS) {
            return {
                status: "error",
                payload: { message: "Too many attempts. Please request a new code." },
            } as const;
        }

        // Compare OTP with hashedToken in DB
        const trimmedOtp = String(otp).trim();

        // use your helper comparePassword (makes bcrypt.compare). fallback to bcrypt if needed
        const isValid = await comparePassword(trimmedOtp, tokenRecord.hashedToken);

        if (!isValid) {
            // Increment attempts
            tokenRecord.attempts = (tokenRecord.attempts ?? 0) + 1;
            await tokenRecord.save();

            const attemptsLeft = Math.max(0, MAX_ATTEMPTS - tokenRecord.attempts);

            return {
                status: "error",
                payload: { message: `Invalid code. Attempts left: ${attemptsLeft}` },
            } as const;
        }

        const user = await identityUser_users.findByIdAndUpdate(tokenRecord.user, {
            phoneNumberConfirmed: true,
            securityStamp: randomUUID(),
            concurrencyStamp: randomUUID(),
        });

        // remove all phone OTPs for this identifier (prevent reuse)
        await identityUser_Tokens.deleteMany({
            identifier: phoneNumber,
            type: "phone-verify",
        });

        return {
            status: "success",
            payload: { message: "Phone verify successfully. You are loging out automatically. please log in again." },
        } as const;
    } catch (err) {
        return {
            status: "error",
            payload: { message: "Server error. Please try again later." },
        } as const;
    }
}

////////////////////////  BLOCK OF 2FA //////////////////////////////


export async function generate2FASecretAction(prevState: unknown, formData: FormData) {
    try {
        const submission = parseWithZod(formData, { schema: twoStepEnableSchema() });
        if (submission.status !== "success") {
            return {
                status: "error",
                payload: { message: submission.reply() }
            } as const;
        }

        const userId = submission.value.id;
        await dbConnect();

        const user = await identityUser_users.findById(userId);
        if (!user) return {
            status: "error",
            payload: { message: "User not found" }
        } as const;

        // CASE 1: Disable 2FA if enabled
        if (user.twoFactorEnabled) {
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            user.recoveryCodes = [];
            user.securityStamp = randomUUID(); // logs out sessions
            await user.save();

            return {
                status: "success",
                payload: {
                    message: "Two-factor authentication disabled, you are now logged out automatically.",
                    twoFactorEnabled: false
                },
            } as const;
        }

        // CASE 2: Enable 2FA → generate secret if not exist
        if (!user.twoFactorSecret) {
            user.twoFactorSecret = authenticator.generateSecret();
            await user.save();
        }
        return {
            status: "success",
            payload: {
                message: "Redirect to confirm page to scan QR code",
                redirectTo: `/en/account/security/twoFactor?userId=${user._id}`,
            },
        } as const;

    } catch (error) {
        return { status: "error", payload: { message: "Error generating 2FA setup" } } as const;
    }
}

export async function generateQRCodeAction(userId: string) {
    try {
        await dbConnect();

        const user = await identityUser_users.findById(userId);
        if (!user) {
            return {
                status: "error",
                payload: { message: "User not found" }
            };
        }

        if (!user.twoFactorSecret) {
            return {
                status: "error",
                payload: { message: "2FA secret not generated yet" }
            };
        }

        const otpauthURL = authenticator.keyuri(
            user.email,
            "IdentityUser Authenticator",
            user.twoFactorSecret
        );

        const qr = await QRCode.toDataURL(otpauthURL);

        return {
            status: "success",
            payload: {
                qr,
            }
        };

    } catch (error) {
        console.log(error);
        return {
            status: "error",
            payload: { message: "Error generating QR code" }
        };
    }
}

export async function verify2FAAction(prevState: unknown, formData: FormData) {
    try {

        const submission = parseWithZod(formData, { schema: verify2FASchema() });
        if (submission.status !== "success") {
            return {
                status: "error",
                payload: { message: submission.reply() }
            } as const;
        }
        const { userId, token } = submission.value;


        if (!userId || !token) {
            return {
                status: "error",
                payload: { message: "Invalid request data" }
            } as const;
        }

        await dbConnect();

        const user = await identityUser_users.findById(userId);
        if (!user || !user.twoFactorSecret) {
            return {
                status: "error",
                payload: { message: "User or secret not found" }
            } as const;
        }

        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret
        });

        if (!isValid) {
            return {
                status: "error",
                payload: { message: "Invalid or expired code" }
            } as const;
        }
        const recoveycodes = (await generateRecoveryCodes(10));
        // SUCCESS: Enable 2FA
        user.twoFactorEnabled = true;
        user.recoveryCodes = recoveycodes.hashCodes;
        user.securityStamp = randomUUID();
        await user.save();

        return {
            status: "success",
            payload: {
                rawCodes: recoveycodes.rawCodes,
                message: "Two-factor authentication activated successfully!. You will be logged out after 30 second.",
            }
        } as const;

    } catch (err) {
        return {
            status: "error",
            payload: { message: "Server error verifying 2FA" }
        } as const;
    }
}


export async function verifyLogin2FAAction(prevState: unknown, formData: FormData) {

    try {
        const subMission = parseWithZod(formData, {
            schema: verify2StepSchema(),
        });

        if (subMission.status !== "success") {
            return {
                status: "error",
                payload: { message: subMission.reply() }
            } as const;
        }
        const { username, token } = subMission.value;

        await dbConnect();
        const user = await identityUser_users.findOne({ username });

        if (!user) {
            return {
                status: "error",
                payload: { message: "User not found" }
            } as const;
        }

        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            return {
                status: "error",
                payload: { message: "Two-step authentication is not enabled" }
            } as const;
        }
        // allow +/- 1 time step (30s) window
        authenticator.options = { window: 1 };

        const verified = authenticator.check(String(token).trim(), user.twoFactorSecret);

        if (!verified) {
            return {
                status: "error",
                payload: { message: "Invalid authentication code" }
            } as const;
        }

        return {
            status: "success",
            payload: {
                message: "Verification passed",
                username: user.username,
            }
        } as const;
    }
    catch (error) {
        return {
            status: 'error',
            payload: {
                message: 'Something wrong please try later',
            },
        } as const;
    }
}

export async function verifyRecoveryCodeAction(prevState: unknown, formData: FormData) {
    try {
        const submission = parseWithZod(formData, { schema: verify2StepSchema() });
        if (submission.status !== "success") {
            return {
                status: "error",
                payload: { message: submission.reply() }
            } as const;
        }

        const { username, token } = submission.value;

        await dbConnect();

        const user = await identityUser_users.findOne({ username });
        if (!user || !user.recoveryCodes || user.recoveryCodes.length === 0) {
            return {
                status: "error",
                payload: { message: "No recovery codes available or user not found" }
            } as const;
        }

        // recovery code review
        let matchedIndex = -1;
        for (let i = 0; i < user.recoveryCodes.length; i++) {
            const isMatch = await comparePassword(token, user.recoveryCodes[i]);
            if (isMatch) {
                matchedIndex = i;
                break;
            }
        }

        if (matchedIndex === -1) {
            return {
                status: "error",
                payload: { message: "Invalid recovery code" }
            } as const;
        }

        // delete recovery code
        user.recoveryCodes.splice(matchedIndex, 1);
        user.securityStamp = randomUUID(); // logout sessions
        await user.save();

        return {
            status: "success",
            payload: {
                message: "Login successful via recovery code",
                username
            }
        } as const;

    } catch (err) {
        return {
            status: "error",
            payload: { message: "Server error verifying recovery code" }
        } as const;
    }

}


/* ----------------- helper: secure numeric OTP ----------------- */
function generateNumericOTP(length: number) {
    // create crypto-secure numeric OTP (length digits)
    // this avoids simple Math.random
    const bytes = randomBytes(length);
    let otp = "";
    for (let i = 0; i < length; i++) {
        // map each byte to 0-9
        otp += (bytes[i] % 10).toString();
    }
    return otp;
}


async function generateRecoveryCodes(count: number = 10, length: number = 8) {
    const hashCodes: string[] = [];
    const rawCodes: string[] = [];

    for (let i = 0; i < count; i++) {
        // تولید کد تصادفی (الفبا و اعداد)
        const code = randomBytes(length)
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(0, length);

        // هش کردن کد
        const hashed = await hashPassword(code);
        rawCodes.push(code);
        hashCodes.push(hashed);
    }

    return {
        hashCodes,
        rawCodes
    };
}
