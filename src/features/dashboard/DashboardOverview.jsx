import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, FileText, ShieldAlert, 
  ArrowUpRight, ArrowDownRight, Calendar, Plus, CreditCard,
  Calculator, Database, PieChart, Settings, UserPlus
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';

const AVAILABLE_ACTIONS_MAP = {
    'new_request': { label: 'Nueva Solicitud', icon: <CreditCard size={20}/>, route: 'credito' },
    'simulate_credit': { label: 'Simular Crédito', icon: <Calculator size={20}/>, route: 'cotizador' },
    'check_buro': { label: 'Consulta Buró', icon: <Database size={20}/>, route: 'clients' },
    'view_agenda': { label: 'Ver Agenda', icon: <Calendar size={20}/>, route: 'calendar' },
    'new_prospect': { label: 'Nuevo Prospecto', icon: <UserPlus size={20}/>, route: 'prospectos' },
    'pld_report': { label: 'Reporte PLD', icon: <FileText size={20}/>, route: 'pld' },
    'accounting_balance': { label: 'Balance General', icon: <PieChart size={20}/>, route: 'accounting' },
    'app_settings': { label: 'Configuración', icon: <Settings size={20}/>, route: 'settings' }
};

export default function DashboardOverview({ onNavigate }) {
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardQuickActions');
    setQuickActions(saved ? JSON.parse(saved) : ['new_request', 'simulate_credit', 'check_buro', 'view_agenda']);
  }, []);

  const stats = [
    { 
      title: 'Cartera Vigente', 
      value: '$45,231,000', 
      trend: '+2.5%', 
      isPositive: true, 
      icon: <Briefcase size={24} />,
      action: () => onNavigate('credito')
    },
    { 
      title: 'Solicitudes en Trámite', 
      value: '12', 
      trend: '+4', 
      isPositive: true, 
      icon: <FileText size={24} />,
      action: () => onNavigate('credito')
    },
    { 
      title: 'Alertas PLD', 
      value: '0', 
      trend: 'Sin Riesgo', 
      isPositive: true, 
      icon: <ShieldAlert size={24} />,
      action: () => onNavigate('pld')
    },
    { 
      title: 'Clientes Activos', 
      value: '148', 
      trend: '+12.3%', 
      isPositive: true, 
      icon: <Users size={24} />,
      action: () => onNavigate('clients')
    },
  ];

  const recentRequests = [
    { client: 'GC Grupo Cimarrón S.A de C.V', amount: '$1,000,000', type: 'Quirografario', status: 'En Comité', date: '19 Ene 2026' },
    { client: 'Transportes del Norte', amount: '$3,500,000', type: 'Arrendamiento', status: 'Análisis', date: '18 Ene 2026' },
    { client: 'Juan Alberto Pérez', amount: '$500,000', type: 'Refaccionario', status: 'Documentación', date: '15 Ene 2026' },
    { client: 'Inmobiliaria Sol Poniente', amount: '$12,000,000', type: 'Garantía Hip.', status: 'Jurídico', date: '14 Ene 2026' },
  ];

  const upcomingEvents = [
    { title: 'Comité de Crédito Ord.', time: '12:00 PM', date: 'Hoy', type: 'committee' },
    { title: 'Firma de Contrato (Grupo Cimarrón)', time: '04:30 PM', date: 'Mañana', type: 'meeting' },
    { title: 'Revisión Auditores PLD', time: '09:00 AM', date: '22 Ene', type: 'audit' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Panel Principal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visión general operativa al 19 de enero de 2026.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            onClick={stat.action}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg text-[#135bec] group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Commercial Pipeline section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
            <Users size={20} className="text-[#135bec]" /> Pipeline Comercial
          </h3>
          <button onClick={() => onNavigate('prospectos')} className="text-sm font-medium text-[#135bec] hover:underline">Ver Prospectos</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {/* Stage 1: Prospectos Nuevos */}
             <div className="relative group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Prospectos</span>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">New</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white block">24</span>
                        <span className="text-xs text-slate-500">Sin contactar</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full w-3/4"></div>
                    </div>
                </div>
                {/* Arrow Connector */}
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 dark:bg-slate-800 border-t border-r border-slate-200 dark:border-slate-700 transform rotate-45 z-0"></div>
             </div>

             {/* Stage 2: En Calificación/Checklist */}
             <div className="relative group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">En Checklist</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white block">8</span>
                        <span className="text-xs text-slate-500">Documentación pendiente</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-indigo-400 h-full rounded-full w-1/2"></div>
                    </div>
                </div>
                 <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 dark:bg-slate-800 border-t border-r border-slate-200 dark:border-slate-700 transform rotate-45 z-0"></div>
             </div>

             {/* Stage 3: Conversión a Cliente */}
             <div className="relative group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Alta Cliente</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white block">5</span>
                        <span className="text-xs text-slate-500">En Mesa de Control</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full w-1/4"></div>
                    </div>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 dark:bg-slate-800 border-t border-r border-slate-200 dark:border-slate-700 transform rotate-45 z-0"></div>
             </div>
             
             {/* Stage 4: Cliente Activo */}
             <div className="relative group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/30 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Clientes Nuevos</span>
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">Mes</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white block">12</span>
                        <span className="text-xs text-slate-500">+3 vs mes anterior</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full w-full"></div>
                    </div>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Solicitudes Recientes */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Solicitudes de Crédito Recientes</h3>
            <button 
              onClick={() => onNavigate('credito')}
              className="text-sm text-[#135bec] font-semibold hover:underline"
            >
              Ver Pipeline Completo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold">Monto / Tipo</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-right">Etapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRequests.map((req, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                          {req.client.charAt(0)}
                        </div>
                        <span className="text-[#0d121b] dark:text-white">{req.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="font-medium text-[#0d121b] dark:text-white">{req.amount}</div>
                      <div className="text-xs">{req.type}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{req.date}</td>
                    <td className="px-6 py-4 text-right">
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full 
                        ${req.status === 'En Comité' ? 'bg-purple-100 text-purple-800' : 
                          req.status === 'Jurídico' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'Análisis' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                          {req.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
            
            {/* Accesos Rápidos */}
            <div className="bg-gradient-to-br from-[#135bec] to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20">
                <h3 className="font-bold mb-4 flex items-center"><CreditCard size={20} className="mr-2"/> Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.map(actionId => {
                        const action = AVAILABLE_ACTIONS_MAP[actionId];
                        if (!action) return null;
                        return (
                            <button 
                                key={actionId}
                                onClick={() => onNavigate(action.route)}
                                className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm text-center transition-colors flex flex-col items-center justify-center gap-2 h-24"
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        );
                    })}
                    {quickActions.length === 0 && (
                        <p className="col-span-2 text-center text-sm opacity-70">
                            No hay acciones configuradas. Ve a Configuración.
                        </p>
                    )}
                </div>
            </div>

            {/* Agenda */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Agenda Semanal</h3>
                    <Calendar size={18} className="text-slate-400"/>
                </div>
                <div className="space-y-4">
                    {upcomingEvents.map((event, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className="flex flex-col items-center min-w-[3rem]">
                                <span className="text-xs font-bold text-slate-500 uppercase">{event.date}</span>
                            </div>
                            <div className={`flex-1 p-3 rounded-lg border text-sm ${
                                event.type === 'committee' ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'
                            }`}>
                                <p className="font-bold text-slate-800">{event.title}</p>
                                <p className="text-slate-500 mt-1">{event.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <button 
                  onClick={() => onNavigate('calendar')}
                  className="w-full mt-4 text-blue-600 text-sm font-medium hover:underline text-center"
                 >
                    Ver Calendario Completo
                 </button>
            </div>

        </div>
      </div>
    </div>
  );
}
