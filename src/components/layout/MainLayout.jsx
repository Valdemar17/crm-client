import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon, Check, MessageSquare } from 'lucide-react';
import Sidebar from './Sidebar';

const NOTIFICATIONS = [
  { id: 1, title: 'Nuevo prospecto asignado', message: 'Se te ha asignado el prospecto "Empresa ABC"', time: 'Hace 5 min', type: 'info', read: false },
  { id: 2, title: 'Recordatorio de reunión', message: 'Comité de crédito en 30 minutos', time: 'Hace 30 min', type: 'warning', read: false },
  { id: 3, title: 'Documento aprobado', message: 'El dictamen jurídico #1234 ha sido aprobado', time: 'Hace 2 horas', type: 'success', read: true },
];

export default function MainLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  darkMode,
  toggleDarkMode 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] overflow-hidden font-sans text-slate-900 dark:text-slate-100 selection:bg-[#135bec] selection:text-white">
      
      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold capitalize hidden sm:block text-slate-700 dark:text-slate-200">
              {activeTab === 'pld' ? 'Prevención Lavado Dinero' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
             {/* Global Search (Hidden on small mobile) */}
             <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 border border-transparent focus-within:border-[#135bec] focus-within:ring-2 focus-within:ring-[#135bec]/20 transition-all">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar en CRM..." 
                  className="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
             </div>

            <div className="hidden lg:block text-sm font-medium text-slate-500 capitalize">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>

             <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-colors relative ${
                      showNotifications 
                        ? 'bg-indigo-50 text-[#135bec] dark:bg-slate-800' 
                        : 'text-slate-400 hover:text-[#135bec] hover:bg-indigo-50 dark:hover:bg-slate-800'
                    }`}
                  >
                     <Bell size={20} />
                     <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[100] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notificaciones</h3>
                        <span className="text-[10px] bg-[#135bec]/10 text-[#135bec] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          2 nuevas
                        </span>
                      </div>
                      
                      <div className="max-h-[320px] overflow-y-auto">
                        {NOTIFICATIONS.length > 0 ? (
                          NOTIFICATIONS.map(notif => (
                            <div 
                              key={notif.id} 
                              className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-[#135bec] shadow-[0_0_8px_rgba(19,91,236,0.5)]' : 'bg-slate-300'}`}></div>
                                <div>
                                  <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-400'} group-hover:text-[#135bec] transition-colors`}>
                                    {notif.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                    {notif.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400">
                             <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell size={20} className="opacity-50" />
                             </div>
                             <p className="text-sm">No tienes notificaciones</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800">
                        <button className="text-xs font-bold text-[#135bec] hover:text-[#135bec]/80 transition-colors flex items-center justify-center gap-1 w-full py-1">
                          <Check size={14} /> Marca todas como leídas
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={toggleDarkMode}
                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                   {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
             </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 relative">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </div>

      </main>
    </div>
  );
}
