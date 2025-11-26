'use server';
import dbConnect from "@/identityUser/lib/db";
import { claimsSchema } from "@/identityUser/validation/claimsValidation";
import { deleteSchema } from "@/identityUser/validation/deleteValidation";
import { updateClaimsSchema } from "@/identityUser/validation/updateClaimsValidation";
import { parseWithZod } from "@conform-to/zod";
import mongoose from "mongoose";
import { revalidatePath } from 'next/cache';
import IdentityUser_Claims from "@/identityUser/lib/models/identityUser_claims";
import IdentityUser_Users from "@/identityUser/lib/models/identityUser_users";
import IdentityUser_UserRoles from "@/identityUser/lib/models/identityUser_userRoles";
import IdentityUser_Roles from "@/identityUser/lib/models/identityUser_roles";
import IdentityUser_RoleClaims from "@/identityUser/lib/models/identityUser_roleClaims";
import IdentityUser_UserClaims from "@/identityUser/lib/models/identityUser_userClaims";
import { randomUUID } from "crypto";
import { hasClaim } from "@/identityUser/lib/session";


export async function addClaimAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("add-Claims"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }


    const subMission = parseWithZod(formData, {
        schema: claimsSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }


    try {
        // connect to database
        await dbConnect();
        // Create new claim and save to database
        const { claimType, claimValue, description } = subMission.value;
        await IdentityUser_Claims.create({
            claimType,
            claimValue,
            description
        });

        // Revalidate the page
        revalidatePath('/cmsClaims');

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


export async function getClaimsAction() {
    await dbConnect();

    try {
        const claims = await IdentityUser_Claims.find({}, 'claimType claimValue description').sort({ claimType: 1, claimValue: 1 }).lean().exec();
        return {
            status: 'success',
            payload: claims.map((item: any) => ({
                id: item._id.toString(),
                claimType: item.claimType,
                claimValue: item.claimValue,
                description: item.description
            })),
        } as const;
    } catch (error) {
        console.error('Error fetching roles:', error);
        return {
            status: 'error',
            payload: [],
        } as const;
    }
}

export async function deleteClaimsAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("delete-Claims"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }

    // 1) Validate
    const subMission = parseWithZod(formData, {
        schema: deleteSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }

    const { id } = subMission.value;

    try {
        await dbConnect();

        const claimId = new mongoose.Types.ObjectId(id);

        // 2) Delete the current claim
        const deletedClaim = await IdentityUser_Claims.findByIdAndDelete(claimId).exec();

        if (!deletedClaim) {
            return {
                status: "error",
                payload: { message: "Claim not found" },
            } as const;
        }

        //3) Find the Roles that have current claim
        const affectedRoles = await IdentityUser_RoleClaims.find({
            claim: claimId,
        }).select("role");

        // 4)  Find the Users that have current claim
        const affectedUsers = await IdentityUser_UserClaims.find({
            claim: claimId,
        }).select("user");

        // 5) romove the Related Roles from RoleClaims Table
        await IdentityUser_RoleClaims.deleteMany({ claim: claimId });

        // 6) romove the Related Users from UserClaims Table
        await IdentityUser_UserClaims.deleteMany({ claim: claimId });

        // 7) Update the claimStamp from related Roles in the Roles Table
        const rolesToUpdate = Array.from(new Set(affectedRoles.map((r: any) => r.role.toString())));
        if (rolesToUpdate.length > 0) {
            await IdentityUser_Roles.updateMany(
                { _id: { $in: rolesToUpdate } },
                { $set: { claimStamp: randomUUID() } }
            );
        }

        // 7) Update the securityStamp from related users in the Users Table
        const usersToUpdate = Array.from(new Set(affectedUsers.map((u: any) => u.user.toString())));
        if (usersToUpdate.length > 0) {
            await IdentityUser_Users.updateMany(
                { _id: { $in: usersToUpdate } },
                { $set: { securityStamp: randomUUID() } }
            );
        }

        // 9) Revalidate the page
        revalidatePath("/cmsClaims");

        return {
            status: "success",
            payload: {
                message: "Claim successfully deleted",
            },
        } as const;
    } catch (error) {
        console.error("Delete Claim Error:", error);
        return {
            status: "error",
            payload: [],
        } as const;
    }
}


export async function updateClaimsAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("edit-Claims"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const submission = parseWithZod(formData, {
        schema: updateClaimsSchema(),
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    try {
        await dbConnect();

        // 1)  Find the Current Claim
        const existing = await IdentityUser_Claims.findById(submission.value.id);
        if (!existing) {
            return {
                status: "error",
                payload: { message: "Claim not found" },
            } as const;
        }

        //2) If nothing was sent, we keep the previous value.
        const claimType =
            submission.value.claimType?.trim() || existing.claimType;

        const claimValue =
            submission.value.claimValue?.trim() || existing.claimValue;

        const description =
            submission.value.description?.trim() || existing.description;

        //3) Claim Update
        const updatedClaim = await IdentityUser_Claims.findByIdAndUpdate(
            submission.value.id,
            {
                $set: {
                    claimType,
                    claimValue,
                    description,
                },
            },
            { new: true }
        ).exec();

        // -------------------------------
        // 4) Find the Roles have Updated Claims
        // -------------------------------
        const affectedRoles = await IdentityUser_RoleClaims.find({
            claim: submission.value.id,
        }).lean();

        const rolesToUpdate = Array.from(
            new Set(affectedRoles.map((r) => r.role.toString()))
        );

        if (rolesToUpdate.length > 0) {
            await IdentityUser_Roles.updateMany(
                { _id: { $in: rolesToUpdate } },
                { $set: { claimStamp: randomUUID() } }
            );
        }

        // -------------------------------
        // 5) Find the Users own Updated Claims
        // -------------------------------
        const affectedUsersFromRoles = await IdentityUser_UserRoles.find({
            role: { $in: rolesToUpdate },
        }).lean();

        const usersFromRoles = affectedUsersFromRoles.map((u) =>
            u.user.toString()
        );

        // -------------------------------
        //  6) Find users who directly own Updated Claim (UserClaims)
        // -------------------------------
        const affectedUsersDirect = await IdentityUser_UserClaims.find({
            claim: submission.value.id,
        }).lean();

        const usersDirect = affectedUsersDirect.map((u) =>
            u.user.toString()
        );

        // -------------------------------
        //  7) Combination of role users + direct users
        // -------------------------------
        const usersToUpdate = Array.from(
            new Set([...usersFromRoles, ...usersDirect])
        );

        if (usersToUpdate.length > 0) {
            await IdentityUser_Users.updateMany(
                { _id: { $in: usersToUpdate } },
                { $set: { securityStamp: randomUUID() } }
            );
        }

        // 8)  revalidate
        revalidatePath("/cmsClaims");

        return {
            status: "success",
            payload: {
                message: "Claim updated successfully",
            },
        } as const;
    } catch (error) {
        console.error("Update Claims Error:", error);
        return {
            status: "error",
            payload: { message: "Unexpected error occurred" },
        } as const;
    }
}
