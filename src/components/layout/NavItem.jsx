import React from 'react';

export default function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active
          ? 'bg-[#135bec] text-white shadow-lg shadow-[#135bec]/25 font-semibold'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
    `}>
      <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
