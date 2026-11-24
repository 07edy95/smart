<?php
/**
 * =========================================================================
 * ENDPOINT UPLOAD BERKAS KE HOSTING HOSTINGER
 * SISTEM MANAJEMEN SEKOLAH - SMA MEDANGGILI CIRUAS
 * =========================================================================
 */

require_once __DIR__ . '/config.php';

$uploadDir = dirname(__DIR__) . '/uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Tidak ada file yang diunggah atau terjadi kesalahan unggah.']);
        exit();
    }

    $file = $_FILES['file'];
    $allowedExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'svg', 'zip'];
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileExt, $allowedExts)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Format file tidak diizinkan. Format yang didukung: ' . implode(', ', $allowedExts)]);
        exit();
    }

    // Maksimal 20MB
    if ($file['size'] > 20 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Ukuran file melebihi batas maksimal 20MB.']);
        exit();
    }

    $safeName = time() . '_' . bin2hex(random_bytes(6)) . '.' . $fileExt;
    $targetPath = $uploadDir . $safeName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $publicUrl = $protocol . $host . '/uploads/' . $safeName;

        echo json_encode([
            'status' => 'success',
            'message' => 'File berhasil diunggah ke hosting Hostinger.',
            'file_name' => $safeName,
            'original_name' => $file['name'],
            'url' => $publicUrl
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal memindahkan file ke folder uploads.']);
        exit();
    }
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Metode tidak didukung. Gunakan POST multipart/form-data.']);
