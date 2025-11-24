'use server';
import dbConnect from "@/identityUser/lib/db";
import { signUpSchema } from "@/identityUser/validation/signUpValidation";
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { checkEmailExistAction, checkUserNameExistAction } from "./userAction";
import { hashPassword } from "./sharedFunction";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import IdentityUser_Users from "@/identityUser/lib/models/identityUser_users";
import IdentityUser_Roles from "@/identityUser/lib/models/identityUser_roles";
import IdentityUser_UserRoles from "@/identityUser/lib/models/identityUser_userRoles";



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

        const usernameResult = await checkUserNameExistAction(username);
        if (usernameResult.status === "success") {
            return {
                status: 'error',
                payload: {
                    message: 'Username already exist',
                },
            } as const;
        }

        const emailResult = await checkEmailExistAction(email);
        if (emailResult.status === "success") {
            return {
                status: 'error',
                payload: {
                    message: 'Email already exist',
                },
            } as const;
        }

        const encryptPassword = await hashPassword(password);

        const newUsers = await IdentityUser_Users.create({
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

        const role = await IdentityUser_Roles.findOne({ normalizedName: "USER" });

        await IdentityUser_UserRoles.create({
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


