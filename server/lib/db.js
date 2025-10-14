import mongoose from "mongoose";

// Function to connect to the mongodb db
export const connectDB = async () => {
    try {

        mongoose.connection.on('connected', () => console.log("Mongoose connected to DB"));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}