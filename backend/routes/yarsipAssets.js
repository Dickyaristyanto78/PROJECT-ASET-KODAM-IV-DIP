
const express = require('express');
const router = express.Router();

const yarsipAssetController = require('../controllers/yarsipAssetController');

router.get('/', yarsipAssetController.getAllYarsipAssets);
router.get('/download', yarsipAssetController.downloadYarsipAssetsAsExcel);
router.post('/', yarsipAssetController.createYarsipAsset);
router.delete('/:id', yarsipAssetController.deleteYarsipAsset);

module.exports = router;
