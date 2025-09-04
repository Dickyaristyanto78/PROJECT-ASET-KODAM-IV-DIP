
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// --- Konfigurasi Database --- 
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Kosong sesuai input Anda
  database: 'aset_kodam', // Ganti jika nama database Anda berbeda
};

// Path ke file db.json
const jsonFilePath = path.join(__dirname, '..', 'db.json');

async function migrate() {
  let connection;
  try {
    // Baca data dari db.json
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    const data = JSON.parse(jsonData);

    // Buat koneksi ke database
    connection = await mysql.createConnection(dbConfig);
    console.log('Berhasil terhubung ke database MySQL.');

    // 1. Migrasi Tabel 'users'
    console.log('\nMemulai migrasi tabel "users"...');
    if (data.users && data.users.length > 0) {
      for (const user of data.users) {
        await connection.execute(
          'INSERT INTO users (id, username, password, name) VALUES (?, ?, ?, ?)',
          [user.id, user.username, user.password, user.name]
        );
      }
      console.log(`-> Berhasil memigrasikan ${data.users.length} user.`);
    } else {
      console.log('-> Tidak ada data user untuk dimigrasikan.');
    }

    // 2. Migrasi Tabel 'korem' dan 'kodim'
    console.log('\nMemulai migrasi tabel "korem" dan "kodim"...');
    if (data.korem && data.korem.length > 0) {
      for (const korem of data.korem) {
        // Insert Korem
        const [koremResult] = await connection.execute(
          'INSERT INTO korem (id, nama, wilayah) VALUES (?, ?, ?)',
          [korem.id, korem.nama, korem.wilayah]
        );
        const koremId = korem.id; // Menggunakan ID dari JSON

        // Insert Kodim yang berelasi
        if (korem.kodim && korem.kodim.length > 0) {
          for (const kodimNama of korem.kodim) {
            // Cek apakah kodim sudah ada untuk menghindari duplikasi
            const [existingKodim] = await connection.execute(
              'SELECT id FROM kodim WHERE nama = ? AND korem_id = ?',
              [kodimNama, koremId]
            );
            if (existingKodim.length === 0) {
              await connection.execute(
                'INSERT INTO kodim (nama, korem_id) VALUES (?, ?)',
                [kodimNama, koremId]
              );
            }
          }
        }
      }
      console.log(`-> Berhasil memigrasikan ${data.korem.length} korem beserta kodimnya.`);
    } else {
      console.log('-> Tidak ada data korem untuk dimigrasikan.');
    }
    
    // 3. Migrasi Tabel 'assets'
    console.log('\nMemulai migrasi tabel "assets"...');
    if (data.assets && data.assets.length > 0) {
      for (const asset of data.assets) {
        // Ambil kodim_id dari tabel kodim berdasarkan nama
        let kodimId = null;
        if (asset.kodim) {
            const [kodimRow] = await connection.execute('SELECT id FROM kodim WHERE nama = ?', [asset.kodim]);
            if (kodimRow.length > 0) {
                kodimId = kodimRow[0].id;
            }
        }

        await connection.execute(
          `INSERT INTO assets (id, nama, korem_id, kodim_id, luas, lokasi, alamat, peruntukan, status, asal_milik, bukti_pemilikan_url, sertifikat_luas, belum_sertifikat_luas, keterangan) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            asset.id,
            asset.nama,
            asset.korem_id,
            asset.kodim_id || kodimId,
            asset.luas,
            JSON.stringify(asset.lokasi),
            asset.alamat,
            asset.peruntukan,
            asset.status,
            asset.asal_milik,
            asset.bukti_pemilikan_url,
            asset.sertifikat_luas,
            asset.belum_sertifikat_luas,
            asset.keterangan,
          ]
        );
      }
      console.log(`-> Berhasil memigrasikan ${data.assets.length} asset.`);
    } else {
      console.log('-> Tidak ada data asset untuk dimigrasikan.');
    }

    // 4. Migrasi Tabel 'yarsip_assets'
    console.log('\nMemulai migrasi tabel "yarsip_assets"...');
    if (data.yarsip_assets && data.yarsip_assets.length > 0) {
        for (const yarsip of data.yarsip_assets) {
            await connection.execute(
                `INSERT INTO yarsip_assets (id, pengelola, bidang, kabkota, kecamatan, kelurahan, peruntukan, status, keterangan, lokasi, area, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    yarsip.id,
                    yarsip.pengelola,
                    yarsip.bidang,
                    yarsip.kabkota,
                    yarsip.kecamatan,
                    yarsip.kelurahan,
                    yarsip.peruntukan,
                    yarsip.status,
                    yarsip.keterangan,
                    JSON.stringify(yarsip.lokasi),
                    yarsip.area,
                    yarsip.created_at,
                    yarsip.updated_at
                ]
            );
        }
        console.log(`-> Berhasil memigrasikan ${data.yarsip_assets.length} yarsip asset.`);
    } else {
        console.log('-> Tidak ada data yarsip asset untuk dimigrasikan.');
    }


    console.log('\n\nMigrasi data selesai! ✨');

  } catch (error) {
    console.error('Terjadi kesalahan saat migrasi:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Koneksi ke database ditutup.');
    }
  }
}

// Jalankan fungsi migrasi
migrate();
