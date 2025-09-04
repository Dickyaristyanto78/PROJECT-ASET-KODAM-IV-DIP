
const mysql = require('mysql2/promise');

// Konfigurasi untuk koneksi database
// Gunakan informasi yang sama dari skrip migrasi Anda
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Sesuaikan jika Anda menggunakan password
  database: 'aset_kodam', // Sesuaikan dengan nama database Anda
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Membuat connection pool
const pool = mysql.createPool(dbConfig);

// Fungsi untuk menguji koneksi
pool.getConnection()
  .then(connection => {
    console.log('Berhasil terhubung ke database MySQL melalui pool.');
    connection.release(); // Melepaskan koneksi kembali ke pool
  })
  .catch(error => {
    console.error('Gagal terhubung ke database:', error);
  });

// Ekspor pool agar bisa digunakan di file lain (misalnya di controller)
module.exports = pool;
