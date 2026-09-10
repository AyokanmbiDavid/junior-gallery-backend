import express from 'express';
// FIXED: Imported the custom crash-safe single field wrapper
import { safeUploadSingle } from '../middleware/upload.js'; 
import {
  getThrowbacks,
  createThrowback,
  updateThrowback,
  likeThrowback,
  deleteThrowback,
} from '../controllers/throwbackController.js';

const router = express.Router();

router.get('/', getThrowbacks);
// FIXED: Swapped upload.single to safeUploadSingle
router.post('/', safeUploadSingle('image'), createThrowback);
router.put('/:id', safeUploadSingle('image'), updateThrowback);
router.patch('/:id/like', likeThrowback);
router.delete('/:id', deleteThrowback);

export default router;
