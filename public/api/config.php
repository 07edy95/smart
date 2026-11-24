<?php
/**
 * =========================================================================
 * KONFIGURASI DATABASE MYSQL HOSTINGER
 * SISTEM MANAJEMEN SEKOLAH - SMA MEDANGGILI CIRUAS (NPSN: 20605358)
 * =========================================================================
 * 
 * Silakan sesuaikan 3 baris di bawah ini dengan informasi database yang
 * Anda buat di Hostinger hPanel -> Databases -> MySQL Databases:
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'u190882518_sekolah');  // Database MySQL Hostinger
define('DB_USER', 'u190882518_admin');    // Username Database Hostinger
define('DB_PASS', '123@Hanum');           // Password Database Hostinger
define('DB_PORT', '3306');

// -------------------------------------------------------------------------
// HEADER RESPON & KEAMANAN CORS
// -------------------------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Tangani Preflight OPTIONS Request dari browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Fungsi koneksi PDO ke MySQL Hostinger
 */
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        $pdo->exec("SET NAMES utf8mb4");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'code' => 500,
            'message' => 'Gagal terhubung ke database MySQL Hostinger.',
            'error_detail' => $e->getMessage(),
            'panduan_solusi' => [
                '1. Buka file api/config.php di File Manager Hostinger.',
                '2. Pastikan DB_NAME sesuai dengan nama database di hPanel (contoh: u123456789_sekolah).',
                '3. Pastikan DB_USER sesuai dengan username yang diberi hak akses.',
                '4. Pastikan DB_PASS sesuai dengan password yang dibuat.',
                '5. Pastikan Anda sudah mengimpor file hostinger_database.sql di phpMyAdmin.'
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit();
    }
}
