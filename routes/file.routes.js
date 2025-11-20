import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fileModel from "../models/file.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Use memory storage (serverless safe)
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// UPLOAD FILE
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    console.log("➡️ Upload route HIT");

    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📦 Multer file:", req.file);

    // Upload using buffer stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    console.log("☁️ Cloudinary result:", result.secure_url);

    // Save file details in DB
    const file = await fileModel.create({
      filename: req.file.originalname,
      fileUrl: result.secure_url,
      size: req.file.size,
      uploadedBy: req.user.id,
    });

    res.json(file);
  } catch (error) {
    console.log("🔥 UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET MY FILES
router.get("/my-files", auth, async (req, res) => {
  try {
    const files = await fileModel.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.log("🔥 MY FILES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE FILE
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await fileModel.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await fileModel.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.log("🔥 DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
