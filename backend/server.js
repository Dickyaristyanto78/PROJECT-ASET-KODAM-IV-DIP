
const express = require('express');
const cors = require('cors');
const path = require('path');

// Impor rute
const assetRoutes = require('./routes/assets');
const koremRoutes = require('./routes/korem');
const userRoutes = require('./routes/users');
const yarsipAssetRoutes = require('./routes/yarsipAssets');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing
app.use(express.json()); // Mengizinkan parsing body JSON dari request
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Menyajikan file statis dari folder 'uploads'

// Rute Dasar
app.get('/', (req, res) => {
  res.send('Selamat datang di API Aset Kodam IV Diponegoro!');
});

// Gunakan Rute
app.use('/api/assets', assetRoutes);
app.use('/api/korem', koremRoutes);
app.use('/api/users', userRoutes);
app.use('/api/yarsip-assets', yarsipAssetRoutes);

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});
