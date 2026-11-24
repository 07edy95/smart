import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';

// Modules
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { TeacherDashboard } from '../dashboard/TeacherDashboard';
import { StudentDashboard } from '../dashboard/StudentDashboard';

import { SchoolProfileModule } from '../modules/SchoolProfileModule';
import { AcademicYearModule } from '../modules/AcademicYearModule';
import { TeacherModule } from '../modules/TeacherModule';
import { StudentModule } from '../modules/StudentModule';
import { ClassModule } from '../modules/ClassModule';
import { SubjectModule } from '../modules/SubjectModule';
import { ScheduleModule } from '../modules/ScheduleModule';
import { AttendanceModule } from '../modules/AttendanceModule';
import { GradeModule } from '../modules/GradeModule';
import { AssignmentModule } from '../modules/AssignmentModule';
import { LearningMaterialModule } from '../modules/LearningMaterialModule';
import { ExamModule } from '../modules/ExamModule';
import { AnnouncementModule } from '../modules/AnnouncementModule';
import { InventoryModule } from '../modules/InventoryModule';
import { LetterModule } from '../modules/LetterModule';
import { PaymentModule } from '../modules/PaymentModule';
import { ReportsModule } from '../modules/ReportsModule';
import { SettingsModule } from '../modules/SettingsModule';
import { ProfileModule } from '../modules/ProfileModule';

export const DashboardLayout: React.FC = () => {
  const { role } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Render the appropriate module view
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (role === 'admin') return <AdminDashboard onNavigate={setCurrentTab} />;
        if (role === 'guru') return <TeacherDashboard onNavigate={setCurrentTab} />;
        return <StudentDashboard onNavigate={setCurrentTab} />;

      case 'school-profile':
        return <SchoolProfileModule />;

      case 'academic-year':
        return <AcademicYearModule />;

      case 'teachers':
        return <TeacherModule />;

      case 'students':
        return <StudentModule />;

      case 'classes':
      case 'teacher-classes':
      case 'my-class':
        return <ClassModule />;

      case 'subjects':
        return <SubjectModule />;

      case 'schedules':
        return <ScheduleModule />;

      case 'attendance':
      case 'my-attendance':
        return <AttendanceModule />;

      case 'grades':
      case 'my-grades':
        return <GradeModule />;

      case 'assignments':
        return <AssignmentModule />;

      case 'materials':
        return <LearningMaterialModule />;

      case 'exams':
        return <ExamModule />;

      case 'announcements':
        return <AnnouncementModule />;

      case 'inventory':
        return <InventoryModule />;

      case 'letters':
        return <LetterModule />;

      case 'payments':
      case 'my-bills':
        return <PaymentModule />;

      case 'reports':
        return <ReportsModule />;

      case 'settings':
        return <SettingsModule />;

      case 'my-profile':
        return <ProfileModule />;

      default:
        if (role === 'admin') return <AdminDashboard onNavigate={setCurrentTab} />;
        if (role === 'guru') return <TeacherDashboard onNavigate={setCurrentTab} />;
        return <StudentDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Topbar Header */}
        <Topbar
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenProfile={() => setCurrentTab('my-profile')}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {renderContent()}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};
