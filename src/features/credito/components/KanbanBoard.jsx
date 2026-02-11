import { motion } from 'framer-motion';

const COLUMNS = [
    { id: 'Solicitud', label: 'Solicitud', color: 'bg-slate-100 border-slate-200' },
    { id: 'Analisis', label: 'Análisis', color: 'bg-blue-50 border-blue-200' },
    { id: 'Comite', label: 'Comité', color: 'bg-purple-50 border-purple-200' },
    { id: 'Aprobado', label: 'Aprobado', color: 'bg-green-50 border-green-200' },
    { id: 'Rechazado', label: 'Rechazado', color: 'bg-red-50 border-red-200' }
];

const KanbanBoard = ({ applications, onCardClick }) => {

    // Función helper para formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {COLUMNS.map(col => (
                <div key={col.id} className={`flex-shrink-0 w-72 rounded-xl border ${col.color} p-4 flex flex-col`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-700">{col.label}</h3>
                        <span className="bg-white/50 px-2 py-0.5 rounded text-xs text-slate-500 font-bold">
                            {applications.filter(app => app.estatus === col.id).length}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {applications
                            .filter(app => app.estatus === col.id)
                            .map(app => (
                                <motion.div
                                    key={app._id}
                                    layoutId={app._id}
                                    onClick={() => onCardClick && onCardClick(app)}
                                    className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-slate-800 text-sm truncate">{app.solicitante.nombre}</span>
                                        <span className="text-xs text-slate-400">{app.plazo}m</span>
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 mb-1">
                                        {formatCurrency(app.montoSolicitado)}
                                    </div>
                                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block">
                                        {app.destino}
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
