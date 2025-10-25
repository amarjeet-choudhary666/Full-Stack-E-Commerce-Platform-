import mongoose from "mongoose";

export const  connectDB = async (mongoUri: string) => {
    try {
        const connectionInstances = await mongoose.connect(mongoUri, {
            dbName: "ECommerce_Platform"
        })
        console.log(`DB connected to host ${connectionInstances.connection.host}`)
    } catch (error: any) {
        console.log("Failed to connect db", error)
        process.exit(1)
    }
}