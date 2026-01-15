import React from 'react';

export default function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
      ${active 
        ? 'bg-[#135bec] text-white shadow-md shadow-[#135bec]/30' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0d121b] dark:hover:text-white'}
    `}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
