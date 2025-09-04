
const pool = require('../db');
const ExcelJS = require('exceljs');

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

// Fungsi untuk men-download data aset yarsip sebagai file Excel
const downloadYarsipAssetsAsExcel = async (req, res) => {
  try {
    let query = 'SELECT * FROM yarsip_assets';
    const { bidang } = req.query;
    const params = [];

    if (bidang) {
      query += ' WHERE bidang = ?';
      params.push(bidang);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Aset Yardip');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Pengelola', key: 'pengelola', width: 30 },
      { header: 'Bidang', key: 'bidang', width: 20 },
      { header: 'Kab/Kota', key: 'kabkota', width: 25 },
      { header: 'Kecamatan', key: 'kecamatan', width: 25 },
      { header: 'Kelurahan', key: 'kelurahan', width: 25 },
      { header: 'Peruntukan', key: 'peruntukan', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 40 },
      { header: 'Luas Area (m²)', key: 'area', width: 18 },
      { header: 'Tanggal Dibuat', key: 'created_at', width: 20 },
      { header: 'Tanggal Diperbarui', key: 'updated_at', width: 20 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'FFD3D3D3'}
        };
        cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
        };
    });

    // Add rows
    rows.forEach(asset => {
      worksheet.addRow({
        ...asset,
        created_at: asset.created_at ? new Date(asset.created_at).toLocaleString('id-ID') : '',
        updated_at: asset.updated_at ? new Date(asset.updated_at).toLocaleString('id-ID') : ''
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Data_Aset_Yardip.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Gagal membuat file Excel Yarsip:', error);
    res.status(500).json({ message: 'Gagal membuat file Excel Yarsip.', error: error.message });
  }
};

module.exports = {
  getAllYarsipAssets,
  createYarsipAsset,
  deleteYarsipAsset,
  downloadYarsipAssetsAsExcel,
};
