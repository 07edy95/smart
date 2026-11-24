import React from 'react';
import { useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

export const App: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
};

export default App;
