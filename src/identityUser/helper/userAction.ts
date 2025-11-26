'use server';
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import dbConnect from "@/identityUser/lib/db";
import { comparePassword, hashPassword } from "./sharedFunction";

import IdentityUser_Users from "@/identityUser/lib/models/identityUser_users";
import IdentityUser_UserClaims from "@/identityUser/lib/models/identityUser_userClaims"
import IdentityUser_UserRoles from "@/identityUser/lib/models/identityUser_userRoles"
import "@/identityUser/lib/models/identityUser_roles";
import IdentityUser_Roles from "@/identityUser/lib/models/identityUser_roles";
import IdentityUser_Claims from "@/identityUser/lib/models/identityUser_claims";

import { usersAddSchema } from "@/identityUser/validation/usersAddValidation";
import { randomUUID } from "crypto";
import { deleteSchema } from "@/identityUser/validation/deleteValidation";
import { ChangePasswordUserShema } from "@/identityUser/validation/ChangePasswordUserValidation";
import { usersEditSchema } from "@/identityUser/validation/usersEditValidation";
import { changeNameSchema } from "@/identityUser/validation/changeNameValidation";
import { changePasswordSchema } from "@/identityUser/validation/changePassword";
import { hasAnyClaim, hasClaim } from "@/identityUser/lib/session";
import { changeUserNameSchema } from "../validation/changeUserNameValidation";
import { changeEmailSchema } from "../validation/changeEmailValidationy";
import identityUser_roleClaims from "../lib/models/identityUser_roleClaims";



