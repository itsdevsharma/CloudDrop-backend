import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from "cloudinary";

//importing routes
import user from "./routes/user.routes.js"
import file from "./routes/file.routes.js"

dotenv.config();

const app = express();

//Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Database connection
mongoose
.connect(process.env.MONGO_URI)
.then( () => console.log("MongoDB Connected"))
.catch((err) => console.log("DB error", err));

// Base route
app.get("/", async ( req, res ) => {
    res.send("Mini google drive's backend running");
})

console.log("Cloudinary config:", cloudinary.config());
//API routes running
app.use("/api/user", user);
app.use("/api/file", file);

export default app;

