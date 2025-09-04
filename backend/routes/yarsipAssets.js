
const express = require('express');
const router = express.Router();

const yarsipAssetController = require('../controllers/yarsipAssetController');

router.get('/', yarsipAssetController.getAllYarsipAssets);
router.post('/', yarsipAssetController.createYarsipAsset);
router.delete('/:id', yarsipAssetController.deleteYarsipAsset);

module.exports = router;
