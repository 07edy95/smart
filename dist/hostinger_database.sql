-- ==============================================================================
-- DATABASE MYSQL / MARIADB HOSTINGER
-- SISTEM MANAJEMEN SEKOLAH - SMA MEDANGGILI CIRUAS (NPSN: 20605358)
-- Kompatibel penuh dengan Hostinger Shared Hosting & phpMyAdmin
-- Karakter: utf8mb4 | Engine: InnoDB
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

-- --------------------------------------------------------
-- 1. TABEL: profiles
-- --------------------------------------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(191) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'guru', 'siswa') NOT NULL DEFAULT 'admin',
  `phone` VARCHAR(50) DEFAULT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profiles_email` (`email`),
  KEY `idx_profiles_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. TABEL: academic_years
-- --------------------------------------------------------
DROP TABLE IF EXISTS `academic_years`;
CREATE TABLE `academic_years` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TABEL: semesters
-- --------------------------------------------------------
DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
  `id` VARCHAR(36) NOT NULL,
  `academic_year_id` VARCHAR(36) NOT NULL,
  `name` ENUM('Ganjil', 'Genap') NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_semesters_academic_year` (`academic_year_id`),
  CONSTRAINT `fk_semesters_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. TABEL: school_settings
-- --------------------------------------------------------
DROP TABLE IF EXISTS `school_settings`;
CREATE TABLE `school_settings` (
  `id` VARCHAR(36) NOT NULL,
  `school_name` VARCHAR(255) NOT NULL DEFAULT 'SMA Medanggili Ciruas',
  `npsn` VARCHAR(50) NOT NULL DEFAULT '20605358',
  `nss` VARCHAR(50) DEFAULT '3010203040',
  `level` VARCHAR(50) DEFAULT 'SMA',
  `status` VARCHAR(50) DEFAULT 'Swasta',
  `address` TEXT DEFAULT NULL,
  `village` VARCHAR(100) DEFAULT 'Citerep',
  `district` VARCHAR(100) DEFAULT 'Ciruas',
  `regency` VARCHAR(100) DEFAULT 'Kabupaten Serang',
  `province` VARCHAR(100) DEFAULT 'Banten',
  `postal_code` VARCHAR(20) DEFAULT '42182',
  `email` VARCHAR(191) DEFAULT 'info@smamedanggili.sch.id',
  `phone` VARCHAR(50) DEFAULT '(0254) 281234',
  `website` VARCHAR(255) DEFAULT 'https://smamedanggili.sch.id',
  `headmaster_name` VARCHAR(255) DEFAULT 'Drs. H. Ahmad Sanusi, M.M.Pd.',
  `logo_url` TEXT DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `active_academic_year_id` VARCHAR(36) DEFAULT NULL,
  `active_semester_id` VARCHAR(36) DEFAULT NULL,
  `enable_payments` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. TABEL: teachers
-- --------------------------------------------------------
DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` VARCHAR(36) NOT NULL,
  `profile_id` VARCHAR(36) DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT '123@Guru',
  `nip` VARCHAR(50) DEFAULT NULL,
  `nuptk` VARCHAR(50) DEFAULT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `gender` ENUM('L', 'P') NOT NULL,
  `birth_place` VARCHAR(100) DEFAULT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `last_education` VARCHAR(50) DEFAULT 'S1',
  `position` VARCHAR(100) DEFAULT 'Guru Mata Pelajaran',
  `employment_status` VARCHAR(50) DEFAULT 'PNS',
  `photo_url` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_teachers_profile` (`profile_id`),
  KEY `idx_teachers_username` (`username`),
  CONSTRAINT `fk_teachers_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. TABEL: classes
-- --------------------------------------------------------
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `grade_level` VARCHAR(10) NOT NULL,
  `major` VARCHAR(50) DEFAULT NULL,
  `homeroom_teacher_id` VARCHAR(36) DEFAULT NULL,
  `academic_year_id` VARCHAR(36) DEFAULT NULL,
  `capacity` INT NOT NULL DEFAULT 36,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_classes_homeroom` (`homeroom_teacher_id`),
  KEY `fk_classes_academic_year` (`academic_year_id`),
  CONSTRAINT `fk_classes_homeroom` FOREIGN KEY (`homeroom_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_classes_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. TABEL: subjects
-- --------------------------------------------------------
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Wajib',
  `hours_per_week` INT NOT NULL DEFAULT 2,
  `grade_level` VARCHAR(50) DEFAULT 'Semua',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. TABEL: students
-- --------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` VARCHAR(36) NOT NULL,
  `profile_id` VARCHAR(36) DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT '123@Siswa',
  `nis` VARCHAR(50) NOT NULL,
  `nisn` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `gender` ENUM('L', 'P') NOT NULL,
  `birth_place` VARCHAR(100) DEFAULT NULL,
  `birth_date` DATE DEFAULT NULL,
  `religion` VARCHAR(50) DEFAULT 'Islam',
  `address` TEXT DEFAULT NULL,
  `father_name` VARCHAR(255) DEFAULT NULL,
  `mother_name` VARCHAR(255) DEFAULT NULL,
  `parent_phone` VARCHAR(50) DEFAULT NULL,
  `enrollment_year` VARCHAR(10) DEFAULT '2025',
  `class_id` VARCHAR(36) DEFAULT NULL,
  `status` ENUM('aktif', 'lulus', 'pindah', 'keluar') NOT NULL DEFAULT 'aktif',
  `photo_url` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_students_profile` (`profile_id`),
  KEY `fk_students_class` (`class_id`),
  KEY `idx_students_username` (`username`),
  CONSTRAINT `fk_students_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. TABEL: class_students
-- --------------------------------------------------------
DROP TABLE IF EXISTS `class_students`;
CREATE TABLE `class_students` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `academic_year_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_class_students_class` (`class_id`),
  KEY `fk_class_students_student` (`student_id`),
  KEY `fk_class_students_year` (`academic_year_id`),
  CONSTRAINT `fk_class_students_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_students_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_students_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. TABEL: schedules
-- --------------------------------------------------------
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `academic_year_id` VARCHAR(36) NOT NULL,
  `semester_id` VARCHAR(36) NOT NULL,
  `day` VARCHAR(20) NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `room` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_schedules_class` (`class_id`),
  KEY `fk_schedules_subject` (`subject_id`),
  KEY `fk_schedules_teacher` (`teacher_id`),
  KEY `fk_schedules_year` (`academic_year_id`),
  KEY `fk_schedules_semester` (`semester_id`),
  CONSTRAINT `fk_schedules_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. TABEL: student_attendance
-- --------------------------------------------------------
DROP TABLE IF EXISTS `student_attendance`;
CREATE TABLE `student_attendance` (
  `id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) DEFAULT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('hadir', 'sakit', 'izin', 'alpa', 'dispensasi') NOT NULL DEFAULT 'hadir',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_att_student` (`student_id`),
  KEY `fk_att_class` (`class_id`),
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 12. TABEL: teacher_attendance
-- --------------------------------------------------------
DROP TABLE IF EXISTS `teacher_attendance`;
CREATE TABLE `teacher_attendance` (
  `id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `check_in_time` VARCHAR(10) DEFAULT NULL,
  `check_out_time` VARCHAR(10) DEFAULT NULL,
  `status` ENUM('hadir', 'sakit', 'izin', 'alpa') NOT NULL DEFAULT 'hadir',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_teacher_att_teacher` (`teacher_id`),
  CONSTRAINT `fk_teacher_att_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 13. TABEL: grade_components
-- --------------------------------------------------------
DROP TABLE IF EXISTS `grade_components`;
CREATE TABLE `grade_components` (
  `id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `academic_year_id` VARCHAR(36) NOT NULL,
  `semester_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('formatif', 'sumatif', 'tugas', 'praktik', 'uts', 'uas') NOT NULL,
  `weight` DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_gc_subject` (`subject_id`),
  KEY `fk_gc_class` (`class_id`),
  CONSTRAINT `fk_gc_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gc_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 14. TABEL: grades
-- --------------------------------------------------------
DROP TABLE IF EXISTS `grades`;
CREATE TABLE `grades` (
  `id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `grade_component_id` VARCHAR(36) NOT NULL,
  `score` DECIMAL(5,2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_grades_student` (`student_id`),
  KEY `fk_grades_component` (`grade_component_id`),
  CONSTRAINT `fk_grades_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_component` FOREIGN KEY (`grade_component_id`) REFERENCES `grade_components` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 15. TABEL: assignments
-- --------------------------------------------------------
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `due_date` DATETIME NOT NULL,
  `attachment_url` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_assignments_class` (`class_id`),
  KEY `fk_assignments_subject` (`subject_id`),
  KEY `fk_assignments_teacher` (`teacher_id`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 16. TABEL: assignment_submissions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `assignment_submissions`;
CREATE TABLE `assignment_submissions` (
  `id` VARCHAR(36) NOT NULL,
  `assignment_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `submission_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_url` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `score` DECIMAL(5,2) DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_submissions_assignment` (`assignment_id`),
  KEY `fk_submissions_student` (`student_id`),
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 17. TABEL: learning_materials
-- --------------------------------------------------------
DROP TABLE IF EXISTS `learning_materials`;
CREATE TABLE `learning_materials` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `file_url` TEXT NOT NULL,
  `file_type` VARCHAR(50) DEFAULT 'PDF',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_materials_class` (`class_id`),
  KEY `fk_materials_subject` (`subject_id`),
  KEY `fk_materials_teacher` (`teacher_id`),
  CONSTRAINT `fk_materials_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_materials_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_materials_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 18. TABEL: exams
-- --------------------------------------------------------
DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('harian', 'sumatif', 'uts', 'uas') NOT NULL,
  `subject_id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `exam_date` DATE NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `room` VARCHAR(100) DEFAULT NULL,
  `proctor_teacher_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_exams_subject` (`subject_id`),
  KEY `fk_exams_class` (`class_id`),
  CONSTRAINT `fk_exams_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exams_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 19. TABEL: announcements
-- --------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `target_role` ENUM('all', 'guru', 'siswa') NOT NULL DEFAULT 'all',
  `attachment_url` TEXT DEFAULT NULL,
  `published_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 20. TABEL: academic_events
-- --------------------------------------------------------
DROP TABLE IF EXISTS `academic_events`;
CREATE TABLE `academic_events` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `event_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `event_type` VARCHAR(50) DEFAULT 'kegiatan',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 21. TABEL: inventory
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` VARCHAR(36) NOT NULL,
  `item_code` VARCHAR(50) NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `condition` ENUM('baik', 'rusak_ringan', 'rusak_berat') NOT NULL DEFAULT 'baik',
  `location` VARCHAR(100) DEFAULT NULL,
  `purchase_date` DATE DEFAULT NULL,
  `funding_source` VARCHAR(100) DEFAULT 'BOS',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inventory_code` (`item_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 22. TABEL: incoming_letters
-- --------------------------------------------------------
DROP TABLE IF EXISTS `incoming_letters`;
CREATE TABLE `incoming_letters` (
  `id` VARCHAR(36) NOT NULL,
  `letter_number` VARCHAR(100) NOT NULL,
  `letter_date` DATE NOT NULL,
  `received_date` DATE NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `sender` VARCHAR(255) NOT NULL,
  `recipient` VARCHAR(255) NOT NULL,
  `document_url` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 23. TABEL: outgoing_letters
-- --------------------------------------------------------
DROP TABLE IF EXISTS `outgoing_letters`;
CREATE TABLE `outgoing_letters` (
  `id` VARCHAR(36) NOT NULL,
  `letter_number` VARCHAR(100) NOT NULL,
  `letter_date` DATE NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `recipient` VARCHAR(255) NOT NULL,
  `signer` VARCHAR(255) NOT NULL,
  `document_url` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 24. TABEL: payment_types
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payment_types`;
CREATE TABLE `payment_types` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `period` ENUM('bulanan', 'semester', 'tahunan', 'sekali') NOT NULL DEFAULT 'bulanan',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 25. TABEL: student_bills
-- --------------------------------------------------------
DROP TABLE IF EXISTS `student_bills`;
CREATE TABLE `student_bills` (
  `id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `payment_type_id` VARCHAR(36) NOT NULL,
  `academic_year_id` VARCHAR(36) NOT NULL,
  `bill_month` VARCHAR(50) DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('lunas', 'belum_lunas', 'sebagian') NOT NULL DEFAULT 'belum_lunas',
  `due_date` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bills_student` (`student_id`),
  KEY `fk_bills_payment_type` (`payment_type_id`),
  CONSTRAINT `fk_bills_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bills_payment_type` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 26. TABEL: payment_transactions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` VARCHAR(36) NOT NULL,
  `bill_id` VARCHAR(36) NOT NULL,
  `transaction_code` VARCHAR(100) NOT NULL,
  `payment_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount_paid` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Tunai',
  `proof_url` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transactions_code` (`transaction_code`),
  KEY `fk_trans_bill` (`bill_id`),
  CONSTRAINT `fk_trans_bill` FOREIGN KEY (`bill_id`) REFERENCES `student_bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 27. TABEL: activity_logs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 28. TABEL: notifications
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'info',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==============================================================================
-- SEED DATA AWAL - SMA MEDANGGILI CIRUAS
-- ==============================================================================

-- 1. Profiles (Akun Master Admin Sekolah)
INSERT INTO `profiles` (`id`, `username`, `password`, `email`, `full_name`, `role`, `phone`, `is_active`) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin', '123@Admin', 'admin@sekolah.sch.id', 'Administrator Utama', 'admin', '081234567890', 1),
('a0000000-0000-0000-0000-000000000002', 'adminmedanggili', '123@Admin', 'admin@smamedanggili.sch.id', 'Admin SMA Medanggili Ciruas', 'admin', '081234567890', 1);

-- 2. Academic Years & Semesters
INSERT INTO `academic_years` (`id`, `name`, `start_date`, `end_date`, `is_active`, `is_archived`) VALUES
('11111111-1111-1111-1111-111111111111', '2025/2026', '2025-07-15', '2026-06-25', 1, 0);

INSERT INTO `semesters` (`id`, `academic_year_id`, `name`, `is_active`) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Ganjil', 1),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Genap', 0);

-- 3. School Settings
INSERT INTO `school_settings` (`id`, `school_name`, `npsn`, `nss`, `level`, `status`, `address`, `village`, `district`, `regency`, `province`, `postal_code`, `email`, `phone`, `website`, `headmaster_name`, `active_academic_year_id`, `active_semester_id`, `enable_payments`) VALUES
('33333333-3333-3333-3333-333333333333', 'SMA Medanggili Ciruas', '20605358', '3010203040', 'SMA', 'Swasta', 'Jl. Raya Jakarta - Serang Km. 9.5, Ciruas', 'Citerep', 'Ciruas', 'Kabupaten Serang', 'Banten', '42182', 'info@smamedanggili.sch.id', '(0254) 281234', 'https://smamedanggili.sch.id', 'Drs. H. Ahmad Sanusi, M.M.Pd.', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 1);

-- Seluruh tabel data lainnya (siswa, guru, rombel, mapel, jadwal, presensi, nilai, dll.)
-- Dibuat bersih (0 data) dan siap diinputkan data riil sekolah.

SET FOREIGN_KEY_CHECKS = 1;
