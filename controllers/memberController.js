import Member from '../models/Member.js';
import { uploadToDrive, deleteFromDrive } from '../config/googleDrive.js';

// Get members (Optional filter by class)
export const getMembers = async (req, res) => {
  try {
    const { className } = req.query;
    const filter = className ? { class: className } : {};
    const members = await Member.find(filter).sort({ name: 1 });
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new member / teacher
export const createMember = async (req, res) => {
  try {
    const { name, className, role } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image file required' });

    // Upload to Google Drive
    const fileName = `member_${Date.now()}_${req.file.originalname}`;
    const driveFile = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);

    const member = await Member.create({
      name,
      class: className,
      role,
      image: driveFile.directLink,
      googleDriveId: driveFile.fileId,
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update member
export const updateMember = async (req, res) => {
  try {
    const { name, className, role } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    if (name) member.name = name;
    if (className) member.class = className;
    if (role) member.role = role;

    if (req.file) {
      // Delete old photo from Drive
      await deleteFromDrive(member.googleDriveId);

      // Upload new photo to Drive
      const fileName = `member_${Date.now()}_${req.file.originalname}`;
      const driveFile = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);

      member.image = driveFile.directLink;
      member.googleDriveId = driveFile.fileId;
    }

    await member.save();
    res.status(200).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    await deleteFromDrive(member.googleDriveId);
    await member.deleteOne();
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};