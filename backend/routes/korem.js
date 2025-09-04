
const express = require('express');
const router = express.Router();

const koremController = require('../controllers/koremController');

// GET /api/korem -> Mengambil semua korem
router.get('/', koremController.getAllKorem);

// GET /api/korem/:koremId/kodim -> Mengambil semua kodim berdasarkan korem_id
router.get('/:koremId/kodim', koremController.getKodimByKoremId);


module.exports = router;
