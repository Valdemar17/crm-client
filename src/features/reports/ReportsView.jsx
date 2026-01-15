import React from 'react';
import { FileBarChart, Download, Calendar } from 'lucide-react';

export default function ReportsView() {
  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Reportes y Analítica</h1>
           <p className="text-slate-500 mt-1">Generación de informes estratégicos.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#135bec] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#135bec]/90 transition-colors">
           <Download size={18} /> Exportar Todo
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center py-20">
         <FileBarChart className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={64} />
         <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Generador de Reportes</h2>
         <p className="text-slate-500 max-w-md mx-auto mt-2">
           Este módulo permitirá crear reportes personalizados de ventas, riesgo y cartera vencida.
         </p>
         <button className="mt-6 px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Configurar Reporte Automático
         </button>
      </div>
    </div>
  );
}
