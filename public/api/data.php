<?php
/**
 * =========================================================================
 * UNIVERSAL REST CRUD API UNTUK MYSQL HOSTINGER
 * SISTEM MANAJEMEN SEKOLAH - SMA MEDANGGILI CIRUAS
 * =========================================================================
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
$method = $_SERVER['REQUEST_METHOD'];
$table = isset($_GET['table']) ? trim($_GET['table']) : '';
$id = isset($_GET['id']) ? trim($_GET['id']) : '';
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

// Tangani aksi pembersihan seluruh data sekolah (Clear All Dummy Data)
if ($action === 'clear_all_school_data') {
    $tablesToClear = [
        'teacher_attendance', 'student_attendance', 'grades', 'grade_components',
        'assignment_submissions', 'assignments', 'learning_materials',
        'exam_participants', 'exams', 'class_students', 'schedules',
        'students', 'classes', 'subjects', 'teachers',
        'announcements', 'academic_events', 'inventory_loans', 'inventory',
        'incoming_letters', 'outgoing_letters', 'payment_transactions',
        'student_bills', 'activity_logs', 'notifications'
    ];
    $pdo->beginTransaction();
    foreach ($tablesToClear as $tbl) {
        $pdo->exec("DELETE FROM `{$tbl}`");
    }
    // Hapus juga akun profil guru dan siswa (sisakan akun master administrator)
    $pdo->exec("DELETE FROM `profiles` WHERE `role` != 'admin'");
    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Seluruh data sekolah berhasil dibersihkan secara permanen dari database MySQL Hostinger.'
    ]);
    exit();
}

// Whitelist tabel yang diperbolehkan demi keamanan
$allowedTables = [
    'profiles', 'academic_years', 'semesters', 'school_settings', 
    'teachers', 'classes', 'subjects', 'students', 'class_students', 
    'schedules', 'student_attendance', 'teacher_attendance', 'teaching_journals', 
    'grade_components', 'grades', 'final_grades', 'assignments', 
    'assignment_submissions', 'learning_materials', 'exams', 'exam_participants', 
    'exam_results', 'announcements', 'academic_events', 'inventory', 
    'inventory_loans', 'incoming_letters', 'outgoing_letters', 
    'payment_types', 'student_bills', 'payment_transactions', 
    'activity_logs', 'notifications'
];

if (!in_array($table, $allowedTables)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Tabel tidak valid atau tidak diizinkan: ' . htmlspecialchars($table)
    ]);
    exit();
}

$inputData = json_decode(file_get_contents('php://input'), true);

// Fungsi pembantu generate UUID v4
function generateUuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    // Ambil daftar kolom aktual dari tabel untuk validasi input
    $colStmt = $pdo->query("SHOW COLUMNS FROM `{$table}`");
    $allowedCols = $colStmt->fetchAll(PDO::FETCH_COLUMN);

    // -------------------------------------------------------------
    // GET: Ambil Data
    // -------------------------------------------------------------
    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM `{$table}` WHERE `id` = :id LIMIT 1");
            $stmt->execute(['id' => $id]);
            $row = $stmt->fetch();
            if ($row) {
                echo json_encode(['status' => 'success', 'data' => $row]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Data tidak ditemukan.']);
            }
            exit();
        }

        // Filter sederhana via query param
        $whereClauses = [];
        $params = [];
        foreach ($_GET as $key => $val) {
            if (!in_array($key, ['table', 'id', 'action', 'limit', 'offset', 'order_by', 'order_dir']) && in_array($key, $allowedCols)) {
                $whereClauses[] = "`{$key}` = :{$key}";
                $params[$key] = $val;
            }
        }

        $sql = "SELECT * FROM `{$table}`";
        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Urutan
        $orderBy = isset($_GET['order_by']) ? preg_replace('/[^a-zA-Z0-9_]/', '', $_GET['order_by']) : 'created_at';
        $orderDir = (isset($_GET['order_dir']) && strtoupper($_GET['order_dir']) === 'ASC') ? 'ASC' : 'DESC';

        if (in_array($orderBy, $allowedCols)) {
            $sql .= " ORDER BY `{$orderBy}` {$orderDir}";
        }

        if (isset($_GET['limit'])) {
            $limit = (int) $_GET['limit'];
            $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
            $sql .= " LIMIT {$offset}, {$limit}";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'table' => $table,
            'count' => count($rows),
            'data' => $rows
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit();
    }

    // -------------------------------------------------------------
    // POST: Tambah Data (Single atau Bulk)
    // -------------------------------------------------------------
    if ($method === 'POST') {
        if ($action === 'bulk_insert' && is_array($inputData)) {
            $pdo->beginTransaction();
            $insertedCount = 0;
            foreach ($inputData as $row) {
                if (!is_array($row)) continue;
                if (empty($row['id'])) {
                    $row['id'] = generateUuid();
                }
                $filteredRow = array_intersect_key($row, array_flip($allowedCols));
                if (empty($filteredRow)) continue;

                $keys = array_keys($filteredRow);
                $fields = "`" . implode("`, `", $keys) . "`";
                $placeholders = ":" . implode(", :", $keys);
                
                // Gunakan ON DUPLICATE KEY UPDATE untuk id agar idempotent
                $updateParts = [];
                foreach ($keys as $k) {
                    if ($k !== 'id') {
                        $updateParts[] = "`{$k}` = VALUES(`{$k}`)";
                    }
                }
                $onDup = !empty($updateParts) ? " ON DUPLICATE KEY UPDATE " . implode(", ", $updateParts) : "";

                $insertSql = "INSERT INTO `{$table}` ({$fields}) VALUES ({$placeholders}){$onDup}";
                $stmt = $pdo->prepare($insertSql);
                $stmt->execute($filteredRow);
                $insertedCount++;
            }
            $pdo->commit();
            echo json_encode([
                'status' => 'success',
                'message' => "Berhasil menyimpan {$insertedCount} data ke {$table}."
            ]);
            exit();
        }

        if (empty($inputData) || !is_array($inputData)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data input tidak valid.']);
            exit();
        }

        if (empty($inputData['id'])) {
            $inputData['id'] = generateUuid();
        }

        $filteredData = array_intersect_key($inputData, array_flip($allowedCols));
        if (empty($filteredData)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Tidak ada kolom yang cocok dengan skema tabel.']);
            exit();
        }

        $keys = array_keys($filteredData);
        $fields = "`" . implode("`, `", $keys) . "`";
        $placeholders = ":" . implode(", :", $keys);

        $updateParts = [];
        foreach ($keys as $k) {
            if ($k !== 'id') {
                $updateParts[] = "`{$k}` = VALUES(`{$k}`)";
            }
        }
        $onDup = !empty($updateParts) ? " ON DUPLICATE KEY UPDATE " . implode(", ", $updateParts) : "";

        $sql = "INSERT INTO `{$table}` ({$fields}) VALUES ({$placeholders}){$onDup}";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($filteredData);

        echo json_encode([
            'status' => 'success',
            'message' => 'Data berhasil disimpan ke database MySQL Hostinger.',
            'id' => $filteredData['id'],
            'data' => $filteredData
        ]);
        exit();
    }

    // -------------------------------------------------------------
    // PUT: Update Data
    // -------------------------------------------------------------
    if ($method === 'PUT') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Parameter id wajib diisi untuk update.']);
            exit();
        }

        if (empty($inputData) || !is_array($inputData)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data input tidak valid.']);
            exit();
        }

        // Hilangkan id dari kolom yang di-set
        unset($inputData['id']);
        $filteredData = array_intersect_key($inputData, array_flip($allowedCols));

        if (empty($filteredData)) {
            echo json_encode(['status' => 'success', 'message' => 'Tidak ada kolom yang diperbarui.', 'id' => $id]);
            exit();
        }

        $setParts = [];
        $params = ['_id' => $id];
        foreach ($filteredData as $key => $val) {
            $setParts[] = "`{$key}` = :{$key}";
            $params[$key] = $val;
        }

        $sql = "UPDATE `{$table}` SET " . implode(", ", $setParts) . " WHERE `id` = :_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'status' => 'success',
            'message' => 'Data berhasil diperbarui di database MySQL Hostinger.',
            'id' => $id
        ]);
        exit();
    }

    // -------------------------------------------------------------
    // DELETE: Hapus Data (Single, Bulk, atau Clear Table)
    // -------------------------------------------------------------
    if ($method === 'DELETE' || ($method === 'POST' && in_array($action, ['delete', 'bulk_delete', 'clear_table']))) {
        // 1. Bulk Delete via POST/DELETE
        if ($action === 'bulk_delete' && !empty($inputData) && is_array($inputData)) {
            $ids = array_filter(array_map('trim', $inputData));
            if (empty($ids)) {
                echo json_encode(['status' => 'success', 'deleted' => 0]);
                exit();
            }
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM `{$table}` WHERE `id` IN ({$placeholders})");
            $stmt->execute(array_values($ids));
            echo json_encode([
                'status' => 'success',
                'message' => "Berhasil menghapus " . count($ids) . " data dari {$table}.",
                'deleted' => count($ids)
            ]);
            exit();
        }

        // 2. Clear seluruh tabel
        if ($action === 'clear_table') {
            $pdo->exec("DELETE FROM `{$table}`");
            echo json_encode([
                'status' => 'success',
                'message' => "Seluruh data pada tabel {$table} berhasil dibersihkan."
            ]);
            exit();
        }

        // 3. Single Delete berdasarkan ID
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Parameter id wajib diisi untuk hapus.']);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM `{$table}` WHERE `id` = :id");
        $stmt->execute(['id' => $id]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Data berhasil dihapus dari database MySQL Hostinger.',
            'id' => $id
        ]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'code' => 500,
        'message' => 'Database Error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
