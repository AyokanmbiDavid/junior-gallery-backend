import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  getThrowbacks,
  createThrowback,
  updateThrowback,
  likeThrowback,
  deleteThrowback,
} from '../controllers/throwbackController.js';

const router = express.Router();

router.get('/', getThrowbacks);
router.post('/', upload.single('image'), createThrowback);
router.put('/:id', upload.single('image'), updateThrowback);
router.patch('/:id/like', likeThrowback);
router.delete('/:id', deleteThrowback);

export default router;