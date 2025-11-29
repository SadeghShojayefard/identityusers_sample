// Claims Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_claimsSchema = new Schema(
    {
        claimType: {
            type: Schema.Types.String,
            required: true,
            trim: true,

        },
        claimValue: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
        description: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
    },
);

export default mongoose.models.identityUser_claims || mongoose.model('identityUser_claims', identityUser_claimsSchema)

