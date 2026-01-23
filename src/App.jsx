import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import DashboardOverview from './features/dashboard/DashboardOverview';
import ClientsView from './features/clients/ClientsView';
import ProspectosView from './features/prospectos/ProspectosView';
import PLDView from './features/pld/PLDView';
import CotizadorView from './features/cotizador/CotizadorView';
import AccountingView from './features/accounting/AccountingView';
import ReportsView from './features/reports/ReportsView';
import CalendarView from './features/calendar/CalendarView';
import CreditoView from './features/credito/CreditoView';
import SettingsView from './features/settings/SettingsView';

function App() {
  // Global State
  const [session, setSession] = useState({ isLoggedIn: false, user: null });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Theme Toggler Effect (Optional hook-up)
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // View Router
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'clients':
        return <ClientsView />;
      case 'prospectos':
        return <ProspectosView />;
      case 'credito':
        return <CreditoView />;
      case 'pld':
        return <PLDView />;
      case 'cotizador':
        return <CotizadorView />;
      case 'accounting':
        return <AccountingView />;
      case 'reports':
        return <ReportsView />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  // Auth Guard
  if (!session.isLoggedIn) {
    return <Login onLogin={(user) => setSession({ isLoggedIn: true, user })} />;
  }

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {renderContent()}
    </MainLayout>
  );
}

export default App;
