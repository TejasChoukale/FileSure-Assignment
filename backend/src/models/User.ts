import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required:true,
            trim: true
        },
        email : {
            type: String,
            required: true, 
            unique: true, 
            lowercase:true,
            index: true
        },
        passwordHash : {
            type : String,
            requred: true
        },
        referralCode : {
            type :String,
            required: true,
            index: true,
            unique: true,
        },
        credits: {
            type: Number,
            default : 0,
            min : 0,

        },
        referredBy: {
            type : String,
            default: null
        },
        signupIp :{
            type: String,
            default: null
        },
    },
    { timestamps : true}
);

export default mongoose.model("User", userSchema);
