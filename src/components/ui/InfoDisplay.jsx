import React from 'react';

export function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-slate-400 mt-0.5">{icon}</div>}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-[#0d121b] dark:text-white font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  );
}

export function AddressField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[#0d121b] dark:text-white font-medium">{value}</p>
    </div>
  );
}
