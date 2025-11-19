import express from "express";
import multer from "multer";
import cloudinary from "../config/db.js";
import fileModel from "../models/file.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Use memory storage (serverless safe)
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary config
cloudinary.v2.config({
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
      const stream = cloudinary.v2.uploader.upload_stream(
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

// VIEW FILES
router.get("/my-files", auth, async (req, res) => {
  const files = await fileModel.find({ uploadedBy: req.user.id });
  res.json(files);
});

// DELETE FILE
router.delete("/:id", auth, async (req, res) => {
  const file = await fileModel.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "Not found" });

  await fileModel.deleteOne({ _id: req.params.id });
  res.json({ message: "Deleted" });
});

export default router;