export async function AddUserAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("add-user"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const subMission = parseWithZod(formData, {
        schema: usersAddSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }
    const {
        username,
        email,
        password,
    } = subMission.value;

    const selectedClaims = formData.getAll("claims") as string[];
    const role = formData.get("role") as string;

    try {
        await dbConnect();

        const usernameResult = await checkUserExistByUserNameAction(username);
        if (usernameResult.status === "success") {
            return subMission.reply({
                fieldErrors: {
                    username: ["username already exist"],
                },
            });
        }
        const emailResult = await checkUserExistByEmailAction(email);
        if (emailResult.status === "success") {
            return subMission.reply({
                fieldErrors: {
                    email: ["email already exist"],
                },
            });
        }
        const encryptPassword = await hashPassword(password);
        const newUsers = await IdentityUser_Users.create({
            username,
            normalizedUserName: username.toUpperCase(),
            email,
            avatar: "/Avatar/Default Avatar.png",
            normalizedEmail: email.toUpperCase(),
            emailConfirmed: false,
            passwordHash: encryptPassword,
            securityStamp: randomUUID(),
            concurrencyStamp: randomUUID(),
            phoneNumber: "",
            phoneNumberConfirmed: false,
            twoFactorEnabled: false,
            lockoutEnd: null,
            lockoutEnabled: false,
            accessFailedCount: 0,

        });

        const userId = newUsers._id.toString();

        if (selectedClaims.length > 0) {
            const userClaimsDocs = selectedClaims.map((claimId) => ({
                user: userId,
                claim: claimId,
            }));
            await IdentityUser_UserClaims.insertMany(userClaimsDocs, { ordered: false });
        }
        if (role !== "false") {
            await IdentityUser_UserRoles.create({
                role: role,
                user: userId,
            });
        }

        revalidatePath('/cmsUsers');
        return {
            status: 'success',
            payload: {
                message: '',
            },
        } as const;
    } catch (error) {
        console.error('Error saving contact form:', error);
        return {
            status: 'error',
            payload: {
                message: '',
            },
        } as const;
    }
}


export async function UserUpdateAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("edit-user"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const submission = parseWithZod(formData, {
        schema: usersEditSchema(),
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const {
        id,
        concurrencyStamp,
        username,
        email,
        emailConfirmed,
        name,
        phoneNumber,
        phoneNumberConfirmed,
        accessFailedCount,
    } = submission.value;

    const role = formData.get("role") as string;
    const selectedClaims = formData.getAll("claims") as string[];

    try {
        await dbConnect();

        // 1) Find User

        const existingUser = await IdentityUser_Users.findById(id);
        if (!existingUser) {
            return {
                status: "error",
                payload: { message: "User not found." },
            } as const;
        }

        // 2) Check the concurrencyStamp. if is not match return error
        if (existingUser.concurrencyStamp !== concurrencyStamp) {
            return {
                status: "error",
                payload: { message: "User has been modified by another process." },
            } as const;
        }

        // 3) Check if the new username and email already exist or not.


        if (username.toUpperCase().trim() !== existingUser.normalizedUserName) {
            const usernameExists = await checkUserExistByUserNameAction(username);
            if (usernameExists.status === "success") {
                return {
                    status: "error",
                    payload: { message: "Username already exists." },
                } as const;
            }
        }

        if (email.toUpperCase().trim() !== existingUser.normalizedEmail) {
            const emailExists = await checkUserExistByEmailAction(email);
            if (emailExists.status === "success") {
                return {
                    status: "error",
                    payload: { message: "Email already exists." },
                } as const;
            }
        }

        /// user this if only you want have uniq phoneNumber
        // if (phoneNumber !== existingUser.phoneNumber) {
        //     const emailExists = await checkUserExistByPhoneNumberAction(phoneNumber);
        //     if (emailExists.status === "success") {
        //         return {
        //             status: "error",
        //             payload: { message: "Email already exists." },
        //         } as const;
        //     }
        // }

        //  Auxiliary variable for detecting important changes
        let sensitiveChanged = false;


        // 4) Update User Roles
        const newRoleId = role === "false" ? null : role;
        const currentRole = await IdentityUser_UserRoles.findOne({ user: id });
        if (
            (!currentRole && newRoleId) ||
            (currentRole && currentRole.role.toString() !== newRoleId)
        ) {
            sensitiveChanged = true;

            //  Delete current Role
            await IdentityUser_UserRoles.deleteMany({ user: id });

            // add new Role if Exist
            if (newRoleId) {
                const roleExists = await IdentityUser_Roles.exists({ _id: newRoleId });
                if (roleExists) {
                    await IdentityUser_UserRoles.create({ user: id, role: newRoleId });
                }
            }
        }
        // 5) Update UserClaims
        const existingClaimsDocs = await IdentityUser_UserClaims.find({ user: id }).select("claim").lean();
        const existingClaimIds = existingClaimsDocs.map((uc: any) => uc.claim.toString());

        const newClaimIds = Array.isArray(selectedClaims) ? selectedClaims : [];

        const claimsToAdd = newClaimIds.filter(cid => !existingClaimIds.includes(cid));
        const claimsToRemove = existingClaimIds.filter(cid => !newClaimIds.includes(cid));

        if (claimsToAdd.length > 0 || claimsToRemove.length > 0) {
            sensitiveChanged = true;
        }

        // Removing unnecessary claims
        if (claimsToRemove.length > 0) {
            await IdentityUser_UserClaims.deleteMany({ user: id, claim: { $in: claimsToRemove } });
        }

        //  Add new Claims
        if (claimsToAdd.length > 0) {
            const docs = claimsToAdd.map(claimId => ({
                user: id,
                claim: claimId,
            }));
            await IdentityUser_UserClaims.insertMany(docs, { ordered: false });
        }

        // 6) Update the other user data
        const newConcurrencyStamp = randomUUID();
        const updateData: any = {
            userName: username,
            normalizedUserName: username.toUpperCase(),
            name,
            email,
            normalizedEmail: email.toUpperCase(),
            emailConfirmed: emailConfirmed === "true" ? true : false,
            phoneNumber,
            accessFailedCount: Number(accessFailedCount),
            phoneNumberConfirmed: phoneNumberConfirmed === "true" ? true : false,
            concurrencyStamp: newConcurrencyStamp,
        };

        // 7) f sensitive fields have changed, update the securityStamp as well.
        if (
            sensitiveChanged ||
            existingUser.userName !== username ||
            existingUser.email !== email
        ) {
            updateData.securityStamp = randomUUID();
        }

        await IdentityUser_Users.updateOne({ _id: id }, { $set: updateData });

        // 8) revalidate
        revalidatePath("/cmsUsers");

        return {
            status: "success",
            payload: {
                message: "User updated successfully.",
                concurrencyStamp: newConcurrencyStamp,
            },
        } as const;
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            status: "error",
            payload: { message: "An unexpected error occurred." },
        } as const;
    }
}

export async function deleteUserAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("delete-User"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const subMission = parseWithZod(formData, {
        schema: deleteSchema(),
    });
    if (subMission.status !== 'success') {
        return subMission.reply();
    }

    const { id } = subMission.value;
    try {
        await dbConnect();

        // 1) Find User
        const user = await IdentityUser_Users.findById(id);
        if (!user) {
            return {
                status: 'error',
                payload: { message: 'Role not found' },
            } as const;
        }

        // 2) Delete User Role
        await IdentityUser_UserRoles.deleteMany({ user: user._id });

        // 3) Delete User Direct Claims
        await IdentityUser_UserClaims.deleteMany({ user: user._id });

        // 4) Delete User
        await IdentityUser_Users.deleteOne({ _id: user._id });

        revalidatePath('/cmsRoles');

        return {
            status: 'success',
            payload: {
                message: '',
            },
        } as const;

    } catch (error) {
        return {
            status: 'error',
            payload: [],
        } as const;
    }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("change-password-user"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }

    const subMission = parseWithZod(formData, {
        schema: ChangePasswordUserShema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }

    try {
        await dbConnect();
        const {
            id,
            password,
        } = subMission.value;
        const existingUser = await IdentityUser_Users.findOne({ _id: id });
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }
        const encryptPassword = await hashPassword(password);
        await IdentityUser_Users.findByIdAndUpdate(
            existingUser._id,
            {
                $set: {
                    passwordHash: encryptPassword,
                    securityStamp: randomUUID(),
                }
            },
        ).exec();

        return {
            status: "success",
            payload: {
                message: "",
            },
        } as const;
    }
    catch (error) {
        console.error('Error saving contact form:', error);
        return {
            status: 'error',
            payload: {
                message: '',
            },
        } as const;
    }
}
export async function changePasswordAction(prevState: unknown, formData: FormData) {
    if (!(await hasAnyClaim())) {
        return {
            status: 'error',
            payload: {
                message: 'no access for this action',
            },
        } as const;
    }
    const subMission = parseWithZod(formData, {
        schema: changePasswordSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }

    try {
        await dbConnect();
        const {
            username,
            currentPassword,
            newPassword,
            newPassword2
        } = subMission.value;
        const existingUser = await IdentityUser_Users.findOne({ username: username.trim() });
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }

        const currentPasswordResult = await comparePassword(currentPassword, existingUser.passwordHash);
        if (!currentPasswordResult) {
            return {
                status: 'error',
                payload: {
                    message: "oldPassword",
                },
            } as const;
        }

        if (newPassword !== newPassword2) {
            return {
                status: 'error',
                payload: {
                    message: "not match",
                },
            } as const;
        }

        const encryptPassword = await hashPassword(newPassword);

        await IdentityUser_Users.findByIdAndUpdate(
            existingUser._id,
            {
                $set: {
                    passwordHash: encryptPassword,
                    securityStamp: randomUUID(),
                }
            },
        ).exec();

        return {
            status: "success",
            payload: {
                message: "",
            },
        } as const;
    }
    catch (error) {
        console.error('Error saving contact form:', error);
        return {
            status: 'error',
            payload: {
                message: '',
            },
        } as const;
    }
}

export async function getAllUsersAction() {
    try {
        await dbConnect();

        const usersData = await IdentityUser_Users.aggregate([
            // Connecting roles
            {
                $lookup: {
                    from: "identityuser_userroles",
                    localField: "_id",
                    foreignField: "user",
                    as: "userRole",
                },
            },
            { $unwind: { path: "$userRole", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "identityuser_roles",
                    localField: "userRole.role",
                    foreignField: "_id",
                    as: "roleData",
                },
            },
            { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },

            // Connecting Claims
            {
                $lookup: {
                    from: "identityuser_userclaims",
                    localField: "_id",
                    foreignField: "user",
                    as: "userClaims",
                },
            },
            {
                $lookup: {
                    from: "identityuser_claims",
                    localField: "userClaims.claim",
                    foreignField: "_id",
                    as: "claimsData",
                },
            },

            // Output Field
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    emailConfirmed: 1,
                    name: {
                        $cond: [
                            { $or: [{ $eq: ["$name", ""] }, { $eq: ["$name", "null"] }] },
                            "_",
                            "$name",
                        ],
                    },
                    avatar: 1,
                    concurrencyStamp: 1,
                    phoneNumber: 1,
                    phoneNumberConfirmed: 1,
                    twoFactorEnabled: 1,
                    lockoutEnd: 1,
                    lockoutEnabled: 1,
                    accessFailedCount: 1,
                    createdAt: 1,
                    role: {
                        id: { $toString: "$roleData._id" },
                        name: "$roleData.name",
                    },
                    claims: {
                        $map: {
                            input: "$claimsData",
                            as: "claim",
                            in: {
                                id: { $toString: "$$claim._id" },
                                description: "$$claim.description",
                            },
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        const total = await IdentityUser_Users.countDocuments();

        return {
            status: "success",
            payload: usersData.map((data: any) => ({
                id: data._id.toString(),
                username: data.username,
                email: data.email,
                emailConfirmed: data.emailConfirmed,
                name: data.name,
                avatar: data.avatar,
                roleId: data.role.id || null,
                roleName: data.role.name || null,
                concurrencyStamp: data.concurrencyStamp?.toString(),
                phoneNumber: data.phoneNumber,
                phoneNumberConfirmed: data.phoneNumberConfirmed,
                twoFactorEnabled: data.twoFactorEnabled,
                lockoutEnd: data.lockoutEnd,
                lockoutEnabled: data.lockoutEnabled,
                accessFailedCount: data.accessFailedCount,
                createdAt: new Date(data.createdAt).toISOString(),
                claims: data.claims || [],
            })),
            total,
        } as const;
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            status: "error",
            payload: { data: [] },
        } as const;
    }
}

export async function getUserByIdAction(userId: string) {
    await dbConnect();

    // 1) Find User By Id
    const user = await IdentityUser_Users.findById(userId);
    if (!user) {
        return {
            status: "error",
            payload: {
                message: "User not found",
            }
        }
    }
    return await getUserDataSharedFunction(user);
}

export async function getUserByUsernameAction(username: string) {
    await dbConnect();

    // 1) Find User by Username
    const user = await IdentityUser_Users.findOne({ normalizedUserName: username.toUpperCase().trim() });
    if (!user) {
        return {
            status: "error",
            payload: {
                message: "User not found",
            }
        }
    }

    return await getUserDataSharedFunction(user);
}
export async function getUserByEmailAction(email: string) {
    await dbConnect();
    // 1) Find User by Email
    const user = await IdentityUser_Users.findOne({ normalizedEmail: email.toUpperCase().trim() });

    if (!user) {
        return {
            status: "error",
            payload: {
                message: "User not found",
            }
        }
    }

    return await getUserDataSharedFunction(user);
}

export async function getUserByUsernameForSessionAction(username: string) {
    await dbConnect();

    // 1) Find User by Username
    const user = await IdentityUser_Users.findOne({ username });
    if (!user) {
        return { status: "error", message: "User not found" };
    }

    const userId = user._id.toString();

    // 2) Find User Roles
    const userRoles = await IdentityUser_UserRoles.find({ user: userId })
        .populate({
            path: "role",
            model: IdentityUser_Roles,
            select: "name",
        })
        .lean();

    const roleIds = userRoles.map(r => r.role._id.toString());
    const roleNames = userRoles.map(r => r.role.name);

    // 3) Find User Direct Claims
    const directClaims = await IdentityUser_UserClaims.find({ user: userId })
        .populate({
            path: "claim",
            model: IdentityUser_Claims,
            select: "claimValue",
        })
        .lean({});

    const directClaimNames = directClaims.map(c => c.claim.claimValue);

    // 4)  Find User Roles Claims
    const roleClaims = await identityUser_roleClaims.find({
        role: { $in: roleIds },
    })
        .populate({
            path: "claim",
            model: IdentityUser_Claims,
            select: "claimValue",
        })
        .lean();

    const roleClaimNames = roleClaims.map(c => c.claim.claimValue);

    //Combination of role Claims + direct Claims
    const mergedClaims = Array.from(
        new Set([...directClaimNames, ...roleClaimNames])
    );

    // 6) Creating the final output
    return {
        status: "success",
        payload: {
            id: userId,
            username: user.username,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            securityStamp: user.securityStamp,
            password: user.passwordHash,
            roles: roleNames,          //  String array
            claims: mergedClaims,      // String array without duplicates
        }
    } as const;
}
export async function getUserByPhoneNumberAction(phoneNumber: string) {
    await dbConnect();
    // use this action only when use phoneNumber as uniq field for each user
    // 1) Find User by phoneNumber
    const user = await IdentityUser_Users.findOne({ phoneNumber: phoneNumber.trim() });

    if (!user) {
        return {
            status: "error",
            payload: {
                message: "User not found",
            }
        }
    }

    return await getUserDataSharedFunction(user);
}


async function getUserDataSharedFunction(user: any) {
    // 2) Find User Roles
    const userRoles = await IdentityUser_UserRoles.find({ user: user._id })
        .populate({
            path: "role",
            model: IdentityUser_Roles,
            select: "name ",
        })
        .lean();

    // 3) Find User Direct Claim
    const userClaims = await IdentityUser_UserClaims.find({ user: user._id })
        .populate({
            path: "claim",
            model: IdentityUser_Claims,
            select: "  description",
        })
        .lean();

    // 4) Creating the final output

    return {
        status: 'success',
        payload: {
            id: user._id.toString(),
            username: user.username,
            name: user.name,
            email: user.email,
            emailConfirmed: user.emailConfirmed,
            concurrencyStamp: user.concurrencyStamp.toString(),
            phoneNumber: user.phoneNumber,
            phoneNumberConfirmed: user.phoneNumberConfirmed,
            accessFailedCount: user.accessFailedCount,
            avatar: user.avatar,
            securityStamp: user.securityStamp,
            password: user.passwordHash,
            roles: userRoles.map((r) => ({
                roleId: r.role._id.toString(),
                roleName: r.role.name
            })),
            claims: userClaims.map((c) => ({
                claimID: c.claim._id.toString(),
                claimDescription: c.claim.description
            })),
        },
    } as const;
}

export async function changeNameAction(prevState: unknown, formData: FormData) {

    // if (!(await hasAnyClaim())) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const subMission = parseWithZod(formData, {
        schema: changeNameSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }

    try {
        await dbConnect();
        const {
            username,
            ccs,
            name
        } = subMission.value;

        const existingUser = await IdentityUser_Users.findOne({ username: username.trim() });
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }


        if (existingUser.concurrencyStamp === ccs) {
            await IdentityUser_Users.findByIdAndUpdate(
                existingUser._id,
                {
                    $set: {
                        name: name.trim(),
                        concurrencyStamp: randomUUID(),
                    }
                },
            ).exec();

            return {
                status: "success",
                payload: {
                    name: name.trim(),
                },
            } as const;
        }
        else {
            return {
                status: 'error',
                payload: {
                    message: "pleas try later",
                },
            } as const;
        }

    }
    catch (error) {
        return {
            status: 'error',
            payload: {
                message: "",
            },
        } as const;
    }
}

export async function changeUserNameAction(prevState: unknown, formData: FormData) {

    // if (!(await hasAnyClaim())) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const subMission = parseWithZod(formData, {
        schema: changeUserNameSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }

    try {
        await dbConnect();
        const {
            id,
            newUserName,
        } = subMission.value;

        const existingUser = await IdentityUser_Users.findById(id);
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }

        if (newUserName.toUpperCase().trim() !== existingUser.normalizedUserName) {
            const usernameExists = await checkUserExistByUserNameAction(newUserName.trim());
            if (usernameExists.status === "success") {
                return {
                    status: "error",
                    payload: { message: "Username already exists." },
                } as const;
            }
            await IdentityUser_Users.findByIdAndUpdate(
                existingUser._id,
                {
                    $set: {
                        username: newUserName.trim(),
                        normalizedUserName: newUserName.toUpperCase().trim(),
                        securityStamp: randomUUID(),
                    }
                },
            ).exec();
        }

        return {
            status: "success",
            payload: {
                username: newUserName.trim(),
            },
        } as const;



    }
    catch (error) {
        return {
            status: 'error',
            payload: {
                message: "",
            },
        } as const;
    }
}

export async function changeEmailAction(prevState: unknown, formData: FormData) {

    // if (!(await hasAnyClaim())) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const subMission = parseWithZod(formData, {
        schema: changeEmailSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }

    try {
        await dbConnect();
        const {
            id,
            newEmail,
        } = subMission.value;

        const existingUser = await IdentityUser_Users.findById(id);
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }

        if (newEmail.toUpperCase().trim() !== existingUser.normalizedEmail) {
            const emailExists = await checkUserExistByEmailAction(newEmail);
            if (emailExists.status === "success") {
                return {
                    status: "error",
                    payload: { message: "Email already exists." },
                } as const;
            }
            await IdentityUser_Users.findByIdAndUpdate(
                existingUser._id,
                {
                    $set: {
                        email: newEmail.trim(),
                        normalizedEmail: newEmail.toUpperCase().trim(),
                        emailConfirmed: false,
                        securityStamp: randomUUID(),
                    }
                },
            ).exec();
        }


        return {
            status: "success",
            payload: {
                newEmail: newEmail.trim(),
            },
        } as const;



    }
    catch (error) {
        return {
            status: 'error',
            payload: {
                message: "",
            },
        } as const;
    }
}


