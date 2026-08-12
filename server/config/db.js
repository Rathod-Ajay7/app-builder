import mongoose from "mongoose"

export async function connecttodatabase() {
    mongoose.connection.on('connected', () => {
        console.log("database connected")
    });
    await mongoose.connect(process.env.MONGODB_URI);
}