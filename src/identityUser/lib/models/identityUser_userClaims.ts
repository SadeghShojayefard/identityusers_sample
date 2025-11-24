// UserClaims Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_userClaimsSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IdentityUser_Users",
            required: true,
        },
        claim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IdentityUser_Claims",
            required: true,
        },
    },
);

export default mongoose.models.IdentityUser_UserClaims || mongoose.model('IdentityUser_UserClaims', identityUser_userClaimsSchema)

