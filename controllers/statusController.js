import Status from '../models/Status.js';
import { uploadToDrive, deleteFromDrive } from '../config/googleDrive.js';

// Fetch statuses
export const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find().sort({ date: -1 });
    res.status(200).json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload new Sunday status
export const createStatus = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file required' });

    const fileName = `status_${Date.now()}_${req.file.originalname}`;
    const driveFile = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);

    const status = await Status.create({
      src: driveFile.directLink,
      googleDriveId: driveFile.fileId,
      isNewSunday: true,
    });

    res.status(201).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
};

// Update status
export const updateStatus = async (req, res) => {
  try {
    const { isNewSunday } = req.body;
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: 'Status not found' });

    if (isNewSunday !== undefined) {
      status.isNewSunday = isNewSunday === 'true' || isNewSunday === true;
    }

    if (req.file) {
      await deleteFromDrive(status.googleDriveId);

      const fileName = `status_${Date.now()}_${req.file.originalname}`;
      const driveFile = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);

      status.src = driveFile.directLink;
      status.googleDriveId = driveFile.fileId;
    }

    await status.save();
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle "isNewSunday" tag
export const toggleNewTag = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: 'Status not found' });

    status.isNewSunday = !status.isNewSunday;
    await status.save();
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Increment Likes
export const likeStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete status
export const deleteStatus = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: 'Status not found' });

    await deleteFromDrive(status.googleDriveId);
    await status.deleteOne();
    res.status(200).json({ message: 'Status deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};