const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const assetController = require('../controllers/assetController');

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Tentukan folder penyimpanan
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari konflik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter untuk hanya menerima jenis file tertentu (opsional, tapi direkomendasikan)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Error: File type not allowed! Only JPEG, PNG, GIF, PDF are allowed.');
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Batas ukuran file 10MB
  fileFilter: fileFilter
});

// Definisikan rute untuk aset, terapkan middleware multer
router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);
// Gunakan multer middleware untuk menangani upload file pada rute POST
router.post('/', upload.single('bukti_pemilikan'), assetController.createAsset);
// Gunakan multer middleware untuk menangani upload file pada rute PUT
router.put('/:id', upload.single('bukti_pemilikan'), assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;