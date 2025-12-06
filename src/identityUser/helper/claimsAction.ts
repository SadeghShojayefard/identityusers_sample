'use server';
import dbConnect from "@/identityuser/lib/db";
import { claimsSchema } from "@/identityuser/validation/claimsValidation";
import { deleteSchema } from "@/identityuser/validation/deleteValidation";
import { updateClaimsSchema } from "@/identityuser/validation/updateClaimsValidation";
import { parseWithZod } from "@conform-to/zod";
import mongoose from "mongoose";
import { revalidatePath } from 'next/cache';
import identityUser_claims from "@/identityuser/lib/models/identityUser_claims";
import identityUser_users from "@/identityuser/lib/models/identityUser_users";
import identityUser_userRoles from "@/identityuser/lib/models/identityUser_userRoles";
import identityUser_roles from "@/identityuser/lib/models/identityUser_roles";
import identityUser_roleClaims from "@/identityuser/lib/models/identityUser_roleClaims";
import identityUser_userClaims from "@/identityuser/lib/models/identityUser_userClaims";
import { randomUUID } from "crypto";
import { hasClaim } from "@/identityuser/lib/session";


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
        return {
            status: "error",
            payload: { message: subMission.reply() }
        } as const;
    }


    try {
        // connect to database
        await dbConnect();
        // Create new claim and save to database
        const { claimType, claimValue, description } = subMission.value;
        await identityUser_claims.create({
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
        const claims = await identityUser_claims.find({}, 'claimType claimValue description').sort({ claimType: 1, claimValue: 1 }).lean().exec();
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
        return {
            status: "error",
            payload: { message: subMission.reply() }
        } as const;
    }

    const { id } = subMission.value;

    try {
        await dbConnect();

        const claimId = new mongoose.Types.ObjectId(id);

        // 2) Delete the current claim
        const deletedClaim = await identityUser_claims.findByIdAndDelete(claimId).exec();

        if (!deletedClaim) {
            return {
                status: "error",
                payload: { message: "Claim not found" },
            } as const;
        }

        //3) Find the Roles that have current claim
        const affectedRoles = await identityUser_roleClaims.find({
            claim: claimId,
        }).select("role");

        // 4)  Find the Users that have current claim
        const affectedUsers = await identityUser_userClaims.find({
            claim: claimId,
        }).select("user");

        // 5) romove the Related Roles from RoleClaims Table
        await identityUser_roleClaims.deleteMany({ claim: claimId });

        // 6) romove the Related Users from UserClaims Table
        await identityUser_userClaims.deleteMany({ claim: claimId });

        // 7) Update the claimStamp from related Roles in the Roles Table
        const rolesToUpdate = Array.from(new Set(affectedRoles.map((r: any) => r.role.toString())));
        if (rolesToUpdate.length > 0) {
            await identityUser_roles.updateMany(
                { _id: { $in: rolesToUpdate } },
                { $set: { claimStamp: randomUUID() } }
            );
        }

        // 7) Update the securityStamp from related users in the Users Table
        const usersToUpdate = Array.from(new Set(affectedUsers.map((u: any) => u.user.toString())));
        if (usersToUpdate.length > 0) {
            await identityUser_users.updateMany(
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
        return {
            status: "error",
            payload: { message: submission.reply() }
        } as const;
    }

    try {
        await dbConnect();

        // 1)  Find the Current Claim
        const existing = await identityUser_claims.findById(submission.value.id);
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
        const updatedClaim = await identityUser_claims.findByIdAndUpdate(
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
        const affectedRoles = await identityUser_roleClaims.find({
            claim: submission.value.id,
        }).lean();

        const rolesToUpdate = Array.from(
            new Set(affectedRoles.map((r) => r.role.toString()))
        );

        if (rolesToUpdate.length > 0) {
            await identityUser_roles.updateMany(
                { _id: { $in: rolesToUpdate } },
                { $set: { claimStamp: randomUUID() } }
            );
        }

        // -------------------------------
        // 5) Find the Users own Updated Claims
        // -------------------------------
        const affectedUsersFromRoles = await identityUser_userRoles.find({
            role: { $in: rolesToUpdate },
        }).lean();

        const usersFromRoles = affectedUsersFromRoles.map((u) =>
            u.user.toString()
        );

        // -------------------------------
        //  6) Find users who directly own Updated Claim (UserClaims)
        // -------------------------------
        const affectedUsersDirect = await identityUser_userClaims.find({
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
            await identityUser_users.updateMany(
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
