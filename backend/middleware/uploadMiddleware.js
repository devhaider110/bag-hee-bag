const multer = require("multer");

/* =========================================================
   MEMORY STORAGE
========================================================= */

/*
 * Image backend ke disk/folder mein save nahi hogi.
 *
 * Multer image ko directly memory buffer mein rakhega,
 * jise controller Cloudinary par upload karega.
 */

const storage = multer.memoryStorage();

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  if (
    file &&
    file.mimetype &&
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only image files are allowed."
    )
  );
};

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

/* =========================================================
   BANNER IMAGE UPLOAD
========================================================= */

const uploadBannerImage =
  upload.single("image");

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  upload,
  uploadBannerImage,
};