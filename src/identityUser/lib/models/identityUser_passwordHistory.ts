import mongoose from "mongoose";

const { Schema } = mongoose;

const identityUser_passwordHistorySchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_users",
            required: true,
        },
        passwordHash: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.identityUser_passwordHistory ||
    mongoose.model("identityUser_passwordHistory", identityUser_passwordHistorySchema);
