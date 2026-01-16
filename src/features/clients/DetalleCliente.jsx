import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Briefcase, User, Building2, Calendar, Shield, Users, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ExportarImportar from '@/components/clientes/ExportarImportar';

// Helper Components (inline or imported if you prefer separate files)
function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50"
  };
  return (
    <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>;
}

// Mock Components for tabs/tables that were imported
function TablaDocumentos({ documentos, onActualizarDocumento }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="p-3 text-slate-600 font-medium">Documento</th>
                    <th className="p-3 text-slate-600 font-medium">Categoría</th>
                    <th className="p-3 text-slate-600 font-medium">Estatus</th>
                    <th className="p-3 text-slate-600 font-medium">Comentarios</th>
                    <th className="p-3 text-slate-600 font-medium">Acción</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {documentos.map(doc => (
                    <tr key={doc.id}>
                        <td className="p-3 font-medium text-slate-700">{doc.nombre}</td>
                        <td className="p-3 text-slate-500">{doc.categoria || 'General'}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                doc.estatus === 'Aprobado' ? 'bg-green-50 text-green-700 border-green-200' : 
                                doc.estatus === 'Rechazado' ? 'bg-red-50 text-red-700 border-red-200' : 
                                doc.estatus === 'En Revisión' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {doc.estatus}
                            </span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate" title={doc.comentarios}>{doc.comentarios || '-'}</td>
                        <td className="p-3">
                            {doc.estatus !== 'Aprobado' && (
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline" onClick={() => onActualizarDocumento(doc.id, { estatus: 'Aprobado' })}>
                                    Aprobar
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

const coloresEstatus = {
    'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
    'En Proceso': 'bg-blue-100 text-blue-700 border-blue-200',
    'Completo': 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export default function DetalleCliente({ clienteId, onBack, initialClientData }) {
    const [cliente, setCliente] = useState(initialClientData || null);
    const [documentos, setDocumentos] = useState([]);
    const [cargandoCliente, setCargandoCliente] = useState(!initialClientData);
    const [cargandoDocumentos, setCargandoDocumentos] = useState(true);

    // Simulando fetch de cliente si no viene en props
    useEffect(() => {
        if (!cliente && clienteId) {
            setCargandoCliente(true);
            // Mock delay
            setTimeout(() => {
                // Aquí buscarías en tu base de datos real
                setCliente({
                    id: clienteId,
                    nombre: "Cliente Ejemplo S.A. de C.V.",
                    tipo_credito: "Revolvente",
                    operacion: "Crédito Simple",
                    personalidad: "Moral",
                    monto: 1500000,
                    plazo: "24 meses",
                    obligado_solidario: "Juan Perez",
                    aval: "Maria Lopez",
                    garantia: "Nave Industrial",
                    dueno_garantia: "Inmobiliaria JP",
                    estatus: "Activo"
                });
                setCargandoCliente(false);
            }, 500);
        } else {
            setCargandoCliente(false);
        }
    }, [clienteId, cliente]);

    // Simulando fetch de documentos
    useEffect(() => {
        setCargandoDocumentos(true);
        setTimeout(() => {
            setDocumentos([
                { id: 1, nombre: "Acta Constitutiva", estatus: "Aprobado", comentarios: "" },
                { id: 2, nombre: "RFC", estatus: "Aprobado", comentarios: "" },
                { id: 3, nombre: "Comprobante de Domicilio", estatus: "En Revisión", comentarios: "Vigencia dudosa" },
                { id: 4, nombre: "Estados Financieros", estatus: "Pendiente", comentarios: "" },
            ]);
            setCargandoDocumentos(false);
        }, 800);
    }, [clienteId]);

    const handleActualizarDocumento = (docId, datos) => {
        setDocumentos(prev => prev.map(d => d.id === docId ? { ...d, ...datos } : d));
    };

    const handleImportar = async (datosImportados) => {
        // Actualizar documentos existentes si coinciden por nombre
        setDocumentos(prevDocs => {
            const nextDocs = [...prevDocs];
            datosImportados.forEach(imp => {
                const index = nextDocs.findIndex(d => d.nombre === imp.nombre);
                if (index !== -1) {
                    nextDocs[index] = { ...nextDocs[index], ...imp };
                } else {
                    // Si es nuevo, agregarlo (mock ID)
                    nextDocs.push({ ...imp, id: Date.now() + Math.random() });
                }
            });
            return nextDocs;
        });
        console.log("Importando completado", datosImportados);
    };

    // Calcular progreso
    const aprobados = documentos ? documentos.filter(d => d.estatus === 'Aprobado').length : 0;
    const progreso = documentos.length > 0 ? Math.round((aprobados / documentos.length) * 100) : 0;
    let estatusGeneral = 'Pendiente';
    if (progreso === 100) estatusGeneral = 'Completo';
    else if (progreso > 0) estatusGeneral = 'En Proceso';

    if (cargandoCliente) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 animate-pulse">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="h-10 w-40 bg-slate-200 rounded"></div>
                    <div className="h-48 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!cliente) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Cliente no encontrado</h2>
                    <Button onClick={onBack}>
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={onBack} className="p-2 rounded-xl hover:bg-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800">{cliente.name || cliente.nombre}</h1>
                        <p className="text-slate-500">Expediente de crédito</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-sm font-medium ${coloresEstatus[estatusGeneral]}`}>
                        {estatusGeneral}
                    </div>
                </div>

                {/* Info del Cliente */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Tipo Crédito</p>
                                <p className="font-semibold text-slate-800">{cliente.tipo_credito || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Operación</p>
                                <p className="font-semibold text-slate-800">{cliente.operacion || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Personalidad</p>
                                <p className="font-semibold text-slate-800">{cliente.personalidad || cliente.type || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Monto</p>
                                <p className="font-semibold text-slate-800">
                                    {cliente.monto ? `$${cliente.monto.toLocaleString()}` : '$0.00'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Plazo</p>
                                <p className="font-semibold text-slate-800">{cliente.plazo || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Obligado Solidario</p>
                                <p className="font-semibold text-slate-800">{cliente.obligado_solidario || 'No'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Aval</p>
                                <p className="font-semibold text-slate-800">{cliente.aval || 'No'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Garantía</p>
                                <p className="font-semibold text-slate-800">{cliente.garantia || 'Sin Garantía'}</p>
                            </div>
                        </div>
                    </div>

                    {cliente.dueno_garantia && cliente.garantia !== 'Sin Garantía' && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dueño de Garantía</p>
                            <p className="font-semibold text-slate-800">{cliente.dueno_garantia}</p>
                        </div>
                    )}
                </div>

                {/* Barra de progreso */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-700">Progreso del Expediente</h3>
                        <span className="text-2xl font-bold text-indigo-600">{progreso}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-slate-500">
                        <span>{aprobados} de {documentos.length} documentos aprobados</span>
                        <span>{documentos.filter(d => d.estatus === 'En Revisión').length} en revisión</span>
                    </div>
                </div>

                {/* Documentos */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Documentos Requeridos</h3>
                        <ExportarImportar 
                            documentos={documentos} 
                            cliente={cliente}
                            onImportar={handleImportar}
                        />
                    </div>

                    {cargandoDocumentos ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                        </div>
                    ) : documentos.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No hay documentos registrados
                        </div>
                    ) : (
                        <TablaDocumentos 
                            documentos={documentos}
                            onActualizarDocumento={handleActualizarDocumento}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
