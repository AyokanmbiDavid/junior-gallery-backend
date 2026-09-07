import express from 'express';
import { upload } from '../middleware/upload.js';
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
router.post('/', upload.single('image'), createStatus);
router.put('/:id', upload.single('image'), updateStatus);
router.patch('/:id/toggle-new', toggleNewTag);
router.patch('/:id/like', likeStatus);
router.delete('/:id', deleteStatus);

export default router;