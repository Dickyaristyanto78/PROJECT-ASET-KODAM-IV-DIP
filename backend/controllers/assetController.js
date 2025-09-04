const pool = require('../db');
const ExcelJS = require('exceljs');

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

// Fungsi untuk men-download data aset sebagai file Excel
const downloadAssetsAsExcel = async (req, res) => {
  try {
    // Query dasar untuk mengambil data aset dengan join ke tabel korem dan kodim
    let query = `
      SELECT 
        a.id, a.nama as nup, k.nama as nama_korem, ko.nama as nama_kodim, a.alamat, 
        a.peruntukan, a.status, a.luas, a.sertifikat_luas, a.belum_sertifikat_luas,
        a.asal_milik, a.keterangan, a.bukti_pemilikan_url, a.created_at, a.updated_at
      FROM assets as a
      LEFT JOIN korem as k ON a.korem_id = k.id
      LEFT JOIN kodim as ko ON a.kodim_id = ko.id
    `;

    const { korem_id, kodim_id, status } = req.query;
    const conditions = [];
    const params = [];

    if (korem_id) {
      conditions.push('a.korem_id = ?');
      params.push(korem_id);
    }
    if (kodim_id) {
      conditions.push('a.kodim_id = ?');
      params.push(kodim_id);
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.created_at DESC';

    const [rows] = await pool.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Aset Tanah');

    // Definisikan kolom-kolom di Excel
    worksheet.columns = [
      { header: 'NUP', key: 'nup', width: 15 },
      { header: 'Wilayah Korem', key: 'nama_korem', width: 25 },
      { header: 'Wilayah Kodim', key: 'nama_kodim', width: 25 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Peruntukan', key: 'peruntukan', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Luas Peta (m²)', key: 'luas', width: 18 },
      { header: 'Luas Sertifikat (m²)', key: 'sertifikat_luas', width: 22 },
      { header: 'Luas Belum Sertifikat (m²)', key: 'belum_sertifikat_luas', width: 28 },
      { header: 'Asal Kepemilikan', key: 'asal_milik', width: 20 },
      { header: 'Keterangan', key: 'keterangan', width: 40 },
      { header: 'URL Bukti Kepemilikan', key: 'bukti_pemilikan_url', width: 50 },
      { header: 'Tanggal Dibuat', key: 'created_at', width: 20 },
      { header: 'Tanggal Diperbarui', key: 'updated_at', width: 20 }
    ];

    // Beri style pada header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'FFD3D3D3'} // Warna abu-abu muda
        };
        cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
        };
    });

    // Tambahkan data baris
    rows.forEach(asset => {
      worksheet.addRow({
        ...asset,
        created_at: asset.created_at ? new Date(asset.created_at).toLocaleString('id-ID') : '',
        updated_at: asset.updated_at ? new Date(asset.updated_at).toLocaleString('id-ID') : ''
      });
    });

    // Set header untuk memberitahu browser bahwa ini adalah file Excel
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Data_Aset_Tanah.xlsx"'
    );

    // Tulis workbook ke response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Gagal membuat file Excel:', error);
    res.status(500).json({ message: 'Gagal membuat file Excel.', error: error.message });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  downloadAssetsAsExcel,
};
