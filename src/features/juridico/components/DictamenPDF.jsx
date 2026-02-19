import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import QRCode from 'qrcode';
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
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (data.documentacionLink) {
            QRCode.toDataURL(data.documentacionLink)
                .then(url => {
                    setQrCodeUrl(url);
                })
                .catch(err => {
                    console.error("Error generating QR", err);
                });
        } else {
            setQrCodeUrl('');
        }
    }, [data.documentacionLink]);

    // Helper para fechas
    // Helper para fechas
    const formatDate = (dateString) => {
        if (!dateString) return '__________________';

        // 1. Handle YYYY-MM-DD (ISO/Input format)
        if (typeof dateString === 'string') {
            const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (isoMatch) {
                // Avoid timezone issues by constructing date manually or appending time
                const [_, year, month, day] = isoMatch.map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            // 2. Handle DD/MM/YYYY or DD/MM/YY (Common formats)
            const ddmmyyMatch = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
            if (ddmmyyMatch) {
                const [_, dayStr, monthStr, yearStr] = ddmmyyMatch.map(Number);
                let year = yearStr;
                // Adjust 2-digit year (assume 20xx)
                if (year < 100) year += 2000;

                const date = new Date(year, monthStr - 1, dayStr);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback to original string if invalid

        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Helper para numeros
    const formatNumber = (num) => {
        if (!num) return 'N/A';
        const cleanNum = String(num).replace(/,/g, '');
        if (!isNaN(cleanNum) && cleanNum.trim() !== '') {
            return Number(cleanNum).toLocaleString('es-MX');
        }
        return num;
    };

    // Helper para moneda (nuevo)
    const formatCurrency = (num) => {
        if (num === undefined || num === null || num === '') return '$0.00';
        const cleanNum = String(num).replace(/[$,]/g, '');
        if (!isNaN(cleanNum)) {
            return Number(cleanNum).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
        }
        return num;
    };

    const { datosNotariales, registroPublico, accionistas, administracion, poderes, representanteLegal, conlusion, cuestionario, comentarios } = data;

    return (
        <div ref={ref} className="p-8 w-full mx-auto bg-white text-xs font-sans text-slate-800 print:text-xs">
            {/* HEADER */}
            <div id="pdf-header" className="flex justify-between items-start border-b-2 border-[#135bec] pb-4 mb-6">
                <div>
                    <img src={logo} alt="SOFIMAS" className="h-12 object-contain" />
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-[#135bec]">DICTAMEN JURÍDICO</h2>
                    <p className="text-slate-500">SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR</p>
                    <p className="text-slate-500">{formatDate(Date.now())}</p>
                </div>
            </div>

            <div id="pdf-body">
                <div id="pdf-body-part1">
                    {/* DENOMINACION */}
                    <div className="mb-6 border-l-4 border-[#135bec] pl-4">
                        <p className="text-[10px] uppercase font-bold text-[#135bec]">Denominación de la Sociedad</p>
                        <h3 className="text-xl font-bold uppercase">{data.denominacion || applicationName}</h3>
                    </div>

                    {/* OBJETIVO */}
                    <div className="bg-slate-50 p-4 mb-6 rounded-sm border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 mb-1">OBJETIVO DEL DICTAMEN</p>
                        <p className="italic text-slate-600">
                            "{data.objetivoDictamen || 'Dictaminar si la sociedad cumple con los requisitos de la Ley y cuenta con las facultades suficientes para celebrar cualquier tipo de crédito y/o arrendamiento de bienes muebles, o bien garantizar los créditos de terceros al amparo de Obligación solidaria y/o aval, o inclusive como tercero garante hipotecario, frente a SOFIMAS CONSULTORES DEL NOROESTE S.A. DE C.V. SOFOM E.N.R.'}"
                        </p>
                    </div>

                    {/* ANTECEDENTES */}

                    <h4 className="text-[#135bec] font-bold uppercase mb-2">Antecedentes del Hecho</h4>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">ESCRITURA</label>
                            <p className="font-bold">{formatNumber(datosNotariales?.escritura)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">VOLUMEN</label>
                            <p className="font-bold">{formatNumber(datosNotariales?.volumen)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">FECHA DE ESCRITURA PÚBLICA</label>
                            <p className="font-bold">{formatDate(datosNotariales?.fecha)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">FEDATARIO</label>
                            <p className="font-bold uppercase">
                                {datosNotariales?.notario || 'N/A'} {datosNotariales?.numero ? `(No. ${datosNotariales.numero})` : ''}
                            </p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">REGISTRO PÚBLICO</label>
                            <p className="font-bold">{registroPublico?.folio || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">FECHA DE REGISTRO</label>
                            <p className="font-bold">{formatDate(registroPublico?.fecha)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">CIRCUNSCRIPCIÓN</label>
                            <p className="font-bold uppercase">{datosNotariales?.ciudad || registroPublico?.lugar || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">DURACIÓN SOCIEDAD</label>
                            <p className="font-bold uppercase">{data.duracion || 'Indefinida'}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400">VIGENCIA</label>
                            <p className="font-bold uppercase">{data.vigencia || 'N/A'}</p>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-400">DOMICILIO FISCAL</label>
                            <p className="font-bold uppercase">{data.domicilio || 'N/A'}</p>
                        </div>
                    </div>

                    {/* CUADRO ACCIONARIO */}
                    <h4 className="text-[#135bec] font-bold uppercase mb-2">Cuadro Accionario Actual</h4>
                    <table className="w-full mb-6 border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-2 text-left text-[10px] font-bold text-slate-500 pl-2">Nombre / Razón Social</th>
                                <th className="py-2 text-center text-[10px] font-bold text-slate-500">Acciones</th>
                                <th className="py-2 text-right text-[10px] font-bold text-slate-500">Cantidad</th>
                                <th className="py-2 text-right text-[10px] font-bold text-slate-500 pr-2">Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accionistas && accionistas.length > 0 ? (
                                <>
                                    {accionistas.map((ax, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 pl-2 font-bold">{ax.nombre}</td>
                                            <td className="py-2 text-center">{formatNumber(ax.acciones)}</td>
                                            <td className="py-2 text-right font-bold text-slate-600">{formatCurrency(ax.valor)}</td>
                                            <td className="py-2 text-right pr-2 text-[#135bec] font-bold">{ax.porcentaje}%</td>
                                        </tr>
                                    ))}
                                    {/* TOTALS ROW */}
                                    <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                                        <td className="py-2 pl-2 text-right pr-4 text-slate-500">TOTAL</td>
                                        <td className="py-2 text-center">
                                            {formatNumber(accionistas.reduce((acc, curr) => acc + (parseInt(curr.acciones) || 0), 0))}
                                        </td>
                                        <td className="py-2 text-right text-slate-700">
                                            {formatCurrency(accionistas.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0))}
                                        </td>
                                        <td className="py-2 text-right pr-2 text-[#135bec]">
                                            {accionistas.reduce((acc, curr) => acc + (parseFloat(curr.porcentaje) || 0), 0).toFixed(2)}%
                                        </td>
                                    </tr>
                                </>
                            ) : (
                                <tr><td colSpan="4" className="py-2 text-center text-slate-400">Sin información</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* OBJETO SOCIAL */}
                    <div className="mb-6 page-break-inside-avoid">
                        <h4 className="text-[#135bec] font-bold uppercase mb-2">Objeto Social Detallado</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">FACULTAD PARA TÍTULOS DE CRÉDITO</p>
                                <p className="font-medium text-justify">{data.objetoSocial?.titulosCredito || 'No especificado'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">FACULTAD PARA ARRENDAMIENTO</p>
                                <p className="font-medium text-justify">{data.objetoSocial?.arrendamiento || 'No especificado'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">FACULTAD PARA FACTORAJE</p>
                                <p className="font-medium text-justify">{data.objetoSocial?.factoraje || 'No especificado'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">OTROS OBJETOS SOCIALES</p>
                                <p className="font-medium text-justify">{data.objetoSocial?.otros || 'No especificado'}</p>
                            </div>
                        </div>

                        {data.objetivo && (
                            <div className="bg-slate-50 p-4 mb-6 rounded-sm border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Objeto Social Principal</p>
                                <p className="italic text-slate-600 text-justify">
                                    {data.objetivo}
                                </p>
                            </div>
                        )}

                        {/* DATOS SAT */}
                        <h4 className="text-[#135bec] font-bold uppercase mb-2">Datos Inscritos ante el SAT</h4>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">RFC</p>
                                <p className="font-medium">{data.rfc || 'No especificado'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">DOMICILIO FISCAL</p>
                                <p className="font-medium text-justify">{data.domicilio || 'No especificado'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100 col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">ACTIVIDAD ECONÓMICA</p>
                                <p className="font-medium text-justify">{data.actividadEconomica || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* REPRESENTACION LEGAL */}
                </div>

                <div id="pdf-body-part2">
                    {/* REPRESENTACION LEGAL */}
                    <div className="mb-6 page-break-inside-avoid">
                        <h4 className="text-[#135bec] font-bold uppercase mb-4">Representación Legal</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {data.representantes?.map((rep, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white break-inside-avoid shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h5 className="font-bold text-lg text-[#135bec] leading-tight">{rep.nombre}</h5>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                {rep.cargo || 'REPRESENTANTE'}
                                            </span>
                                        </div>
                                        {rep.cargo && (
                                            <span className="bg-[#135bec] text-white text-[9px] px-2 py-1 rounded font-bold uppercase">
                                                {rep.cargo}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-[10px] space-y-1 mb-4 text-slate-700">
                                        <div className="grid grid-cols-2 gap-x-2">
                                            <div><span className="font-bold text-slate-900">RFC:</span> {rep.rfc || 'N/A'}</div>
                                            <div><span className="font-bold text-slate-900">ID Oficial:</span> {rep.idOficial || 'N/A'}</div>
                                        </div>
                                        <div><span className="font-bold text-slate-900">CURP:</span> {rep.curp || 'N/A'}</div>
                                        <div className="leading-tight"><span className="font-bold text-slate-900">Domicilio:</span> {rep.domicilio || 'No especificado'}</div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3">
                                        <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">PODERES</h6>
                                        <p className="text-xs italic text-slate-600 mb-3 leading-snug min-h-[2.5em]">
                                            {rep.poderes || 'Sin poderes especificados'}
                                        </p>

                                        <div className="bg-slate-50 rounded p-2 text-[9px] border border-slate-100">
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                <div><span className="font-bold text-[#135bec]">Escritura:</span> {rep.escritura}</div>
                                                <div><span className="font-bold text-[#135bec]">Volumen:</span> {rep.volumen}</div>
                                                <div><span className="font-bold text-[#135bec]">Fecha:</span> {rep.fecha}</div>
                                                <div><span className="font-bold text-[#135bec]">Fedatario:</span> {rep.fedatario}</div>
                                                <div className="col-span-2"><span className="font-bold text-[#135bec]">Registro:</span> {rep.registro}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!data.representantes || data.representantes.length === 0) && (
                                <div className="col-span-2 text-center text-slate-400 italic py-4 border border-dashed border-slate-200 rounded">
                                    No hay representantes legales registrados.
                                </div>
                            )}
                        </div>
                    </div>


                    {/* OBSERVACIONES */}
                    {(data.observacionesSociedad || data.observacionesRepresentante) && (
                        <div className="mb-6 page-break-inside-avoid">
                            <h4 className="text-[#135bec] font-bold uppercase mb-2">Observaciones</h4>

                            {data.observacionesSociedad && (
                                <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 mb-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">DE LA SOCIEDAD</p>
                                    <p className="italic text-slate-600 text-justify">
                                        "{data.observacionesSociedad}"
                                    </p>
                                </div>
                            )}

                            {data.observacionesRepresentante && (
                                <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">DEL REPRESENTANTE LEGAL</p>
                                    <p className="italic text-slate-600 text-justify">
                                        "{data.observacionesRepresentante}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CUESTIONARIO */}
                    <div className="page-break-before mt-4 mb-6">
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

                </div>



                <div id="pdf-body-part3">
                    {/* DOCUMENTACION */}
                    <div className="mb-6 page-break-inside-avoid">
                        <h4 className="text-[#135bec] font-bold uppercase mb-2">Expediente Documental</h4>
                        <table className="w-full border-collapse text-[9px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-2 text-left pl-2 font-bold text-slate-700">Denominación Social</th>
                                    <th className="py-2 text-center font-bold text-slate-700">Comp. Domicilio</th>
                                    <th className="py-2 text-center font-bold text-slate-700">Acta Const.</th>
                                    <th className="py-2 text-center font-bold text-slate-700">RPP Acta</th>
                                    <th className="py-2 text-center font-bold text-slate-700">Otras Esc.</th>
                                    <th className="py-2 text-center font-bold text-slate-700">RPP Otras</th>
                                    <th className="py-2 text-center font-bold text-slate-700">RFC / Constancia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-2 pl-2 font-bold text-slate-800 w-[20%]">
                                        {data.documentacion?.denominacion || data.denominacion || 'NO ESPECIFICADO'}
                                    </td>
                                    <td className="py-2 text-center w-[10%] font-bold text-slate-800">{data.documentacion?.comprobante_domicilio || 'NO'}</td>
                                    <td className="py-2 text-center w-[10%] font-bold text-slate-800">{data.documentacion?.acta_constitutiva || 'NO'}</td>
                                    <td className="py-2 text-center w-[10%] font-bold text-slate-800">{data.documentacion?.rpp_acta_constitutiva || 'NO'}</td>
                                    <td className="py-2 text-center w-[10%] font-bold text-slate-800">{data.documentacion?.otras_escrituras || 'NO'}</td>
                                    <td className="py-2 text-center w-[10%] font-bold text-slate-800">{data.documentacion?.rpp_otras_escrituras || 'NO'}</td>
                                    <td className="py-2 text-center w-[10%] font-bold text-slate-800">{data.documentacion?.rfc_situacion_fiscal || 'NO'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* DOCUMENTACION PERSONAS */}
                    {/* DOCUMENTACION PERSONAS */}
                    {data.documentacionPersonas && data.documentacionPersonas.length > 0 && (
                        <div className="mb-6 page-break-inside-avoid">
                            <h4 className="text-[#135bec] font-bold uppercase mb-2">Documentación Personas Relacionadas</h4>
                            <table className="w-full border-collapse text-[9px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-2 text-left pl-2 font-bold text-slate-700">Nombre</th>
                                        <th className="py-2 text-center font-bold text-slate-700">Sujeto</th>
                                        <th className="py-2 text-center font-bold text-slate-700">ID Oficial</th>
                                        <th className="py-2 text-center font-bold text-slate-700">Comp. Domicilio</th>
                                        <th className="py-2 text-center font-bold text-slate-700">Acta Matrimonio</th>
                                        <th className="py-2 text-center font-bold text-slate-700">CURP</th>
                                        <th className="py-2 text-center font-bold text-slate-700">RFC / Constancia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.documentacionPersonas.map((p, idx) => {
                                        // Find matching Rep to get the 'cargo' since docs only store name/rfc/curp
                                        const repMatch = data.representantes?.find(r => r.nombre === p.nombre);
                                        const cargo = repMatch?.cargo || 'REPRESENTANTE';

                                        return (
                                            <tr key={idx}>
                                                <td className="py-2 pl-2 font-bold text-slate-800 w-[20%]">{p.nombre || p.sujeto}</td>
                                                <td className="py-2 text-center font-bold w-[10%] uppercase">{cargo}</td>
                                                <td className="py-2 text-center w-[15%] text-slate-600">{repMatch?.idOficial || 'N/A'}</td>
                                                <td className="py-2 text-center w-[10%] font-bold text-slate-800">{p.comprobante_domicilio || 'NO'}</td>
                                                <td className="py-2 text-center w-[10%] font-bold text-slate-800">{p.acta_matrimonio || 'NO'}</td>
                                                <td className="py-2 text-center w-[15%] text-slate-600 font-bold">{p.curp || 'N/A'}</td>
                                                <td className="py-2 text-center w-[20%] font-bold text-slate-800">{p.rfc ? `${p.rfc}/SI` : 'NO'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* IDENTIFICACIONES CARGADAS */}
                    {
                        data.documentacionPersonas && data.documentacionPersonas.some(p => p.archivo_url) && (
                            <div className="mb-6 page-break-inside-avoid">
                                <h4 className="text-[#135bec] font-bold uppercase mb-4">Identificaciones Oficiales</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {data.documentacionPersonas.map((p, idx) => (
                                        p.archivo_url ? (
                                            <div key={idx} className="border border-slate-200 p-2 rounded break-inside-avoid">
                                                <p className="text-[10px] font-bold text-slate-700 mb-2">{p.nombre}</p>
                                                <div className="h-48 w-full flex items-center justify-center bg-slate-50 overflow-hidden">
                                                    <img
                                                        src={p.archivo_url}
                                                        alt={`ID - ${p.nombre}`}
                                                        className="max-w-full max-h-full object-contain"
                                                        crossOrigin="anonymous"
                                                    />
                                                </div>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {/* CUESTIONARIO */}



                    {/* ADMINISTRACION */}
                    {
                        data.administracion && data.administracion.length > 0 && (
                            <div className="mt-6 mb-6 page-break-inside-avoid">
                                <h4 className="text-[#135bec] font-bold uppercase mb-2">Administración de la Sociedad</h4>
                                <table className="w-full border-collapse text-[9px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="py-2 text-left pl-2 font-bold text-slate-700">Nombre</th>
                                            <th className="py-2 text-center font-bold text-slate-700">Cargo</th>
                                            <th className="py-2 text-center font-bold text-slate-700">¿Es Socio?</th>
                                            <th className="py-2 text-center font-bold text-slate-700">Porcentaje Accionario</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.administracion.map((adm, idx) => {
                                            const isSocio = adm.esSocio === 'SI';
                                            const porcentaje = isSocio ? (adm.porcentaje || '') : 'N/A';
                                            const missingNombre = !adm.nombre;
                                            const missingCargo = !adm.cargo;
                                            const missingPorcentaje = isSocio && !adm.porcentaje;

                                            return (
                                                <tr key={idx}>
                                                    <td className={`py-2 pl-2 font-bold w-[40%] ${missingNombre ? 'text-red-500 bg-red-50' : 'text-slate-800'}`}>
                                                        {adm.nombre || 'NOMBRE PENDIENTE'}
                                                    </td>
                                                    <td className={`py-2 text-center font-bold w-[30%] uppercase ${missingCargo ? 'text-red-500 bg-red-50' : ''}`}>
                                                        {adm.cargo || 'CARGO PENDIENTE'}
                                                    </td>
                                                    <td className="py-2 text-center w-[15%] text-slate-600">{adm.esSocio || 'NO'}</td>
                                                    <td className={`py-2 text-center w-[15%] font-bold ${missingPorcentaje ? 'text-red-500 bg-red-50' : 'text-slate-800'}`}>
                                                        {porcentaje || 'PENDIENTE'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                    {/* ESCRITURAS */}
                    {
                        data.escrituras && data.escrituras.length > 0 && (
                            <div className="mt-6 mb-6 page-break-inside-avoid">
                                <h4 className="text-[#135bec] font-bold uppercase mb-2">Escrituras Dictaminadas</h4>
                                <table className="w-full border-collapse text-[9px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="py-1 text-left pl-2 font-bold text-slate-700">Escritura Pública</th>
                                            <th className="py-1 text-center font-bold text-slate-700">Numero</th>
                                            <th className="py-1 text-center font-bold text-slate-700">Fecha</th>
                                            <th className="py-1 text-center font-bold text-slate-700">Federatario Público</th>
                                            <th className="py-1 text-center font-bold text-slate-700">Lugar</th>
                                            <th className="py-1 text-center font-bold text-slate-700">Registro Público</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.escrituras.map((esc, idx) => (
                                            <tr key={idx}>
                                                <td className="py-1 pl-2 font-bold text-slate-800">{esc.tipo}</td>
                                                <td className="py-1 text-center font-bold text-slate-800">{esc.numero}</td>
                                                <td className="py-1 text-center text-slate-600">{esc.fecha}</td>
                                                <td className="py-1 text-center text-slate-600">{esc.fedatario}</td>
                                                <td className="py-1 text-center text-slate-600">{esc.lugar}</td>
                                                <td className="py-1 text-center font-bold text-slate-800">{esc.registro || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                </div>

                {/* END PART 3 */}
            </div>

            <div id="pdf-body-part4">
                {/* DOCUMENTACION SOPORTE */}
                {data.documentacionLink && (
                    <div className="mt-6 mb-6 page-break-inside-avoid">
                        <h4 className="text-[#135bec] font-bold uppercase mb-4">Documentación Soporte</h4>
                        <div className="bg-slate-50 p-6 rounded border border-slate-200 flex items-center">
                            <div className="w-1/2 pr-6 border-r border-slate-200">
                                <p className="font-bold text-slate-700 mb-4 text-lg">Acceso a Expediente Digital</p>
                                <p className="text-sm text-slate-500 text-justify leading-relaxed">
                                    Escanee el código QR para acceder a la carpeta de documentación soporte alojada en OneDrive/SharePoint, que contiene toda la evidencia documental referida en este dictamen.
                                </p>
                            </div>
                            {qrCodeUrl && (
                                <div className="w-1/2 pl-6 flex justify-center">
                                    <a href={data.documentacionLink} target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block cursor-pointer hover:shadow-md transition-all">
                                        <img src={qrCodeUrl} alt="QR Documentación" className="w-56 h-56 object-contain" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                <div className="mt-36 text-center pb-8">
                    <div className="inline-block border-t border-slate-400 px-12 pt-2">
                        <p className="text-slate-500 text-[10px]">SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR</p>
                        <p className="font-bold">Lic. Andrea Lourdes Felix Felix</p>
                    </div>
                </div>
            </div>
        </div >
    );
});

export default DictamenPDF;
