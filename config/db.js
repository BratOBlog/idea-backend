import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
    }
    catch (err) {
        console.error('Mongo connection error:', err)
        throw err
    }
}

export default connectDb;