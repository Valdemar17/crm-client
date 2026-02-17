import { useState } from 'react';
import { Search, Filter, FileText, Scale, Plus } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import DictamenForm from './components/DictamenForm';

// Mock Data (Simula la DB)
const INITIAL_APPLICATIONS = [
    { _id: '1', solicitante: { nombre: 'Empresa Constructora SA', rfc: 'ECO123456789' }, estatus: 'Analisis', dictamenJuridico: { conlusion: 'Pendiente' }, fechaCreacion: '2023-10-15' },
    { _id: '2', solicitante: { nombre: 'Juan Perez', rfc: 'PELJ800101XYZ' }, estatus: 'Analisis', dictamenJuridico: { conlusion: 'Favorable' }, fechaCreacion: '2023-10-18' },
];

const JuridicoView = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const filteredApps = INITIAL_APPLICATIONS.filter(app =>
        app.solicitante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.solicitante.rfc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDictamen = (app) => {
        // Abrir en nueva pestaña
        window.open(`/dictamen?id=${app._id}&name=${encodeURIComponent(app.solicitante.nombre)}`, '_blank');
    };

    const handleNewDictamen = () => {
        // Abrir en nueva pestaña con ID 'new' y nombre por defecto
        window.open('/dictamen?id=new&name=Nuevo+Dictamen', '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Dictaminación Jurídica</h1>
                    <p className="text-slate-500 mt-1">Gestión de expedientes legales y emisión de dictámenes.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por solicitante o RFC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#135bec]/20"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                    <Filter size={18} /> Filtrar Pendientes
                </button>
                <button
                    onClick={handleNewDictamen}
                    className="flex items-center gap-2 px-4 py-2 bg-[#135bec] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} /> Nuevo Dictamen
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-600 text-sm">Solicitante</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Fecha Solicitud</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Estatus Legal</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredApps.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-slate-900">{app.solicitante.nombre}</p>
                                            <p className="text-xs text-slate-500 font-mono">{app.solicitante.rfc}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{app.fechaCreacion}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.dictamenJuridico.conlusion === 'Favorable' ? 'bg-green-100 text-green-700' :
                                            app.dictamenJuridico.conlusion === 'No Favorable' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {app.dictamenJuridico.conlusion}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenDictamen(app)}
                                            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ml-auto"
                                        >
                                            <Scale size={16} /> Dictaminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedApp && (
                <DictamenForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    applicationId={selectedApp._id}
                    applicationName={selectedApp.solicitante.nombre}
                    initialData={selectedApp.dictamenJuridico}
                />
            )}
        </div>
    );
};

export default JuridicoView;
