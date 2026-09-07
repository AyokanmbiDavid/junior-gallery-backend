import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    class: {
      type: String,
      required: true,
      enum: ['Toddlers', 'Children', 'Pre-teens', 'Teenagers'],
    },
    role: { type: String, enum: ['Teacher', 'Member'], required: true },
    image: { type: String, required: true },
    googleDriveId: {
    type: String,
    required: true,
    }  },
  { timestamps: true }
);

export default mongoose.model('Member', memberSchema);