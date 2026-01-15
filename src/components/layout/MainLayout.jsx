import React from 'react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MainLayout({ children, activeTab, onTabChange, isMobileMenuOpen, setIsMobileMenuOpen }) {
  
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
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

             <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <button className="p-2 text-slate-400 hover:text-[#135bec] hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                   <Bell size={20} />
                   <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                   <Sun size={20} className="hidden dark:block" />
                   <Moon size={20} className="block dark:hidden" />
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
