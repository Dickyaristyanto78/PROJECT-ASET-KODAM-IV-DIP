-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Sep 2025 pada 04.09
-- Versi server: 10.4.27-MariaDB
-- Versi PHP: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aset_kodam`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `assets`
--

CREATE TABLE `assets` (
  `id` varchar(255) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `korem_id` int(11) DEFAULT NULL,
  `kodim_id` int(11) DEFAULT NULL,
  `luas` decimal(20,2) DEFAULT NULL,
  `lokasi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`lokasi`)),
  `alamat` text DEFAULT NULL,
  `peruntukan` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `asal_milik` varchar(255) DEFAULT NULL,
  `bukti_pemilikan_url` varchar(255) DEFAULT NULL,
  `sertifikat_luas` decimal(20,2) DEFAULT NULL,
  `belum_sertifikat_luas` decimal(20,2) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `assets`
--

INSERT INTO `assets` (`id`, `nama`, `korem_id`, `kodim_id`, `luas`, `lokasi`, `alamat`, `peruntukan`, `status`, `asal_milik`, `bukti_pemilikan_url`, `sertifikat_luas`, `belum_sertifikat_luas`, `keterangan`, `created_at`, `updated_at`) VALUES
('T1756785779986', 'Semarang Tank', 5, NULL, '398973757.42', '[[[110.318719,-6.938284],[110.270614,-6.973015],[110.28642,-7.014551],[110.272676,-7.034977],[110.311159,-7.109186],[110.339335,-7.105782],[110.347582,-7.079232],[110.352392,-7.111228],[110.381255,-7.125524],[110.417677,-7.107824],[110.426611,-7.117355],[110.453412,-7.080593],[110.487085,-7.090124],[110.500829,-7.063573],[110.466469,-7.03702],[110.509763,-6.975738],[110.502204,-6.948499],[110.462346,-6.948499],[110.448601,-6.956671],[110.423862,-6.93556],[110.370259,-6.955309],[110.318719,-6.938284]]]', 'Semarang Banyumanik', 'Kantor Badan Pemerintahan', 'Aktif', 'Pembelian', '', '10000.00', '99.98', 'tanah milik tentara', '2025-09-03 04:56:41', '2025-09-03 04:56:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kodim`
--

CREATE TABLE `kodim` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `korem_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kodim`
--

INSERT INTO `kodim` (`id`, `nama`, `korem_id`) VALUES
(1, 'Kodim 0701/Banyumas', 1),
(2, 'Kodim 0702/Purbalingga', 1),
(3, 'Kodim 0703/Cilacap', 1),
(4, 'Kodim 0704/Banjarnegara', 1),
(5, 'Kodim 0734/Yogyakarta', 2),
(6, 'Kodim 0732/Sleman', 2),
(7, 'Kodim 0729/Bantul', 2),
(8, 'Kodim 0730/Gunungkidul', 2),
(9, 'Kodim 0731/Kulon Progo', 2),
(10, 'Kodim 0714/Salatiga', 3),
(11, 'Kodim 0715/Kendal', 3),
(12, 'Kodim 0716/Demak', 3),
(13, 'Kodim 0717/Purwodadi', 3),
(14, 'Kodim 0718/Pati', 3),
(15, 'Kodim 0735/Surakarta', 4),
(16, 'Kodim 0723/Sukoharjo', 4),
(17, 'Kodim 0724/Boyolali', 4),
(18, 'Kodim 0725/Sragen', 4),
(19, 'Kodim 0726/Sukowati', 4);

-- --------------------------------------------------------

--
-- Struktur dari tabel `korem`
--

CREATE TABLE `korem` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `wilayah` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `korem`
--

INSERT INTO `korem` (`id`, `nama`, `wilayah`) VALUES
(1, 'Korem 071/Wijayakusuma', 'Banyumas dan sekitarnya'),
(2, 'Korem 072/Pamungkas', 'Yogyakarta dan sekitarnya'),
(3, 'Korem 073/Makutarama', 'Salatiga dan sekitarnya'),
(4, 'Korem 074/Warastratama', 'Surakarta dan sekitarnya'),
(5, 'Kodim 0733/Kota Semarang', 'Semarang');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `created_at`) VALUES
(1, 'admin', 'password123', 'Administrator Utama', '2025-09-03 04:56:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `yarsip_assets`
--

CREATE TABLE `yarsip_assets` (
  `id` varchar(255) NOT NULL,
  `pengelola` varchar(255) DEFAULT NULL,
  `bidang` varchar(255) DEFAULT NULL,
  `kabkota` varchar(255) DEFAULT NULL,
  `kecamatan` varchar(255) DEFAULT NULL,
  `kelurahan` varchar(255) DEFAULT NULL,
  `peruntukan` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `lokasi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`lokasi`)),
  `area` decimal(20,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `korem_id` (`korem_id`),
  ADD KEY `kodim_id` (`kodim_id`);

--
-- Indeks untuk tabel `kodim`
--
ALTER TABLE `kodim`
  ADD PRIMARY KEY (`id`),
  ADD KEY `korem_id` (`korem_id`);

--
-- Indeks untuk tabel `korem`
--
ALTER TABLE `korem`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `yarsip_assets`
--
ALTER TABLE `yarsip_assets`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `kodim`
--
ALTER TABLE `kodim`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT untuk tabel `korem`
--
ALTER TABLE `korem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`korem_id`) REFERENCES `korem` (`id`),
  ADD CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`kodim_id`) REFERENCES `kodim` (`id`);

--
-- Ketidakleluasaan untuk tabel `kodim`
--
ALTER TABLE `kodim`
  ADD CONSTRAINT `kodim_ibfk_1` FOREIGN KEY (`korem_id`) REFERENCES `korem` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
