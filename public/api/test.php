<?php
/**
 * =========================================================================
 * SKRIP DIAGNOSTIK KONEKSI MYSQL HOSTINGER
 * Akses di browser: https://domain-anda.com/api/test.php
 * =========================================================================
 */

require_once __DIR__ . '/config.php';

try {
    $pdo = getDbConnection();
    
    // Ambil daftar tabel yang ada
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Hitung beberapa data penting
    $stats = [];
    if (in_array('school_settings', $tables)) {
        $school = $pdo->query("SELECT school_name, npsn FROM school_settings LIMIT 1")->fetch();
        $stats['school'] = $school;
    }
    if (in_array('students', $tables)) {
        $stats['total_students'] = (int) $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
    }
    if (in_array('teachers', $tables)) {
        $stats['total_teachers'] = (int) $pdo->query("SELECT COUNT(*) FROM teachers")->fetchColumn();
    }
    if (in_array('classes', $tables)) {
        $stats['total_classes'] = (int) $pdo->query("SELECT COUNT(*) FROM classes")->fetchColumn();
    }
    if (in_array('profiles', $tables)) {
        $stats['total_users'] = (int) $pdo->query("SELECT COUNT(*) FROM profiles")->fetchColumn();
    }

    echo json_encode([
        'status' => 'success',
        'code' => 200,
        'message' => 'Selamat! Aplikasi berhasil terhubung ke Database MySQL Hostinger.',
        'environment' => [
            'php_version' => PHP_VERSION,
            'database_host' => DB_HOST,
            'database_name' => DB_NAME,
            'total_tables' => count($tables),
            'tables' => $tables
        ],
        'data_summary' => $stats,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'code' => 500,
        'message' => 'Terjadi kesalahan saat memeriksa database: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
