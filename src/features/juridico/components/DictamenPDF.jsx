import React from 'react';
import { Check, X } from 'lucide-react';
import logo from '../../../assets/sofimas-logo.png';

const PREGUNTAS_CUESTIONARIO = [
    "El solicitante y/o garante hipotecario o aval ¿tiene(n) capacidad jurídica para contratar o conceder garantías?",
    "La identificación de quien firma, ¿hace plena fe de su identidad?",
    "En su caso, quien firma en representación del solicitante y/o garante hipotecario o aval, ¿tiene facultades para suscribir títulos de crédito y, de ser necesario, para otorgar garantías reales y/o personales, y que las mismas no le han sido revocadas, modificadas o limitadas?",
    "El bien inmueble otorgado en garantía, ¿es propiedad del garante hipotecario y se encuentra libre de gravámenes y limitaciones de dominio que afecten la garantía?",
    "El régimen matrimonial del garante hipotecario persona física, ¿permite constituir legalmente la garantía?",
    "¿Los datos del Registro Público de la Propiedad coinciden con los de las escrituras de propiedad?",
    "¿Se cuenta con el certificado de libertad de gravámenes, el cual reporta que el inmueble se encuentra libre de gravámenes?",
    "¿Se cuenta con el número oficial, alineamiento y uso de suelo, en caso de requerirse?",
    "¿La garantía requiere avalúo?",
    "¿Se consultó que los otorgantes de crédito no se encontraran en las listas de personas bloqueadas de la CNBV?",
    "¿El solicitante y/o garante hipotecario o aval proporcionaron la autorización para ser investigados en el Buró de Crédito?",
    "¿Existe alguna observación referente a la situación del Buró de Crédito del solicitante, garante hipotecario y/o aval?",
    "¿Existe alguna observación legal que impida la formalización del crédito?"
];

