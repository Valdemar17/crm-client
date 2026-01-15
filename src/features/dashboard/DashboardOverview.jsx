import React from 'react';
import { 
  Briefcase, Users, PieChart, LayoutDashboard, ArrowUpRight, ArrowDownRight, MoreHorizontal 
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DashboardOverview() {
  const stats = [
    { title: 'Ingresos Totales', value: '$54,239', trend: '+12.5%', isPositive: true, icon: <Briefcase size={24} /> },
    { title: 'Nuevos Usuarios', value: '2,543', trend: '+8.2%', isPositive: true, icon: <Users size={24} /> },
    { title: 'Tasa de Rebote', value: '42.3%', trend: '-2.1%', isPositive: true, icon: <PieChart size={24} /> },
    { title: 'Sesiones Activas', value: '432', trend: '-5.4%', isPositive: false, icon: <LayoutDashboard size={24} /> },
  ];

  const recentLeads = [
    { name: 'Alice Freeman', company: 'TechFlow Inc.', status: 'Calificado', date: 'Justo ahora', email: 'alice@techflow.com' },
    { name: 'Robert Smith', company: 'Global Solutions', status: 'Nuevo', date: 'Hace 2 min', email: 'r.smith@global.com' },
    { name: 'Michael Brown', company: 'Creative Studio', status: 'Negociación', date: 'Hace 1 hora', email: 'mike@studio.io' },
    { name: 'Sarah Wilson', company: 'Marketing Pro', status: 'Calificado', date: 'Hace 3 horas', email: 'sarah@mpro.net' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Resumen del Panel</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenido de nuevo, esto es lo que está pasando hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/30 transition-all duration-300 group">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg">Prospectos Recientes</h3>
            <button className="text-sm text-[#135bec] font-semibold hover:underline">Ver Todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Empresa</th>
                  <th className="px-6 py-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentLeads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[#0d121b] dark:text-white">{lead.name}</div>
                          <div className="text-slate-400 text-xs">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{lead.company}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#135bec]">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Fuente de Tráfico</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Directo</span>
                <span className="text-slate-500">54%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#135bec] w-[54%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Redes Sociales</span>
                <span className="text-slate-500">28%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[28%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Referidos</span>
                <span className="text-slate-500">18%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 w-[18%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
