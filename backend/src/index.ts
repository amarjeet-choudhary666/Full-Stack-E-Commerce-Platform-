import { app } from "./app"
import { connectDB } from "./db"
import dotenv from "dotenv"

dotenv.config()

const mongoUri = process.env.MONGO_URI

connectDB(mongoUri!)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("✅connected to server successfully", process.env.PORT)
    })
})
.catch((err: any) => {
    console.log("Failed to connect db", err)
})