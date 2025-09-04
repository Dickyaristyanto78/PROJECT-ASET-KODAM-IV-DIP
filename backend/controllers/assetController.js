
const pool = require('../db');

// Fungsi helper untuk parse lokasi JSON
const parseAssetLocation = (asset) => {
  if (asset.lokasi && typeof asset.lokasi === 'string') {
    try {
      return { ...asset, lokasi: JSON.parse(asset.lokasi) };
    } catch (e) {
      console.error(`Gagal parse lokasi untuk aset ID ${asset.id}:`, e);
      return { ...asset, lokasi: null }; // Kembalikan null jika parse gagal
    }
  }
  return asset;
};

// Mengambil semua aset
const getAllAssets = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assets');
    const assets = rows.map(parseAssetLocation);
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data aset.', error: error.message });
  }
};

// Mengambil satu aset berdasarkan ID
const getAssetById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Aset tidak ditemukan.' });
    }
    const asset = parseAssetLocation(rows[0]);
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data aset.', error: error.message });
  }
};

// Membuat aset baru
const createAsset = async (req, res) => {
  const { id, nama, korem_id, kodim_id, luas, lokasi, alamat, peruntukan, status, asal_milik, bukti_pemilikan_url, sertifikat_luas, belum_sertifikat_luas, keterangan } = req.body;
  try {
    await pool.query(
      `INSERT INTO assets (id, nama, korem_id, kodim_id, luas, lokasi, alamat, peruntukan, status, asal_milik, bukti_pemilikan_url, sertifikat_luas, belum_sertifikat_luas, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nama, korem_id, kodim_id, luas, JSON.stringify(lokasi), alamat, peruntukan, status, asal_milik, bukti_pemilikan_url, sertifikat_luas, belum_sertifikat_luas, keterangan]
    );
    res.status(201).json({ message: 'Aset berhasil dibuat.', id });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat aset.', error: error.message });
  }
};

// Memperbarui aset
const updateAsset = async (req, res) => {
  const { id } = req.params;
  const { nama, korem_id, kodim_id, luas, lokasi, alamat, peruntukan, status, asal_milik, bukti_pemilikan_url, sertifikat_luas, belum_sertifikat_luas, keterangan } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE assets SET nama = ?, korem_id = ?, kodim_id = ?, luas = ?, lokasi = ?, alamat = ?, peruntukan = ?, status = ?, asal_milik = ?, bukti_pemilikan_url = ?, sertifikat_luas = ?, belum_sertifikat_luas = ?, keterangan = ?
       WHERE id = ?`,
      [nama, korem_id, kodim_id, luas, JSON.stringify(lokasi), alamat, peruntukan, status, asal_milik, bukti_pemilikan_url, sertifikat_luas, belum_sertifikat_luas, keterangan, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Aset tidak ditemukan.' });
    }
    res.status(200).json({ message: `Aset dengan ID ${id} berhasil diperbarui.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui aset.', error: error.message });
  }
};

// Menghapus aset
const deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Aset tidak ditemukan.' });
    }
    res.status(200).json({ message: `Aset dengan ID ${id} berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus aset.', error: error.message });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
