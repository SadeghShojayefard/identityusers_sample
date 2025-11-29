// RoleClaims Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_roleClaimsSchema = new Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_roles",
            required: true,
        },
        claim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_claims",
            required: true,
        },
    },
);

export default mongoose.models.identityUser_roleClaims || mongoose.model('identityUser_roleClaims', identityUser_roleClaimsSchema)

