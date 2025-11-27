import mongoose from "mongoose";

 export const connectDb = async () => {
    if (mongoose.connection.readyState >= 1) return;
 
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb connected")
    }

    catch(err)
    {
        console.log("Mongodb Error",err);
    }
   }
 
