import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as string);
        console.log("Connection is establised with mongoDB yeah");
    }catch(error){
        console.log("connection is not established with mongoDB", error);
        process.exit(1);
    }

};

export default connectDB;