export async function checkUserExistByUserNameAction(username: string) {
    await dbConnect();
    try {
        const existingUser = await IdentityUser_Users.findOne({ normalizedUserName: username.toUpperCase().trim() });
        return checkUserExistResult(existingUser);

    } catch (error) {
        return {
            status: 'error',
            data: {
                id: null,
            }
        };
    }
}

export async function checkUserExistByIdAction(Id: string) {
    await dbConnect();
    try {
        const existingUser = await IdentityUser_Users.findOne({ _id: Id.trim() });
        return checkUserExistResult(existingUser);

    } catch (error) {
        return {
            status: 'error',
            data: {
                id: null,
            }
        };
    }
}

export async function checkUserExistByPhoneNumberAction(phoneNumber: string) {

    // use this action only when use phoneNumber as uniq field for each user
    await dbConnect();
    try {
        const existingUser = await IdentityUser_Users.findOne({ phoneNumber: phoneNumber.trim() });
        return checkUserExistResult(existingUser);
    } catch (error) {
        return {
            status: 'error',
            data: {
                id: null,
            }
        };
    }
}

export async function checkUserExistByEmailAction(email: string) {
    await dbConnect();
    try {
        const existingUser = await IdentityUser_Users.findOne({ normalizedEmail: email.toUpperCase().trim() });
        return checkUserExistResult(existingUser);
    } catch (error) {
        return {
            status: 'error',
        };
    }
}

