import Throwback from '../models/Throwback.js';
import { uploadToDrive, deleteFromDrive } from '../config/googleDrive.js';

// Get throwbacks with search
export const getThrowbacks = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search ? { description: { $regex: search, $options: 'i' } } : {};
    const throwbacks = await Throwback.find(filter).sort({ createdAt: -1 });
    res.status(200).json(throwbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create throwback
export const createThrowback = async (req, res) => {
  try {
    const { description } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image file required' });

    const fileName = `throwback_${Date.now()}_${req.file.originalname}`;
    const driveFile = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);

    const throwback = await Throwback.create({
      description,
      src: driveFile.directLink,
      googleDriveId: driveFile.fileId,
    });

    res.status(201).json(throwback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update throwback
export const updateThrowback = async (req, res) => {
  try {
    const { description } = req.body;
    const throwback = await Throwback.findById(req.params.id);
    if (!throwback) return res.status(404).json({ error: 'Throwback not found' });

    if (description) throwback.description = description;

    if (req.file) { 
      await deleteFromDrive(throwback.googleDriveId);

      const fileName = `throwback_${Date.now()}_${req.file.originalname}`;
      const driveFile = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);

      throwback.src = driveFile.directLink;
      throwback.googleDriveId = driveFile.fileId;
    }

    await throwback.save();
    res.status(200).json(throwback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Increment Likes
export const likeThrowback = async (req, res) => {
  try {
    const throwback = await Throwback.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.status(200).json(throwback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete throwback
export const deleteThrowback = async (req, res) => {
  try {
    const throwback = await Throwback.findById(req.params.id);
    if (!throwback) return res.status(404).json({ error: 'Throwback not found' });

    await deleteFromDrive(throwback.googleDriveId);
    await throwback.deleteOne();
    res.status(200).json({ message: 'Throwback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};