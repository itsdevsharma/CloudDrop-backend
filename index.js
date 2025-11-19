import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cloudinary from './config/db.js';
//importing routes
import user from "./routes/user.routes.js"
import file from "./routes/file.routes.js"

dotenv.config();

const app = express();


app.use((err, req, res, next) => {
  console.log("🔥 Backend Error:", err);
  res.status(500).json({ error: err.message });
});



//Middleware
app.use(express.json());
app.use(cors());

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

//Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
