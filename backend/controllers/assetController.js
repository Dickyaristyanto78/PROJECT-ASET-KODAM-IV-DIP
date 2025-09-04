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
    const [rows] = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
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
  // Ambil semua data dari body
  const { 
    id, nama, korem_id, kodim_id, luas, lokasi, alamat, peruntukan, 
    status, asal_milik, sertifikat_luas, belum_sertifikat_luas, keterangan 
  } = req.body;

  // Siapkan data untuk dimasukkan ke database
  const newAsset = {
    id, nama, korem_id, kodim_id, luas, alamat, peruntukan, status, 
    asal_milik, sertifikat_luas, belum_sertifikat_luas, keterangan
  };

  // Handle lokasi JSON
  if (lokasi) {
    try {
      newAsset.lokasi = typeof lokasi === 'string' ? lokasi : JSON.stringify(lokasi);
    } catch (e) {
      return res.status(400).json({ message: 'Format data lokasi tidak valid.' });
    }
  }

  // Cek apakah ada file yang diupload
  if (req.file) {
    // Ganti backslash dengan forward slash untuk URL
    newAsset.bukti_pemilikan_url = req.file.path.split('\\').join('/');
  }

  // Hapus properti yang undefined agar tidak masuk ke query
  Object.keys(newAsset).forEach(key => newAsset[key] === undefined && delete newAsset[key]);

  const fields = Object.keys(newAsset).join(', ');
  const placeholders = Object.keys(newAsset).map(() => '?').join(', ');
  const values = Object.values(newAsset);

  const sql = `INSERT INTO assets (${fields}) VALUES (${placeholders})`;

  try {
    const [result] = await pool.query(sql, values);
    const insertId = result.insertId;
    
    // Ambil data yang baru dibuat untuk dikirim kembali
    const [newRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [insertId]);
    if (newRows.length > 0) {
      res.status(201).json(parseAssetLocation(newRows[0]));
    } else {
      res.status(201).json({ message: 'Aset berhasil dibuat.', id: insertId });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: 'Gagal membuat aset.', error: error.message });
  }
};

// Memperbarui aset
const updateAsset = async (req, res) => {
  const { id } = req.params;
  const { 
    nama, korem_id, kodim_id, luas, lokasi, alamat, peruntukan, 
    status, asal_milik, sertifikat_luas, belum_sertifikat_luas, keterangan 
  } = req.body;

  const updateData = {
    nama, korem_id, kodim_id, luas, alamat, peruntukan, status, 
    asal_milik, sertifikat_luas, belum_sertifikat_luas, keterangan
  };
  
  // Handle lokasi JSON
  if (lokasi) {
    try {
        updateData.lokasi = typeof lokasi === 'string' ? lokasi : JSON.stringify(lokasi);
    } catch (e) {
        return res.status(400).json({ message: 'Format data lokasi tidak valid.' });
    }
  }

  // Cek apakah ada file baru yang diupload
  if (req.file) {
    // Ganti backslash dengan forward slash untuk URL
    updateData.bukti_pemilikan_url = req.file.path.split('\\').join('/');
  } else if (req.body.bukti_pemilikan_url) {
    // Jika tidak ada file baru, gunakan URL lama dari body
    updateData.bukti_pemilikan_url = req.body.bukti_pemilikan_url;
  }

  // Hapus properti yang undefined agar tidak mengupdate field yang tidak diinginkan
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'Tidak ada data untuk diperbarui.' });
  }

  const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updateData), id];

  const sql = `UPDATE assets SET ${fields} WHERE id = ?`;

  try {
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Aset tidak ditemukan.' });
    }
    
    // Ambil data terbaru untuk dikirim balik
    const [updatedRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    res.status(200).json(parseAssetLocation(updatedRows[0]));

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: 'Gagal memperbarui aset.', error: error.message });
  }
};

// Menghapus aset
const deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    // Di sini bisa ditambahkan logika untuk menghapus file terkait dari folder 'uploads' jika perlu
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
