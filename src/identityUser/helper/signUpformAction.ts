'use server';
import dbConnect from "@/identityuser/lib/db";
import { signUpSchema } from "@/identityuser/validation/signUpValidation";
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { checkUserExistByEmailAction, checkUserExistByUserNameAction } from "./userAction";
import { hashPassword } from "./sharedFunction";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import identityUser_users from "@/identityuser/lib/models/identityUser_users";
import identityUser_roles from "@/identityuser/lib/models/identityUser_roles";
import identityUser_userRoles from "@/identityuser/lib/models/identityUser_userRoles";



export async function signUpformAction(prevState: unknown, formData: FormData) {

    const subMission = parseWithZod(formData, {
        schema: signUpSchema(),
    });
    if (subMission.status !== "success") {
        return subMission.reply();
    }
    try {
        await dbConnect();

        const {
            username,
            email,
            password,
            password2,
            locale
        } = subMission.value;

        if (password !== password2) {
            return {
                status: 'error',
                payload: {
                    message: 'Password and ConfirmPassword is not the same',
                },
            } as const;
        }

        const usernameResult = await checkUserExistByUserNameAction(username);
        if (usernameResult.status === "success") {
            return {
                status: 'error',
                payload: {
                    message: 'Username already exist',
                },
            } as const;
        }

        const emailResult = await checkUserExistByEmailAction(email);
        if (emailResult.status === "success") {
            return {
                status: 'error',
                payload: {
                    message: 'Email already exist',
                },
            } as const;
        }

        const encryptPassword = await hashPassword(password);

        const newUsers = await identityUser_users.create({
            username,
            normalizedUserName: username.toUpperCase(),
            email,
            normalizedEmail: email.toUpperCase(),
            emailConfirmed: false,
            passwordHash: encryptPassword,
            securityStamp: randomUUID(),
            concurrencyStamp: randomUUID(),
            phoneNumberConfirmed: false,
            twoFactorEnabled: false,
            lockoutEnabled: false,
            accessFailedCount: 0,
            name: username,
            avatar: "/Avatar/Default Avatar.png",
        });

        const userId = newUsers._id.toString();

        const role = await identityUser_roles.findOne({ normalizedName: "USER" });

        await identityUser_userRoles.create({
            role: role._id,
            user: userId,
        })

        revalidatePath('/cmsUsers');
        return {
            status: 'success',
            payload: {
                username,
                password,
            }
        } as const;


    } catch (error) {
        console.error('Error saving contact form:', error);
        return {
            status: 'error',
            payload: {
                message: 'Something wrong please try later',
            },
        } as const;
    }
}


