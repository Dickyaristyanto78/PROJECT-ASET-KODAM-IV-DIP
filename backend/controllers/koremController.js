
const pool = require('../db');

// Mengambil semua data korem
const getAllKorem = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM korem');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data korem.', error: error.message });
  }
};

// Mengambil data kodim berdasarkan korem_id
const getKodimByKoremId = async (req, res) => {
    const { koremId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM kodim WHERE korem_id = ?', [koremId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: `Gagal mengambil data kodim untuk korem id ${koremId}.`, error: error.message });
    }
};


module.exports = {
  getAllKorem,
  getKodimByKoremId,
};
