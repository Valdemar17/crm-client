import React from 'react';
import { LayoutDashboard, Users, ShieldAlert, FileText, Settings, LogOut, Menu, Calculator, FileBarChart } from 'lucide-react';
import NavItem from './NavItem';
import logo from '../../assets/sofimas-logo.png';

export default function Sidebar({ activeTab, onTabChange, isMobileMenuOpen, toggleMobileMenu }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'pld', label: 'Módulo PLD', icon: ShieldAlert },
    { id: 'cotizador', label: 'Cotizador', icon: FileText },
    { id: 'accounting', label: 'Contabilidad', icon: Calculator },
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-[#0d121b] text-white transition-transform duration-300 ease-in-out shadow-2xl
        lg:translate-x-0 lg:static lg:shadow-none justify-between flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-8">
            <img src={logo} alt="Sofimas Logo" className="w-4/5 h-auto object-contain" />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavItem
                key={item.id}
                icon={<item.icon size={20} />}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  onTabChange(item.id);
                  toggleMobileMenu(); 
                }}
              />
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-slate-800">
          <div className="mb-4 px-4 py-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#135bec] to-purple-500 flex items-center justify-center text-xs font-bold">
                VM
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Valdemar M.</p>
                <p className="text-xs text-slate-400 truncate">Admin</p>
              </div>
            </div>
          </div>
          
          <button className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
             <Settings size={20} />
             <span>Configuración</span>
          </button>
          
          <button className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg mt-1 transition-colors">
             <LogOut size={20} />
             <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