function checkUserExistResult(existingUser: any) {
    // use this action only when use phoneNumber as uniq field for each user
    if (existingUser) {
        return {
            status: 'success',
            data: {
                id: existingUser._id.toString(),
            }
        };
    }
    return {
        status: 'error',
        data: {
            id: null,
        }
    };
}

export async function getCurrentCCSAction(username: string) {
    await dbConnect();
    try {
        const existingUser = await IdentityUser_Users.findOne({ normalizedUserName: username.toUpperCase().trim() });
        if (existingUser) {
            return {
                status: 'success',
                data: {
                    ccs: existingUser.concurrencyStamp
                }
            };
        }
        return {
            status: 'error',
            data: {
                ccs: null,
            }
        };

    } catch (error) {
        return {
            status: 'error',
            data: {
                ccs: null,
            }
        };
    }
}

export async function LockUnlockUserAction(userId: string) {

    try {
        await dbConnect();

        const existingUser = await checkUserExistByIdAction(userId);
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }

        const user = await IdentityUser_Users.findById(userId);
        let lock = false;

        if (user.lockoutEnabled === true) {
            await IdentityUser_Users.findByIdAndUpdate(
                userId,
                {

                    $set: {

                        lockoutEnd: false,
                        lockoutEnabled: null,
                        accessFailedCount: 0,
                        securityStamp: randomUUID(),
                    }
                },
            ).exec();
        }
        else {
            await IdentityUser_Users.findByIdAndUpdate(
                userId,
                {

                    $set: {

                        lockoutEnd: true,
                        lockoutEnabled: new Date(8640000000000000),
                        accessFailedCount: 5,
                        securityStamp: randomUUID(),
                    }
                },
            ).exec();
            lock = true;
        }

        return {
            status: "success",
            payload: {
                lockoutEnd: lock
            },
        } as const;


    }
    catch (error) {
        return {
            status: 'error',
            payload: {
                message: "",
            },
        } as const;
    }
}

export async function resetSecurityStampAction(userId: string) {

    try {
        await dbConnect();

        const existingUser = await checkUserExistByIdAction(userId);
        if (!existingUser) {
            return {
                status: 'error',
                payload: {
                    message: "userNotExist",
                },
            } as const;
        }

        await IdentityUser_Users.findByIdAndUpdate(
            userId,
            {

                $set: {
                    securityStamp: randomUUID(),
                }
            },
        ).exec();


        return {
            status: "success",
            payload: {
                ssage: "Security Stamp reset Successfully",
            },
        } as const;


    }
    catch (error) {
        return {
            status: 'error',
            payload: {
                message: "",
            },
        } as const;
    }
}



