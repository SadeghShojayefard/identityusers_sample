import mongoose from "mongoose";

const { Schema } = mongoose;

const TokensSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "identityUser_users",
            required: true,
        },
        identifier: {
            type: String,
            required: true,
            trim: true,
        },
        type: { // Used Email or Phone for Forget Password
            type: String,
            enum: ["email", "phone", "email-verify", "phone-verify", "login-otp", "fallback-login"],
            required: true,
        },
        hashedToken: {
            type: String,
            required: true,
            trim: true,
        },
        expireAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // auto delete at expireAt
        },
        attempts: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.models.identityUser_Tokens ||
    mongoose.model("identityUser_Tokens", TokensSchema);
