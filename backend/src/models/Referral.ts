import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
    {
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
            index: true
        },

        referredId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },

        status : {
            type: String,
            enum: ["pending", "converted", "blocked"],
            default: "pending"
        },
        reasonFlag: {
            type: String,
            default : null
        }
    },
     { timestamps : true } 

);

// here what i am doing now is to prevent duplicates pairs 
referralSchema.index({ referrerId: 1, referredId: 1}, {unique: true});

export default mongoose.model("Referral", referralSchema);