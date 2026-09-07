import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';

const router = express.Router();

router.get('/', getMembers);
router.post('/', upload.single('image'), createMember);
router.put('/:id', upload.single('image'), updateMember);
router.delete('/:id', deleteMember);

export default router;