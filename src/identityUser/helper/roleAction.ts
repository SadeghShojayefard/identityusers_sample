'use server';
import dbConnect from "@/identityuser/lib/db";
import identityUser_roles from "@/identityuser/lib/models/identityUser_roles";
import identityUser_roleClaims from "@/identityuser/lib/models/identityUser_roleClaims";
import identityUser_users from "@/identityuser/lib/models/identityUser_users";
import identityUser_userRoles from "@/identityuser/lib/models/identityUser_userRoles";

import { userRoleSchema } from "@/identityuser/validation/userRoleValidation";
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from 'next/cache';
import { randomUUID } from "crypto";
import { deleteSchema } from "@/identityuser/validation/deleteValidation";
import mongoose from "mongoose";
import { userRoleUpdateSchema } from "@/identityuser/validation/userRoleUpdateValidation";
import { hasClaim } from "@/identityuser/lib/session";

export async function roleAddAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("add-roles"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }

    const subMission = parseWithZod(formData, {
        schema: userRoleSchema(),
    });

    if (subMission.status !== "success") {
        return subMission.reply();
    }
    try {
        await dbConnect();
        // 1) Storing role data in the database
        const { name, description } = subMission.value;
        const newRole = await identityUser_roles.create({
            name,
            normalizedName: name.toUpperCase(),
            concurrencyStamp: randomUUID(),
            claimStamp: randomUUID(),
            description,
        });
        const roleId = newRole._id.toString();

        // 2) Storing role permissions data in the database
        const selectedClaims = formData.getAll("claims") as string[];

        if (selectedClaims.length > 0) {
            const roleClaimsDocs = selectedClaims.map((claimId) => ({
                role: roleId,
                claim: claimId,
            }));

            // A single request instead of multiple create
            await identityUser_roleClaims.insertMany(roleClaimsDocs, { ordered: false });
        }
        // Revalidate
        revalidatePath('/cmsRoles');

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

export async function roleUpdateAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("it-roles"))) {
    //     return {
    //         status: 'error',
    //         payload: {
    //             message: 'no access for this action',
    //         },
    //     } as const;
    // }
    const submission = parseWithZod(formData, {
        schema: userRoleUpdateSchema(),
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const { id, name, description, concurrencyStamp } = submission.value;
    const selectedClaims = formData.getAll("claims") as string[];

    try {
        await dbConnect();

        // 1) Checking the existence of Role
        const existingRole = await identityUser_roles.findById(id);
        if (!existingRole) {
            return {
                status: "error",
                payload: { message: "Role not found." },
            } as const;
        }

        // 2) Checking the Concurrency Stamp 
        if (existingRole.concurrencyStamp !== concurrencyStamp) {
            return {
                status: "error",
                payload: { message: "Role has been modified by another process." },
            } as const;
        }

        // 3) Update Role data
        const newConcurrencyStamp = randomUUID();
        existingRole.name = name;
        existingRole.normalizedName = name.toUpperCase();
        existingRole.description = description;
        existingRole.concurrencyStamp = newConcurrencyStamp;
        existingRole.claimStamp = randomUUID();
        await existingRole.save();

        // 4)  Claims update
        const roleId = existingRole._id;

        //    Get current Claims from the database (array of ObjectId or string)
        const existingClaimsDocs = await identityUser_roleClaims.find({ role: roleId }).select("claim").lean();
        const existingClaimIds = existingClaimsDocs.map((rc: any) => rc.claim.toString());

        const newClaimIds = Array.isArray(selectedClaims) ? selectedClaims : [];

        // Calculate the differences
        const claimsToAdd = newClaimIds.filter((cid) => !existingClaimIds.includes(cid));
        const claimsToRemove = existingClaimIds.filter((cid) => !newClaimIds.includes(cid));

        // Remove unnecessary claims (in one command)
        if (claimsToRemove.length > 0) {
            await identityUser_roleClaims.deleteMany({ role: roleId, claim: { $in: claimsToRemove } });
        }

        // Adding new claims (in a bulk command)
        if (claimsToAdd.length > 0) {
            const docs = claimsToAdd.map((claimId) => ({
                role: roleId,
                claim: claimId,
            }));
            await identityUser_roleClaims.insertMany(docs, { ordered: false });
        }

        // 5) Update securityStamp of all users who have this Role
        const userRoleDocs = await identityUser_userRoles.find({ role: roleId }).select("user").lean();
        const userIds = userRoleDocs.map((ur: any) => ur.user).filter(Boolean);

        if (userIds.length > 0) {
            // Each user gets a new unique uuid
            // Let's do usersUpdateOps with bulkWrite so that each one gets a separate value.
            const bulkOps = userIds.map((uid: any) => ({
                updateOne: {
                    filter: { _id: uid },
                    update: { $set: { securityStamp: randomUUID() } },
                },
            }));
            await identityUser_users.bulkWrite(bulkOps);
        }

        // 6)  revalidate
        revalidatePath("/cmsRoles");

        return {
            status: "success",
            payload: { message: "Role updated successfully.", concurrencyStamp: newConcurrencyStamp },
        } as const;
    } catch (error) {
        console.error("Error updating role:", error);
        return {
            status: "error",
            payload: { message: "An unexpected error occurred." },
        } as const;
    }
}

export async function deleteRoleAction(prevState: unknown, formData: FormData) {
    // if (!(await hasClaim("delete-roles"))) {
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


        // 1) Check and find if Role Exist
        const role = await identityUser_roles.findById(id);
        if (!role) {
            return {
                status: 'error',
                payload: { message: 'Role not found' },
            } as const;
        }


        // 2) get the Role named User 
        const userRole = await identityUser_roles.findOne({ name: 'User' });
        if (!userRole) {
            return {
                status: 'error',
                payload: { message: 'Default "user" role not found' },
            } as const;
        }

        // 3) Get the current userIds that have this role (from UserRoles)
        const userRoleDocs = await identityUser_userRoles.find({ role: id }).lean();
        const userIds = userRoleDocs.map((ur) => ur.user).filter(Boolean);
        // If userIds is empty, we continue (just remove RoleClaims and Role)



        // 4) Change the role of all those users to the default role
        if (userIds.length > 0) {
            await identityUser_userRoles.updateMany({ role: id }, { $set: { role: userRole._id } });

            // 5) enerate a new uuid for each user's securityStamp
            const bulkOps = userIds.map((uid) => ({
                updateOne: {
                    filter: { _id: uid },
                    update: { $set: { securityStamp: randomUUID() } },
                },
            }));

            await identityUser_users.bulkWrite(bulkOps);
        }

        // 6) Delete RoleClaims related to this role
        await identityUser_roleClaims.deleteMany({ role: id });

        // Delete Role
        await identityUser_roles.findByIdAndDelete(id);


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

export async function getRolesAction() {
    await dbConnect();

    try {
        const rolesWithClaims = await identityUser_roles.aggregate([
            // مرحله 1: پیدا کردن roleClaims برای هر role
            {
                $lookup: {
                    from: "identityuser_roleclaims",
                    localField: "_id",
                    foreignField: "role",
                    as: "roleClaims",
                },
            },

            // مرحله 2: باز کردن roleClaims (ممکنه خالی باشه)
            {
                $unwind: {
                    path: "$roleClaims",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // مرحله 3: لود claim اصلی
            {
                $lookup: {
                    from: "identityuser_claims",
                    localField: "roleClaims.claim",
                    foreignField: "_id",
                    as: "claimData",
                },
            },

            // مرحله 4: باز کردن claimData
            {
                $unwind: {
                    path: "$claimData",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // مرحله 5: گروه‌بندی نهایی
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    description: { $first: "$description" },
                    claimStamp: { $first: "$claimStamp" },

                    claims: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$claimData", false] },
                                {
                                    id: { $toString: "$claimData._id" },
                                    claimType: "$claimData.claimType",
                                    claimValue: "$claimData.claimValue",
                                    description: "$claimData.description",
                                },
                                "$$REMOVE",
                            ],
                        },
                    },
                },
            },
        ]);

        return {
            status: "success",
            payload: rolesWithClaims.map((role) => ({
                id: role._id.toString(),
                name: role.name,
                description: role.description,
                claimStamp: role.claimStamp,
                claims: role.claims,
            })),
        };
    } catch (error) {
        console.error('Error fetching roles:', error);
        return {
            status: "error",
            payload: [],
        };
    }
}


export async function getRolesForAddUserAction() {

    try {
        await dbConnect();

        const roles = await identityUser_roles.find({}, `name`)
            .lean<{ _id: mongoose.Types.ObjectId; name: string }[]>()
            .exec();


        return {
            status: "success",
            payload: roles.map((role) => ({
                id: role._id.toString(),
                name: role.name,
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


export async function getRoleByIDAction(roleId: string) {
    try {
        await dbConnect();
        const roleObjectId = new mongoose.Types.ObjectId(roleId);

        const roleWithClaims = await identityUser_roles.aggregate([
            {
                $match: { _id: roleObjectId },
            },
            // Load roleClaims
            {
                $lookup: {
                    from: "identityuser_roleclaims",
                    localField: "_id",
                    foreignField: "role",
                    as: "roleClaims",
                },
            },
            {
                $unwind: {
                    path: "$roleClaims",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Load claimData
            {
                $lookup: {
                    from: "identityuser_claims",
                    localField: "roleClaims.claim",
                    foreignField: "_id",
                    as: "claimData",
                },
            },
            {
                $unwind: {
                    path: "$claimData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Final grouping
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    description: { $first: "$description" },
                    concurrencyStamp: { $first: "$concurrencyStamp" },

                    claims: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$claimData", false] },
                                {
                                    id: { $toString: "$claimData._id" },
                                    claimType: "$claimData.claimType",
                                    claimValue: "$claimData.claimValue",
                                    description: "$claimData.description",
                                },
                                "$$REMOVE",
                            ],
                        },
                    },
                },
            },
        ]);

        if (!roleWithClaims.length) {
            return {
                status: "error",
                payload: [],
            } as const;
        }

        const role = roleWithClaims[0];

        return {
            status: "success",
            payload: {
                id: role._id.toString(),
                name: role.name,
                description: role.description,
                concurrencyStamp: role.concurrencyStamp.toString(),
                claims: role.claims || [],
            },
        } as const;

    } catch (error) {
        console.error("Error fetching role by ID:", error);
        return {
            status: "error",
            payload: [],
        } as const;
    }
}


