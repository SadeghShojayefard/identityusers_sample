// RoleClaims Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_roleClaimsSchema = new Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IdentityUser_Roles",
            required: true,
        },
        claim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IdentityUser_Claims",
            required: true,
        },
    },
);

export default mongoose.models.IdentityUser_RoleClaims || mongoose.model('IdentityUser_RoleClaims', identityUser_roleClaimsSchema)

