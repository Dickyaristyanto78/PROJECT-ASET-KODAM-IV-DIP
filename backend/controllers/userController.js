
const pool = require('../db');

// Fungsi untuk login user
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password harus diisi.' });
  }

  try {
    // Cari user berdasarkan username
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    // Jika user tidak ditemukan
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const user = rows[0];

    // Bandingkan password (untuk sekarang, perbandingan teks biasa)
    // PERINGATAN: Di aplikasi produksi, Anda HARUS menggunakan hashing (misalnya bcrypt) untuk keamanan.
    if (user.password !== password) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    // Jika berhasil, kirim data user (tanpa password)
    const { password: _, ...userData } = user;
    res.status(200).json(userData);

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

module.exports = {
  login,
};
