import React, { useState } from 'react';
import { 
  LayoutDashboard, Activity, Search, List, User, Building2, Scale, 
  FileCog, CheckSquare, Grid, ShieldAlert, Bell, Users, Sparkles, Loader2,
  FileText, Download, Eye, Plus
} from 'lucide-react';
import { generateGeminiContent } from '../../services/api';

export default function PLDView() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [alerts, setAlerts] = useState([
    { id: 1, client: 'Tech Solutions S.A.', type: 'Monto Inusual', level: 'Alto', date: '2024-05-15', status: 'Pendiente' },
    { id: 2, client: 'Juan Pérez', type: 'Pep', level: 'Medio', date: '2024-05-14', status: 'Revisado' },
    { id: 3, client: 'Constructora Norte', type: 'Lista Negra', level: 'Crítico', date: '2024-05-10', status: 'Pendiente' },
  ]);

  const [aiReport, setAiReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generatePLDReport = async () => {
    setIsGeneratingReport(true);
    const prompt = `Actúa como un Oficial de Cumplimiento de PLD (Prevención de Lavado de Dinero).
    Genera un breve reporte ejecutivo sobre el estado actual de las alertas de riesgo.
    
    Datos:
    - Total Alertas: ${alerts.length}
    - Alertas Pendientes: ${alerts.filter(a => a.status === 'Pendiente').length}
    - Alertas Críticas: ${alerts.filter(a => a.level === 'Crítico').length}
    
    El reporte debe incluir:
    1. Resumen de situación.
    2. Recomendaciones de acción inmediata.
    3. Tono formal y directivo.`;

    const result = await generateGeminiContent(prompt);
    setAiReport(result);
    setIsGeneratingReport(false);
  };

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: <LayoutDashboard size={18} /> },
    { id: 'comportamiento', label: 'Análisis de Comportamiento', icon: <Activity size={18} /> },
    { id: 'buscador', label: 'Buscador PLD/FT', icon: <Search size={18} /> },
    { id: 'listas', label: 'Listas PLD/FT', icon: <List size={18} /> },
    { id: 'riesgo_acreditado', label: 'Riesgo Acreditado', icon: <User size={18} /> },
    { id: 'riesgo_entidad', label: 'Riesgo Entidad', icon: <Building2 size={18} /> },
    { id: 'riesgo_ebr', label: 'Riesgo EBR', icon: <Scale size={18} /> },
    { id: 'procesos', label: 'Generar Procesos', icon: <FileCog size={18} /> },
    { id: 'pagos', label: 'Aprobación Pagos', icon: <CheckSquare size={18} /> },
    { id: 'matriz', label: 'Matriz de Riesgos', icon: <Grid size={18} /> },
    { id: 'actas', label: 'Actas Oficial', icon: <FileText size={18} /> },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'inicio':
        return (
          <>
            {/* Risk Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nivel de Riesgo Global</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">Medio-Alto</h3>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                    <ShieldAlert size={24} />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[65%]"></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Alertas Pendientes</p>
                    <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">
                      {alerts.filter(a => a.status === 'Pendiente').length}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                    <Bell size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Clientes Monitoreados</p>
                    <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">142</h3>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <Users size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Report Section */}
            {aiReport && (
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-6 animate-[fadeIn_0.5s_ease-out]">
                <h3 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 mb-4">
                  <Sparkles size={18} /> Reporte Ejecutivo Generado por IA
                </h3>
                <div className="prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300 ai-response whitespace-pre-wrap">
                  {aiReport}
                </div>
              </div>
            )}

            {/* Alerts Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-[#0d121b] dark:text-white">Alertas Recientes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Cliente</th>
                      <th className="px-6 py-4 font-semibold">Tipo de Alerta</th>
                      <th className="px-6 py-4 font-semibold">Nivel</th>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#0d121b] dark:text-white">{alert.client}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{alert.type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.level === 'Crítico' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            alert.level === 'Alto' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {alert.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{alert.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.status === 'Pendiente' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-500 hover:underline font-medium text-xs">Revisar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'comportamiento':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <Activity size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Análisis de Comportamiento Transaccional</h3>
            <p className="text-slate-500 mt-2">Detección de patrones inusuales en operaciones de clientes.</p>
          </div>
        );
      case 'buscador':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">Buscador en Listas Restringidas</h3>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nombre, RFC o Razón Social..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                />
              </div>
              <button className="bg-[#135bec] text-white px-6 py-2 rounded-lg font-medium">Buscar</button>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500">Ingrese un nombre para buscar en listas OFAC, ONU, SAT y PEPs.</p>
            </div>
          </div>
        );
      case 'listas':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <List size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Gestión de Listas PLD/FT</h3>
            <p className="text-slate-500 mt-2">Carga y actualización de listas oficiales (ONU, OFAC, SAT 69-B).</p>
          </div>
        );
      case 'riesgo_acreditado':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <User size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Clasificación de Riesgo del Acreditado</h3>
            <p className="text-slate-500 mt-2">Evaluación individual de riesgo (Bajo, Medio, Alto) por cliente.</p>
          </div>
        );
      case 'riesgo_entidad':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Clasificación de Riesgo de la Entidad Financiera</h3>
            <p className="text-slate-500 mt-2">Autoevaluación de riesgos institucionales.</p>
          </div>
        );
      case 'riesgo_ebr':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <Scale size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Clasificación de Riesgo EBR</h3>
            <p className="text-slate-500 mt-2">Enfoque Basado en Riesgo: Metodología y configuración de factores.</p>
          </div>
        );
      case 'procesos':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <FileCog size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Generar Procesos</h3>
            <p className="text-slate-500 mt-2">Documentación de procesos internos de cumplimiento.</p>
          </div>
        );
      case 'pagos':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <CheckSquare size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Aprobación de Pagos</h3>
            <p className="text-slate-500 mt-2">Mesa de control para liberación de operaciones.</p>
          </div>
        );
      case 'matriz':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <Grid size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Matriz de Riesgos</h3>
            <p className="text-slate-500 mt-2">Mapa de calor y distribución de riesgos de la cartera.</p>
          </div>
        );
      case 'actas':
        return (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Actas de Oficial de Cumplimiento</h3>
               <button className="flex items-center gap-2 bg-[#135bec] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm active:scale-95">
                  <Plus size={16} /> Nueva Acta
               </button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                          <th className="px-6 py-4">ID Acta</th>
                          <th className="px-6 py-4">Fecha</th>
                          <th className="px-6 py-4">Tipo de Sesión</th>
                          <th className="px-6 py-4">Resumen / Temas</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { id: 'ACT-PLD-2024-001', date: '2024-01-15', type: 'Ordinaria Mensual', topics: 'Revisión de alertas enero, actualización manual', status: 'Finalizada' },
                        { id: 'ACT-PLD-2024-002', date: '2024-02-14', type: 'Ordinaria Mensual', topics: 'Capacitación anual personal nuevo ingreso', status: 'Finalizada' },
                        { id: 'ACT-PLD-2024-003', date: '2024-03-10', type: 'Extraordinaria', topics: 'Incidencia reporte inusual cliente X', status: 'En Revision' },
                        { id: 'ACT-PLD-2024-004', date: '2024-04-12', type: 'Ordinaria Mensual', topics: 'Presentación de resultados trimestrales 1Q', status: 'Finalizada' },
                      ].map(acta => (
                          <tr key={acta.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{acta.id}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{acta.date}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{acta.type}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{acta.topics}</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      acta.status === 'Finalizada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  }`}>
                                      {acta.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      <button title="Ver Detalle" className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                          <Eye size={18} />
                                      </button>
                                      <button title="Descargar PDF" className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                          <Download size={18} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-center text-xs text-slate-500">
                 Mostrando 4 de 12 registros históricos
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-[#135bec]" /> Prevención de Lavado de Dinero (PLD)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoreo y gestión de riesgos financieros.</p>
        </div>
        <button 
          onClick={generatePLDReport}
          disabled={isGeneratingReport}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isGeneratingReport ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          Generar Reporte IA
        </button>
      </div>

      {/* Internal Navigation Tabs with Horizontal Scroll */}
      <div className="w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-[#135bec] text-white' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Active Content */}
      {renderContent()}
    </div>
  );
}
