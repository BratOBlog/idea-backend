import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
    }
    catch (err) {
        console.err(`Error: ${err.messsage}`)
        process.exit(1)
    }
}

export default connectDb;