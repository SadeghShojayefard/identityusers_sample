// UserClaims Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_userClaimsSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_users",
            required: true,
        },
        claim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_claims",
            required: true,
        },
    },
);

export default mongoose.models.identityUser_userClaims || mongoose.model('identityUser_userClaims', identityUser_userClaimsSchema)

