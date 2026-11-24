import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Plus, FileSpreadsheet, Printer, Save, CheckCircle2, Settings } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GradeComponent, Grade } from '../../types/database';
import { exportToPdf, exportToExcel } from '../../utils/helpers';

export const GradeModule: React.FC = () => {
  const { 
    classes, subjects, students, gradeComponents, 
    addGradeComponent, grades, recordGrade, bulkRecordGrades, 
    role, teacherProfile, studentProfile, schedules, currentUser, showToast,
    teacherSubjects, teacherClasses 
  } = useApp();

  const isSiswa = role === 'siswa';
  const isAdmin = role === 'admin';
  const isGuru = role === 'guru';

  // Guru-filtered classes & subjects (Hanya mapel & kelas yang diampu)
  const accessibleClasses = isGuru ? teacherClasses : classes;
  const accessibleSubjects = isGuru ? teacherSubjects : subjects;

  const [selectedClassId, setSelectedClassId] = useState<string>(accessibleClasses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(accessibleSubjects[0]?.id || '');
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  // Sync selectedClassId & selectedSubjectId
  React.useEffect(() => {
    if (accessibleClasses.length > 0 && !accessibleClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(accessibleClasses[0].id);
    }
  }, [accessibleClasses, selectedClassId]);

  React.useEffect(() => {
    if (accessibleSubjects.length > 0 && !accessibleSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(accessibleSubjects[0].id);
    }
  }, [accessibleSubjects, selectedSubjectId]);

  // Component Form State
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState<'formatif' | 'sumatif' | 'tugas' | 'praktik' | 'pts' | 'pas'>('tugas');
  const [compWeight, setCompWeight] = useState(20);

  // Selected class & subject
  const currentClass = accessibleClasses.find(c => c.id === selectedClassId) || classes.find(c => c.id === selectedClassId);
  const currentSubject = accessibleSubjects.find(s => s.id === selectedSubjectId) || subjects.find(s => s.id === selectedSubjectId);
  const classStudents = students.filter(s => s.class_id === selectedClassId);

  // Components for this subject and class
  const activeComponents = gradeComponents.filter(
    c => c.subject_id === selectedSubjectId && (c.class_id === selectedClassId || !c.class_id)
  );

  // Map scores: [studentId][componentId] => score
  const [scoreMap, setScoreMap] = useState<Record<string, Record<string, number>>>({});

  React.useEffect(() => {
    const initial: Record<string, Record<string, number>> = {};
    classStudents.forEach(std => {
      initial[std.id] = {};
      activeComponents.forEach(comp => {
        const found = grades.find(
          g => g.student_id === std.id && g.subject_id === selectedSubjectId && g.component_id === comp.id
        );
        initial[std.id][comp.id] = found ? found.score : 80;
      });
    });
    setScoreMap(initial);
  }, [selectedClassId, selectedSubjectId, gradeComponents, grades]);

  const handleScoreChange = (studentId: string, compId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value || 0));
    setScoreMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [compId]: clamped,
      }
    }));
  };

  const handleSaveAllGrades = () => {
    const listToSave: Omit<Grade, 'id'>[] = [];
    classStudents.forEach(std => {
      activeComponents.forEach(comp => {
        const val = scoreMap[std.id]?.[comp.id] ?? 80;
        listToSave.push({
          student_id: std.id,
          student_name: std.full_name,
          subject_id: selectedSubjectId,
          subject_name: currentSubject?.name,
          class_id: selectedClassId,
          class_name: currentClass?.name,
          component_id: comp.id,
          component_name: comp.name,
          score: val,
        });
      });
    });

    bulkRecordGrades(listToSave);
  };

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    addGradeComponent({
      name: compName,
      type: compType,
      weight: compWeight,
      subject_id: selectedSubjectId,
      class_id: selectedClassId,
      semester_id: 'sem-01',
    });
    setIsComponentModalOpen(false);
    setCompName('');
  };

  // JIKA ROLE SISWA: TAMPILKAN KHUSUS RAPOR NILAI PRIBADI
  if (isSiswa) {
    const myGrades = grades.filter(
      g => (studentProfile && g.student_id === studentProfile.id) || g.student_name === currentUser?.full_name
    );

    const subjectGrades = subjects.map(sbj => {
      const gList = myGrades.filter(g => g.subject_id === sbj.id);
      const avgScore = gList.length > 0 
        ? Math.round(gList.reduce((acc, curr) => acc + curr.score, 0) / gList.length)
        : null;
      let predikat = '-';
      let status = 'Belum Ada Nilai';
      if (avgScore !== null) {
        if (avgScore >= 85) { predikat = 'A'; status = 'Tuntas'; }
        else if (avgScore >= 75) { predikat = 'B'; status = 'Tuntas'; }
        else { predikat = 'C'; status = 'Belum Tuntas'; }
      }
      return {
        subject: sbj,
        components: gList,
        avgScore,
        predikat,
        status,
      };
    });

    return (
      <div className="space-y-6">
        <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              Laporan Rapor & Hasil Belajar Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Transkrip capaian kompetensi akademik untuk {studentProfile?.full_name || currentUser?.full_name}
            </p>
          </div>

          <button
            onClick={() => {
              const headers = ['No', 'Mata Pelajaran', 'KKM', 'Nilai Akhir', 'Predikat', 'Keterangan'];
              const rows = subjectGrades.map((sg, idx) => [
                idx + 1,
                sg.subject.name,
                75,
                sg.avgScore ?? '-',
                sg.predikat,
                sg.status
              ]);
              exportToPdf(`Rapor Nilai - ${studentProfile?.full_name || currentUser?.full_name}`, headers, rows, 'rapor_nilai_siswa');
            }}
            className="clay-btn-secondary text-xs py-2 px-3.5"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>Cetak Rapor Siswa PDF</span>
          </button>
        </div>

        {/* Tabel Nilai Siswa */}
        <div className="clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Daftar Nilai Semester Aktif
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/40 dark:text-blue-300">
              Standar Kelulusan KKM: 75
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5">Mata Pelajaran</th>
                  <th className="p-3.5 text-center">KKM</th>
                  <th className="p-3.5 text-center">Nilai Rata-rata</th>
                  <th className="p-3.5 text-center">Predikat</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjectGrades.length > 0 ? (
                  subjectGrades.map((sg, idx) => (
                    <tr key={sg.subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{sg.subject.name}</td>
                      <td className="p-3.5 text-center font-semibold">75</td>
                      <td className="p-3.5 text-center font-extrabold text-blue-600 dark:text-blue-400">
                        {sg.avgScore ?? '-'}
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        {sg.predikat}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sg.status === 'Tuntas' ? 'bg-emerald-100 text-emerald-700' :
                          sg.status === 'Belum Tuntas' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {sg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada nilai yang diinput oleh guru untuk akun Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Export Leger Nilai PDF
  const handleExportLegerPdf = () => {
    const headers = ['No', 'Nama Siswa', 'NIS', ...activeComponents.map(c => `${c.name} (${c.weight}%)`), 'Nilai Akhir', 'Predikat'];
    const rows = classStudents.map((std, idx) => {
      let weightedSum = 0;
      let totalWeight = 0;
      const scores = activeComponents.map(c => {
        const score = scoreMap[std.id]?.[c.id] ?? 0;
        weightedSum += score * (c.weight / 100);
        totalWeight += c.weight;
        return score;
      });

      const finalScore = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;
      let predikat = 'A';
      if (finalScore < 75) predikat = 'C';
      else if (finalScore < 85) predikat = 'B';

      return [idx + 1, std.full_name, std.nis, ...scores, finalScore, predikat];
    });

    exportToPdf(
      `Leger Nilai ${currentSubject?.name || ''} - ${currentClass?.name || ''}`,
      headers,
      rows,
      `leger_nilai_${currentClass?.name || ''}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="clay-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              Pengolahan Nilai Akademik & Leger Nilai
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Perhitungan nilai otomatis berdasarkan bobot formatif, sumatif, PTS, dan PAS
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isSiswa && (
              <>
                <button
                  onClick={() => setIsComponentModalOpen(true)}
                  className="clay-btn-secondary text-xs py-2 px-3.5"
                >
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>Komponen & Bobot</span>
                </button>
                <button
                  onClick={handleSaveAllGrades}
                  className="clay-btn-primary text-xs py-2 px-4"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Nilai</span>
                </button>
              </>
            )}
            <button
              onClick={handleExportLegerPdf}
              className="clay-btn-secondary text-xs py-2 px-3.5"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <span>Cetak Leger PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              {accessibleClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Mata Pelajaran {isGuru && <span className="text-[10px] text-emerald-600 font-normal">(Diampu)</span>}
            </label>
            {accessibleSubjects.length > 0 ? (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                {accessibleSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-300">
                Belum ada mata pelajaran yang diampu.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leger Nilai Matrix Table */}
      {accessibleSubjects.length === 0 ? (
        <div className="clay-card p-8 text-center text-slate-400 text-sm">
          Belum ada mata pelajaran yang diampu oleh akun Anda. Hubungi Administrator untuk menetapkan pengampu mata pelajaran.
        </div>
      ) : (
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Leger Nilai: {currentSubject?.name} — {currentClass?.name}
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold">
            KKM: 75
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">NIS</th>
                {activeComponents.map((comp) => (
                  <th key={comp.id} className="p-3.5 text-center min-w-[110px]">
                    <div>
                      <span>{comp.name}</span>
                      <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-semibold lowercase">
                        bobot {comp.weight}%
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-3.5 text-center font-bold text-blue-600">Nilai Akhir</th>
                <th className="p-3.5 text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.map((std, idx) => {
                let weightedSum = 0;
                let totalWeight = 0;

                activeComponents.forEach((comp) => {
                  const val = scoreMap[std.id]?.[comp.id] ?? 80;
                  weightedSum += val * (comp.weight / 100);
                  totalWeight += comp.weight;
                });

                const finalScore = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;
                let predikat = 'A';
                let predikatColor = 'bg-emerald-100 text-emerald-700';
                if (finalScore < 75) {
                  predikat = 'C (Belum Tuntas)';
                  predikatColor = 'bg-rose-100 text-rose-700';
                } else if (finalScore < 85) {
                  predikat = 'B';
                  predikatColor = 'bg-blue-100 text-blue-700';
                }

                return (
                  <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 text-center text-xs text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{std.full_name}</td>
                    <td className="p-3.5 text-xs text-slate-500">{std.nis}</td>

                    {/* Component Score Inputs */}
                    {activeComponents.map((comp) => {
                      const scoreVal = scoreMap[std.id]?.[comp.id] ?? 80;
                      return (
                        <td key={comp.id} className="p-3.5 text-center">
                          {isSiswa ? (
                            <span className="font-bold">{scoreVal}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={scoreVal}
                              onChange={(e) => handleScoreChange(std.id, comp.id, Number(e.target.value))}
                              className="w-16 px-2 py-1.5 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                            />
                          )}
                        </td>
                      );
                    })}

                    <td className="p-3.5 text-center font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {finalScore}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${predikatColor}`}>
                        {predikat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Component & Weight Config Modal */}
      <Modal
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
        title="Pengaturan Bobot Penilaian"
        subtitle={`Konfigurasi komponen penilaian untuk ${currentSubject?.name}`}
      >
        <form onSubmit={handleCreateComponent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Komponen Penilaian *
            </label>
            <input
              type="text"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="Tugas 2 (Analisis Geometri)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Asesmen *
              </label>
              <select
                value={compType}
                onChange={(e) => setCompType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
              >
                <option value="tugas">Tugas Harian</option>
                <option value="formatif">Formatif</option>
                <option value="sumatif">Sumatif</option>
                <option value="praktik">Praktik / Portofolio</option>
                <option value="pts">Penilaian Tengah Semester (PTS)</option>
                <option value="pas">Penilaian Akhir Semester (PAS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bobot Nilai (%) *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={compWeight}
                onChange={(e) => setCompWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsComponentModalOpen(false)}
              className="clay-btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-primary text-xs py-2 px-5"
            >
              Tambah Komponen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
