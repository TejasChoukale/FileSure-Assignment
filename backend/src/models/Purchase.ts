import mongoose  from "mongoose";
const purchaseSchema = new mongoose.Schema(
    {
        buyerId :{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
       },
       amount :{
        type: Number,
        min: 0,
        required: true
       },
       idempotencyKey : {
        type: String,
        required: true,
        index: true,
        unique: true

       },
       firstpurchase: {
        type: Boolean,
        default: false
       },
       purchaseIp: {
        type: String,
        default: null
       }
    },{
        timestamps: true
    }
);

//here what if user already had done purchase already 
purchaseSchema.index({ buyerId: 1, firstpurchase: 1}, { unique: true,
    partialFilterExpression:{
firstpurchase: true
}});

export default mongoose.model("Purchase", purchaseSchema);