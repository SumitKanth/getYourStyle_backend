import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Data Base Connected");
    } catch (error) {
        console.log("Error got in connecting DataBase ", error?.message || "Data Base is not connected");
        process.exit(1);
    }
}

export default connectDB;