const DictamenPDF = React.forwardRef(({ data, applicationName }, ref) => {
    // Helper para fechas
    const formatDate = (dateString) => {
        if (!dateString) return '__________________';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const { datosNotariales, registroPublico, cuadroAccionario, administracion, poderes, representanteLegal, conlusion, cuestionario, comentarios } = data;

    return (
        <div ref={ref} className="p-8 w-full mx-auto bg-white text-xs font-sans text-slate-800 print:text-xs">
            {/* HEADER */}
            <div className="flex justify-between items-start border-b-2 border-[#135bec] pb-4 mb-6">
                <div>
                    <img src={logo} alt="SOFIMAS" className="h-12 object-contain" />
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-[#135bec]">DICTAMEN JURÍDICO</h2>
                    <p className="text-slate-500">SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR</p>
                    <p className="text-slate-500">{formatDate(Date.now())}</p>
                </div>
            </div>

            {/* DENOMINACION */}
            <div className="mb-6 border-l-4 border-[#135bec] pl-4">
                <p className="text-[10px] uppercase font-bold text-[#135bec]">Denominación de la Sociedad</p>
                <h3 className="text-xl font-bold uppercase">{data.denominacion || applicationName}</h3>
            </div>

            {/* OBJETIVO */}
            <div className="bg-slate-50 p-4 mb-6 rounded-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 mb-1">OBJETIVO DEL DICTAMEN</p>
                <p className="italic text-slate-600">
                    "Dictaminar si la sociedad cumple con los requisitos de la Ley y cuenta con las facultades suficientes para celebrar cualquier tipo de crédito y/o arrendamiento de bienes muebles, o bien garantizar los créditos de terceros al amparo de Obligación solidaria y/o aval, o inclusive como tercero garante hipotecario, frente a SOFIMAS CONSULTORES DEL NOROESTE S.A. DE C.V. SOFOM E.N.R."
                </p>
            </div>

            {/* ANTECEDENTES */}
            <h4 className="text-[#135bec] font-bold uppercase mb-2">Antecedentes del Hecho</h4>
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400">ESCRITURA</label>
                    <p className="font-bold">{datosNotariales?.escritura || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400">VOLUMEN</label>
                    <p className="font-bold">{datosNotariales?.volumen || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400">FECHA PÚBLICA</label>
                    <p className="font-bold">{datosNotariales?.fecha || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400">FEDATARIO</label>
                    <p className="font-bold">{datosNotariales?.notario || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400">REGISTRO PÚBLICO</label>
                    <p className="font-bold">{registroPublico?.folio || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400">LUGAR REGISTRO</label>
                    <p className="font-bold">{registroPublico?.lugar || 'N/A'}</p>
                </div>
            </div>

            {/* CUADRO ACCIONARIO */}
            <h4 className="text-[#135bec] font-bold uppercase mb-2">Cuadro Accionario Actual</h4>
            <table className="w-full mb-6 border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-2 text-left text-[10px] font-bold text-slate-500 pl-2">Nombre / Razón Social</th>
                        <th className="py-2 text-center text-[10px] font-bold text-slate-500">Acciones</th>
                        <th className="py-2 text-right text-[10px] font-bold text-slate-500 pr-2">Porcentaje</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {cuadroAccionario && cuadroAccionario.length > 0 ? (
                        cuadroAccionario.map((ax, idx) => (
                            <tr key={idx}>
                                <td className="py-2 pl-2 font-bold">{ax.nombre}</td>
                                <td className="py-2 text-center">{ax.acciones}</td>
                                <td className="py-2 text-right pr-2 text-[#135bec] font-bold">{ax.porcentaje}%</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="3" className="py-2 text-center text-slate-400">Sin información</td></tr>
                    )}
                </tbody>
            </table>

            {/* OBJETO SOCIAL */}
            <h4 className="text-[#135bec] font-bold uppercase mb-2">Objeto Social</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">FACULTAD TÍTULOS DE CRÉDITO</p>
                    <p>{poderes?.titulosCredito || 'Según estatutos...'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">FACULTAD ARRENDAMIENTO</p>
                    <p>{poderes?.otros || 'Según estatutos...'}</p>
                </div>
            </div>

            {/* REPRESENTACION LEGAL */}
            <div className="mb-6 page-break-inside-avoid">
                <h4 className="text-[#135bec] font-bold uppercase mb-2">Representación Legal</h4>
                <div className="p-4 border border-slate-200 rounded">
                    <h5 className="font-bold text-lg mb-2">{representanteLegal?.nombre}</h5>
                    <p className="text-slate-500 mb-2">Poderes Otorgados:</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex justify-between border-b border-slate-100 py-1">
                            <span>Acto de Dominio</span>
                            <span className="font-bold">{poderes?.actosDominio}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                            <span>Actos de Administración</span>
                            <span className="font-bold">{poderes?.actosAdministracion}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                            <span>Pleitos y Cobranzas</span>
                            <span className="font-bold">{poderes?.pleitosCobranzas}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-1">
                            <span>Títulos de Crédito</span>
                            <span className="font-bold">{poderes?.titulosCredito}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ESCRITURAS */}
            {data.escrituras && data.escrituras.length > 0 && (
                <div className="mb-6 page-break-inside-avoid">
                    <h4 className="text-[#135bec] font-bold uppercase mb-2">Reformas y Otras Escrituras</h4>
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-1 text-left pl-2">Tipo / Número</th>
                                <th className="py-1 text-left">Fecha / Fedatario</th>
                                <th className="py-1 text-right pr-2">Lugar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.escrituras.map((esc, idx) => (
                                <tr key={idx}>
                                    <td className="py-1 pl-2 font-bold">{esc.tipo} - {esc.numero}</td>
                                    <td className="py-1">{esc.fecha} - {esc.fedatario}</td>
                                    <td className="py-1 text-right pr-2">{esc.lugar}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DOCUMENTACION */}
            <div className="mb-6 page-break-inside-avoid">
                <h4 className="text-[#135bec] font-bold uppercase mb-2">Expediente Documental</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
                    {data.documentacion && Object.entries(data.documentacion).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-slate-50 py-1">
                            <span className="capitalize">{key.replace('doc_', '').replace(/_/g, ' ')}</span>
                            <span className={`font-bold ${typeof val === 'string' && val.toUpperCase() === 'SI' ? 'text-[#135bec]' : 'text-slate-400'}`}>{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* DOCUMENTACION PERSONAS */}
            {data.documentacionPersonas && data.documentacionPersonas.length > 0 && (
                <div className="mb-6 page-break-inside-avoid">
                    <h4 className="text-[#135bec] font-bold uppercase mb-2">Documentación Personas Relacionadas</h4>
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-1 text-left pl-2">Nombre</th>
                                <th className="py-1 text-center">RFC</th>
                                <th className="py-1 text-right pr-2">Identificación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.documentacionPersonas.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="py-1 pl-2 font-bold">{p.nombre || p.sujeto}</td>
                                    <td className="py-1 text-center">{p.rfc}</td>
                                    <td className="py-1 text-right pr-2">
                                        {p.identificacion_comp === 'SI' ? <Check size={12} className="inline text-green-600" /> : <X size={12} className="inline text-red-400" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CUESTIONARIO */}
            <div className="page-break-before mt-4">
                <h4 className="text-[#135bec] font-bold uppercase mb-4">Cuestionamientos de Validación</h4>
                <ul className="space-y-1">
                    {PREGUNTAS_CUESTIONARIO.map((pregunta, idx) => {
                        const val = cuestionario ? cuestionario[pregunta] : undefined;
                        return (
                            <li key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 text-[10px]">
                                <span className="flex-1 pr-4">{idx + 1}. {pregunta}</span>
                                <span className={`${val ? "text-[#135bec]" : "text-red-500"} font-bold whitespace-nowrap`}>
                                    {val ? val.toUpperCase() : "SIN CONTESTAR"}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* CONCLUSION */}
            <div className="mt-8 bg-slate-50 p-6 rounded border border-slate-200">
                <h4 className="text-[#135bec] font-bold uppercase mb-2">Conclusión Final</h4>
                <p className="mb-4 text-justify font-medium">
                    {comentarios || "Esta empresa cuenta con todas las capacidades legales y físicas para poder contratar con SOFIMAS..."}
                </p>

                <div className={`text-center py-3 rounded text-white font-bold uppercase tracking-widest ${conlusion === 'Favorable' ? 'bg-[#135bec]' : 'bg-red-500'
                    }`}>
                    DICTAMEN {conlusion}
                </div>
            </div>

            {/* FIRMA */}
            <div className="mt-12 text-center">
                <div className="inline-block border-t border-slate-400 px-12 pt-2">
                    <p className="font-bold">Lic. Andrea Lourdes Felix Felix</p>
                    <p className="text-slate-500 text-[10px]">Área Jurídica - SOFIMAS</p>
                </div>
            </div>

        </div>
    );
});

export default DictamenPDF;
