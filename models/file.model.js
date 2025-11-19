import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename: {type: String, required: true, unique: true},
    fileUrl: {type: String, required: true,  unique: true},
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export default mongoose.model("File", fileSchema);