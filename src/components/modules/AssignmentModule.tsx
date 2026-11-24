import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Assignment, AssignmentSubmission } from '../../types/database';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { uploadFile } from '../../lib/hostingerApi';
import { 
  BookMarked, Plus, Send, CheckCircle2, Clock, 
  Upload, FileText, Award, Eye, MessageSquare, Download, Trash2 
} from 'lucide-react';

export const AssignmentModule: React.FC = () => {
  const { 
    assignments, addAssignment, deleteAssignment, 
    submissions, submitAssignment, gradeSubmission, 
    classes, subjects, teachers, schedules, role, currentUser, 
    studentProfile, teacherProfile, showToast 
  } = useApp();

  const isSiswa = role === 'siswa';
  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  // Guru-filtered classes & subjects
  const teacherClassIds = schedules
    .filter(s => (teacherProfile && s.teacher_id === teacherProfile.id) || s.teacher_name === teacherProfile?.full_name)
    .map(s => s.class_id);
  
  const accessibleClasses = isGuru
    ? (classes.filter(c => teacherClassIds.includes(c.id) || (teacherProfile && c.homeroom_teacher_id === teacherProfile.id)).length > 0
        ? classes.filter(c => teacherClassIds.includes(c.id) || (teacherProfile && c.homeroom_teacher_id === teacherProfile.id))
        : classes)
    : classes;

  const accessibleSubjects = isGuru
    ? (subjects.filter(s => schedules.some(sch => sch.subject_id === s.id && ((teacherProfile && sch.teacher_id === teacherProfile.id) || sch.teacher_name === teacherProfile?.full_name))).length > 0
        ? subjects.filter(s => schedules.some(sch => sch.subject_id === s.id && ((teacherProfile && sch.teacher_id === teacherProfile.id) || sch.teacher_name === teacherProfile?.full_name)))
        : subjects)
    : subjects;

  // Filter assignments strictly per role: Guru A cannot see Guru B's assignments; Siswa only sees their class
  const filteredAssignments = isGuru
    ? assignments.filter(a => (teacherProfile && a.teacher_id === teacherProfile.id) || a.teacher_name === teacherProfile?.full_name)
    : isSiswa
    ? assignments.filter(a => (studentProfile?.class_id && a.class_id === studentProfile.class_id) || !a.class_id)
    : assignments;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmissionsListOpen, setIsSubmissionsListOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // New assignment form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState(accessibleClasses[0]?.id || classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(accessibleSubjects[0]?.id || subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync classId & subjectId
  React.useEffect(() => {
    if (accessibleClasses.length > 0 && !accessibleClasses.some(c => c.id === classId)) {
      setClassId(accessibleClasses[0].id);
    }
  }, [accessibleClasses, classId]);

  React.useEffect(() => {
    if (accessibleSubjects.length > 0 && !accessibleSubjects.some(s => s.id === subjectId)) {
      setSubjectId(accessibleSubjects[0].id);
    }
  }, [accessibleSubjects, subjectId]);

  // Student submission form state
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  // Teacher Grading form state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(85);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');

  const studentName = studentProfile?.full_name || currentUser?.full_name || '';

  // Handle Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let fileUrl = '';
    if (taskFile) {
      const res = await uploadFile('assignments', taskFile);
      if (res.url) fileUrl = res.url;
    }

    addAssignment({
      title,
      description,
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherProfile?.id || teachers[0]?.id || '',
      due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      file_url: fileUrl || undefined,
    });

    setIsUploading(false);
    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setTaskFile(null);
  };

  // Handle Student Submit
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsUploading(true);

    let fileUrl = '';
    if (submissionFile) {
      const res = await uploadFile('submissions', submissionFile);
      if (res.url) fileUrl = res.url;
    }

    submitAssignment({
      assignment_id: selectedAssignment.id,
      student_id: studentProfile?.id || 'std-current',
      submission_text: submissionText,
      file_url: fileUrl || undefined,
      submitted_at: new Date().toISOString(),
    });

    setIsUploading(false);
    setIsSubmitModalOpen(false);
    setSubmissionText('');
    setSubmissionFile(null);
  };

  // Handle Teacher Grade
  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmissionId) return;
    gradeSubmission(gradingSubmissionId, gradingScore, gradingFeedback);
    setGradingSubmissionId(null);
    setGradingFeedback('');
  };

  const columns: Column<Assignment>[] = [
    {
      header: 'Judul Tugas & Mata Pelajaran',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center flex-shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{a.title}</h4>
            <p className="text-[11px] text-slate-500">{a.subject_name} • {a.class_name}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Batas Pengumpulan (Deadline)',
      cell: (a) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{formatDate(a.due_date)}</span>
        </div>
      ),
    },
    {
      header: 'Guru Pengampu',
      cell: (a) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{a.teacher_name}</span>
      ),
    },
    {
      header: isSiswa ? 'Status Saya' : 'Pengumpulan',
      cell: (a) => {
        if (isSiswa) {
          const mySub = submissions.find(
            s => s.assignment_id === a.id && (s.student_name === studentName || s.student_id === studentProfile?.id)
          );

          if (mySub) {
            return (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {mySub.score !== undefined ? `Nilai: ${mySub.score}` : 'Terkumpul'}
              </span>
            );
          }

          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              Belum Mengumpulkan
            </span>
          );
        }

        const count = submissions.filter(s => s.assignment_id === a.id).length;
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {count} Siswa Mengumpulkan
          </span>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (a) => (
        <div className="flex items-center justify-center gap-1.5">
          {isSiswa ? (
            <button
              onClick={() => {
                setSelectedAssignment(a);
                setIsSubmitModalOpen(true);
              }}
              className="clay-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Kumpul</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedAssignment(a);
                  setIsSubmissionsListOpen(true);
                }}
                className="clay-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-blue-600"
                title="Periksa Pengumpulan Siswa"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Periksa</span>
              </button>
              {(isAdmin || isGuru) && (
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus tugas "${a.title}"?`)) {
                      deleteAssignment(a.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const currentSubmissions = selectedAssignment
    ? submissions.filter(s => s.assignment_id === selectedAssignment.id)
    : [];

  return (
    <div className="space-y-6">
      <DataTable
        title="Tugas & Penugasan Pembelajaran"
        subtitle="Manajemen tugas online, batas pengumpulan, berkas materi, dan penilaian submission"
        data={filteredAssignments}
        columns={columns}
        searchPlaceholder="Cari judul tugas, mata pelajaran..."
        searchKeys={['title', 'subject_name', 'class_name', 'teacher_name']}
        onAddClick={!isSiswa ? () => setIsCreateModalOpen(true) : undefined}
        addButtonLabel="Buat Tugas Baru"
      />

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Tugas Pembelajaran Baru"
        subtitle="Terbitkan instruksi tugas untuk rombel yang diampu"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Tugas *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Analisis Gelombang Elektromagnetik Bab 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Rombel / Kelas *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {accessibleClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              >
                {accessibleSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Batas Pengumpulan (Deadline) *
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instruksi / Rincian Soal
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan langkah pengerjaan tugas secara rinci..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lampiran Lembar Kerja (Opsional - PDF/DOCX)
            </label>
            <input
              type="file"
              onChange={(e) => setTaskFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="clay-btn-primary text-xs py-2 px-5"
            >
              {isUploading ? 'Mengunggah...' : 'Terbitkan Tugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Submit Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title={`Pengumpulan Tugas: ${selectedAssignment.title}`}
          subtitle={`Mata Pelajaran: ${selectedAssignment.subject_name} • Batas: ${formatDate(selectedAssignment.due_date)}`}
        >
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold block mb-1">Instruksi Guru:</span>
              <p>{selectedAssignment.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Jawaban Teks
              </label>
              <textarea
                rows={3}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Tuliskan keterangan jawaban tugas Anda di sini..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unggah Berkas Tugas (PDF, DOCX, Gambar)
              </label>
              <input
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="clay-btn-secondary text-xs py-2 px-4"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="clay-btn-primary text-xs py-2 px-5"
              >
                {isUploading ? 'Mengunggah ke Server...' : 'Kirimkan Tugas'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submissions Review Modal for Teachers */}
      {selectedAssignment && (
        <Modal
          isOpen={isSubmissionsListOpen}
          onClose={() => setIsSubmissionsListOpen(false)}
          title={`Pemeriksaan Tugas: ${selectedAssignment.title}`}
          subtitle={`Total: ${currentSubmissions.length} siswa telah mengumpulkan`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-80">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Waktu Kirim</th>
                    <th className="p-3">Catatan / Berkas</th>
                    <th className="p-3 text-center">Nilai</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{sub.student_name}</td>
                      <td className="p-3 text-slate-500">{formatDateTime(sub.submitted_at)}</td>
                      <td className="p-3">
                        <p className="line-clamp-1">{sub.submission_text || '-'}</p>
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline mt-0.5"
                          >
                            <Download className="w-3 h-3" /> Unduh Berkas
                          </a>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {sub.score !== undefined ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            {sub.score}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-semibold">Belum</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setGradingSubmissionId(sub.id);
                            setGradingScore(sub.score || 85);
                            setGradingFeedback(sub.feedback || '');
                          }}
                          className="clay-btn-secondary text-[11px] py-1 px-2.5"
                        >
                          Beri Nilai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* In-modal Grading form when a student is picked */}
            {gradingSubmissionId && (
              <form onSubmit={handleGrade} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Formulir Penilaian Hasil Kerja Siswa
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Skor Nilai (0 - 100) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradingScore}
                      onChange={(e) => setGradingScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Umpan Balik / Catatan Guru
                    </label>
                    <input
                      type="text"
                      value={gradingFeedback}
                      onChange={(e) => setGradingFeedback(e.target.value)}
                      placeholder="Kerja bagus, perbaiki langkah nomor 3..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setGradingSubmissionId(null)}
                    className="px-3 py-1 text-xs rounded-lg border text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="clay-btn-primary text-xs py-1 px-4"
                  >
                    Simpan Nilai
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
