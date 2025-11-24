// userRoles Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_userRolesSchema = new Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IdentityUser_Roles",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IdentityUser_Users",
            required: true,
        },
    },
);

export default mongoose.models.IdentityUser_UserRoles || mongoose.model('IdentityUser_UserRoles', identityUser_userRolesSchema)

