import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    src: { type: String, required: true },
    googleDriveId: {
  type: String,
  required: true,
},
    isNewSunday: { type: Boolean, default: true },
    likes: { type: Number, default: 0 },
    class: ['Toddlers', 'Children', 'Pre-teens', 'Teenagers'],
  },
  { timestamps: true } 
);

export default mongoose.model('Status', statusSchema);