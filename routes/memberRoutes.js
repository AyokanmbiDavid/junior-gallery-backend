import express from 'express';
// FIXED: Imported the custom crash-safe single field wrapper
import { safeUploadSingle } from '../middleware/upload.js'; 
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';

const router = express.Router();

router.get('/', getMembers);
// FIXED: Swapped upload.single to safeUploadSingle
router.post('/', safeUploadSingle('image'), createMember);
router.put('/:id', safeUploadSingle('image'), updateMember);
router.delete('/:id', deleteMember);

export default router;
