import React, { useState } from 'react';
import { FileBarChart, Download, DollarSign, TrendingUp, Users, ShieldAlert, FileText, Briefcase } from 'lucide-react';
import SaldosReport from './components/SaldosReport';

const AVAILABLE_REPORTS = [
   {
      id: 'saldos',
      title: 'Reporte de Saldos',
      description: 'Desglose detallado de saldos brutos, netos, capital e intereses por estatus de cartera.',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600'
   },
   {
      id: 'colocacion',
      title: 'Reporte de Colocación',
      description: 'Análisis de créditos otorgados por periodo, promotor y tipo de producto.',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600'
   },
   {
      id: 'cobranza',
      title: 'Reporte de Cobranza',
      description: 'Proyecciones de recuperación, pagos recibidos y efectividad de cobranza.',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600'
   },
   {
      id: 'cartera',
      title: 'Análisis de Cartera',
      description: 'Estratificación de cartera por riesgo, antigüedad y sector económico.',
      icon: Briefcase,
      color: 'bg-orange-50 text-orange-600'
   },
   {
      id: 'pld',
      title: 'Monitor PLD/FT',
      description: 'Alertas de operaciones inusuales y relevantes, matrices de riesgo.',
      icon: ShieldAlert,
      color: 'bg-red-50 text-red-600'
   },
   {
      id: 'clientes',
      title: 'Reporte de Clientes',
      description: 'Altas, bajas y comportamiento transaccional de la base de clientes.',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600'
   }
];

export default function ReportsView() {
   const [currentView, setCurrentView] = useState('list'); // 'list' | 'saldos' | etc

   const handleReportClick = (reportId) => {
      if (reportId === 'saldos') {
         setCurrentView('saldos');
      } else {
         // Placeholder for other reports
         console.log(`Reporte ${reportId} seleccionado`);
      }
   };

   if (currentView === 'saldos') {
      return <SaldosReport onBack={() => setCurrentView('list')} />;
   }

   return (
      <div className="space-y-6 animate-fade-in pb-10">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Reportes y Analítica</h1>
               <p className="text-slate-500 mt-1">Generación de informes estratégicos y control operativo.</p>
            </div>
            <button className="flex items-center gap-2 bg-[#135bec] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#135bec]/90 transition-colors">
               <Download size={18} /> Catálogo de Reportes
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_REPORTS.map((report) => (
               <div
                  key={report.id}
                  onClick={() => handleReportClick(report.id)}
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
               >
                  <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                     <report.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                     {report.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                     {report.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                     <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        VER REPORTE &rarr;
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
