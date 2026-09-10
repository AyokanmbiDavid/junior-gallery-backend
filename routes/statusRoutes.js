import express from 'express';
// FIXED: Imported the custom crash-safe single field wrapper
import { safeUploadSingle } from '../middleware/upload.js'; 
import {
  getStatuses,
  createStatus,
  updateStatus,
  toggleNewTag,
  likeStatus,
  deleteStatus,
} from '../controllers/statusController.js';

const router = express.Router();

router.get('/', getStatuses);
// FIXED: Swapped upload.single to safeUploadSingle
router.post('/', safeUploadSingle('image'), createStatus);
router.put('/:id', safeUploadSingle('image'), updateStatus);
router.patch('/:id/toggle-new', toggleNewTag);
router.patch('/:id/like', likeStatus);
router.delete('/:id', deleteStatus);

export default router;
