import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import DesignSystem from './pages/DesignSystem';
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
import JuridicoView from './features/juridico/JuridicoView';
import DictamenForm from './features/juridico/components/DictamenForm';
import SettingsView from './features/settings/SettingsView';

function App() {
  // Check for standalone route (Manual Routing)
  const path = window.location.pathname;
  if (path === '/dictamen') {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const name = params.get('name');
    // Mock data fetching logic needed here or passing minimal props
    return <DictamenForm mode="page" applicationName={name || 'Solicitante'} applicationId={id} />;
  }

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
      case 'juridico':
        return <JuridicoView />;
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
      case 'design':
        return <DesignSystem />;
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
