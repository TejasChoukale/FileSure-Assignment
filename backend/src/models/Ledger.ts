// why i created this file is becasue  i am not just storing user credits 
// i will also store every credits movement it;s like auidit
import mongoose  from 'mongoose';

const ledgerSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        delta : {
            type: Number,
            required: true,
        },
        reason: {
            type: String, 
            enum: ["REFERRER_CREDIT", "REFERRED_CREDIT", "ADJUSTMENT"],
            required: true
        },
        refId: {
            type: String, 
            default: null
        },
    },
        {timestamps : true}
);


export default mongoose.model("Ledger",ledgerSchema);
