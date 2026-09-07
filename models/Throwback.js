import mongoose from 'mongoose';

const throwbackSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    src: { type: String, required: true },
    googleDriveId: {
  type: String,
  required: true,
},
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Throwback', throwbackSchema);