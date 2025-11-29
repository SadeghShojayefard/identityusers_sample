// roles Tables
import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_rolesSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
            trim: true,

        },
        normalizedName: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
        concurrencyStamp: {
            type: Schema.Types.UUID,
            required: true,
            trim: true,
        },
        claimStamp: {
            type: String,
            required: true,
        },
        description: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
    },
);

export default mongoose.models.identityUser_roles || mongoose.model('identityUser_roles', identityUser_rolesSchema)

