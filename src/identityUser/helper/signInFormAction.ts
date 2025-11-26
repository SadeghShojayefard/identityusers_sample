'use server';
import dbConnect from "@/identityUser/lib/db";
import { SignInSchema } from "@/identityUser/validation/signInValidation";
import { parseWithZod } from "@conform-to/zod";
import IdentityUser_Users from "@/identityUser/lib/models/identityUser_users";
import { checkUserExistByUserNameAction } from "./userAction";

export async function signInFormAction(prevState: unknown, formData: FormData) {


    const subMission = parseWithZod(formData, {
        schema: SignInSchema(),
    });


    if (subMission.status !== "success") {
        return subMission.reply();
    }


    return {
        status: 'success',
        payload: {
            username: subMission.value.userName,
            password: subMission.value.password,
        }
    } as const;
}

export async function canUserSignInAction(username: string) {

    try {
        await dbConnect();
        const usernameResult = await checkUserExistByUserNameAction(username);

        if (usernameResult.status === "success") {

            const userData = await IdentityUser_Users.findById(usernameResult.data.id);
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

            const userData = await IdentityUser_Users.findById(usernameResult.data.id);
            let accessFailed = userData.accessFailedCount + 1;
            let lockoutEnabled = false;
            let lockoutEnd = null;

            if (accessFailed >= 5) {
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
                lockoutEnabled = true;
                lockoutEnd = expiresAt;
            }

            const updatedProduct = await IdentityUser_Users.findByIdAndUpdate(
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

            const userData = await IdentityUser_Users.findById(usernameResult.data.id);
            let accessFailed = 0;
            let lockoutEnabled = false;
            let lockoutEnd = null;

            const updatedProduct = await IdentityUser_Users.findByIdAndUpdate(
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

