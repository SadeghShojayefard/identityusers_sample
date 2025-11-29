// userRoles Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_userRolesSchema = new Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_roles",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_users",
            required: true,
        },
    },
);

export default mongoose.models.identityUser_userRoles || mongoose.model('identityUser_userRoles', identityUser_userRolesSchema)

