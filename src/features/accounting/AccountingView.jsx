import React from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

export default function AccountingView() {
  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Contabilidad</h1>
        <p className="text-slate-500 mt-1">Gestión de ingresos, egresos y facturación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={24}/></div>
             <h3 className="font-bold text-lg">Ingresos Mensuales</h3>
           </div>
           <p className="text-3xl font-bold text-[#0d121b] dark:text-white">$124,500.00</p>
           <p className="text-emerald-500 text-sm font-medium mt-1">+12% vs mes anterior</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-red-100 text-red-600 rounded-lg"><TrendingUp size={24}/></div>
             <h3 className="font-bold text-lg">Gastos Operativos</h3>
           </div>
           <p className="text-3xl font-bold text-[#0d121b] dark:text-white">$42,300.00</p>
           <p className="text-red-500 text-sm font-medium mt-1">+5% vs mes anterior</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center border-dashed border-2">
           <div className="text-center">
              <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-slate-500 font-medium">Módulo en Desarrollo</p>
              <p className="text-slate-400 text-xs mt-1">Próximamente facturación automática</p>
           </div>
        </div>
      </div>
    </div>
  );
}
