import React, { useState } from 'react';
import { CreditCard, FileText, Gavel, FileCheck, Clock, CheckCircle } from 'lucide-react';
import DictamenJuridico from './DictamenJuridico';
import ComiteView from './ComiteView';

export default function CreditoView() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, dictamen, comite

  if (currentView === 'dictamen') {
      return <DictamenJuridico onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'comite') {
      return <ComiteView onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Módulo de Crédito</h1>
        <p className="text-slate-500 mt-1">Gestión del ciclo de vida de créditos y dictaminación.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Clock size={24}/></div>
             <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Solicitudes</h3>
           </div>
           <p className="text-3xl font-bold text-[#0d121b] dark:text-white">12</p>
           <p className="text-slate-500 text-sm mt-1">En proceso de análisis</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Gavel size={24}/></div>
             <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Dictamen</h3>
           </div>
           <p className="text-3xl font-bold text-[#0d121b] dark:text-white">4</p>
           <p className="text-indigo-500 text-sm mt-1">Pendientes de jurídico</p>
        </div>
        
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={24}/></div>
             <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Aprobados</h3>
           </div>
           <p className="text-3xl font-bold text-[#0d121b] dark:text-white">8</p>
           <p className="text-emerald-500 text-sm mt-1">Este mes</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><CreditCard size={24}/></div>
             <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Colocación</h3>
           </div>
           <p className="text-xl font-bold text-[#0d121b] dark:text-white">$4.2M</p>
           <p className="text-purple-500 text-sm mt-1">Total activo</p>
        </div>
      </div>

      {/* Main Actions Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Action Card: Dictamen Jurídico */}
          <div 
            onClick={() => setCurrentView('dictamen')}
            className="group cursor-pointer bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] text-white"
          >
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Gavel size={32} className="text-white" />
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">Accesos Rápidos</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Dictamen Jurídico</h3>
              <p className="text-indigo-100 text-sm mb-4">
                  Evaluar situación legal de prospectos, validar garantías y emitir dictámenes.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-200 group-hover:text-white transition-colors">
                  Ir al módulo <span className="text-lg">&rarr;</span>
              </div>
          </div>

           {/* Placeholder Action Card: Comité de Crédito */}
          <div 
             onClick={() => setCurrentView('comite')}
             className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors group cursor-pointer"
          >
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileCheck size={32} />
                  </div>
              </div>
              <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">Comité de Crédito</h3>
              <p className="text-slate-500 text-sm mb-4">
                  Revisión y aprobación final de solicitudes dictaminadas.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver agenda
              </div>
          </div>

           {/* Placeholder Action Card: Mesa de Control */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText size={32} />
                  </div>
              </div>
              <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">Mesa de Control</h3>
              <p className="text-slate-500 text-sm mb-4">
                  Validación documental y dispersión de recursos.
              </p>
               <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                   Gestionar
              </div>
          </div>
      </div>
      
      {/* Solicitudes Recientes (Table Placeholder) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-4 text-[#0d121b] dark:text-white">Solicitudes Recientes</h3>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th className="p-3 text-slate-600 dark:text-slate-400 font-medium">Folio</th>
                         <th className="p-3 text-slate-600 dark:text-slate-400 font-medium">Cliente</th>
                         <th className="p-3 text-slate-600 dark:text-slate-400 font-medium">Producto</th>
                         <th className="p-3 text-slate-600 dark:text-slate-400 font-medium">Monto</th>
                         <th className="p-3 text-slate-600 dark:text-slate-400 font-medium">Estatus</th>
                         <th className="p-3 text-slate-600 dark:text-slate-400 font-medium">Etapa</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="p-3 font-medium text-slate-700 dark:text-slate-300">#CR-2023-001</td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">Transportes del Norte S.A.</td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">Arrendamiento</td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">$1,500,000</td>
                         <td className="p-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">En Proceso</span></td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">Dictamen Jurídico</td>
                     </tr>
                     <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="p-3 font-medium text-slate-700 dark:text-slate-300">#CR-2023-002</td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">Juan Pérez Martínez</td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">Crédito Simple</td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">$350,000</td>
                         <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">Análisis</span></td>
                         <td className="p-3 text-slate-600 dark:text-slate-400">Recopilación de Documentos</td>
                     </tr>
                 </tbody>
             </table>
          </div>
      </div>
    </div>
  );
}
