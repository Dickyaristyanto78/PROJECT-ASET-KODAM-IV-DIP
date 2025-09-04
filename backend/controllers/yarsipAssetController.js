
const pool = require('../db');

// Fungsi helper untuk parse lokasi JSON
const parseYarsipLocation = (asset) => {
  if (asset.lokasi && typeof asset.lokasi === 'string') {
    try {
      return { ...asset, lokasi: JSON.parse(asset.lokasi) };
    } catch (e) {
      console.error(`Gagal parse lokasi untuk aset yarsip ID ${asset.id}:`, e);
      return { ...asset, lokasi: null };
    }
  }
  return asset;
};

// Mengambil semua yarsip_assets
const getAllYarsipAssets = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM yarsip_assets');
    const assets = rows.map(parseYarsipLocation);
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data yarsip.', error: error.message });
  }
};

// Membuat yarsip_asset baru
const createYarsipAsset = async (req, res) => {
  const { id, pengelola, bidang, kabkota, kecamatan, kelurahan, peruntukan, status, keterangan, lokasi, area, created_at, updated_at } = req.body;
  try {
    await pool.query(
      `INSERT INTO yarsip_assets (id, pengelola, bidang, kabkota, kecamatan, kelurahan, peruntukan, status, keterangan, lokasi, area, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, pengelola, bidang, kabkota, kecamatan, kelurahan, peruntukan, status, keterangan, JSON.stringify(lokasi), area, created_at, updated_at]
    );
    res.status(201).json({ message: 'Aset yarsip berhasil dibuat.', id });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat aset yarsip.', error: error.message });
  }
};

// Menghapus yarsip_asset
const deleteYarsipAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM yarsip_assets WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Aset yarsip tidak ditemukan.' });
    }
    res.status(200).json({ message: `Aset yarsip dengan ID ${id} berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus aset yarsip.', error: error.message });
  }
};

module.exports = {
  getAllYarsipAssets,
  createYarsipAsset,
  deleteYarsipAsset,
};
