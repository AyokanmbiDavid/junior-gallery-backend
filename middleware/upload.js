import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { 
    // FIXED: Changed to 5 * 1024 * 1024 to exactly enforce a real 5MB cap as per your comment
    fileSize: 5 * 1024 * 1024 
  }, 
  fileFilter: (req, file, cb) => {
    // Safely checks if the incoming file mimetype starts with "image/" (e.g. image/jpeg, image/png, image/webp)
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // Pass false instead of throwing a raw crash error. We handle the error inside the route instead!
      cb(null, false); 
    }
  },
});

/**
 * CRITICAL CRASH-PROOF MIDDLEWARE WRAPPER
 * This catches Multer errors safely so your backend server never goes down.
 */
export const safeUploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadField = upload.single(fieldName);

    uploadField(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Catches specific Multer limits (like File Too Large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large! Maximum limit is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        // Catches generic system errors
        return res.status(500).json({ error: err.message });
      }

      // If the fileFilter rejected the file, req.file will be undefined
      if (!req.file && req.method === 'POST') {
        return res.status(400).json({ error: 'Invalid file upload. Only image files (JPEG, PNG, WEBP, etc.) are allowed!' });
      }

      // Everything went perfectly, move to your controller function safely
      next();
    });
  };
};
