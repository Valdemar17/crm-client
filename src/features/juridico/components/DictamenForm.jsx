import { useState } from 'react';
import jsPDF from 'jspdf';
import logo from '../../../assets/sofimas-logo.png';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Save, Printer, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import DictamenPDF from './DictamenPDF';

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

const DictamenForm = ({ isOpen, onClose, applicationId, applicationName, initialData, mode = 'modal' }) => {
    // const [activeTab, setActiveTab] = useState('denominacion'); // Removed for accordion layout
    const [expandedSections, setExpandedSections] = useState({ denominacion: true });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Helper to check empty string
    const isEmpty = (val) => !val || (typeof val === 'string' && val.trim() === '');
    const isObjEmpty = (obj) => obj && Object.values(obj).some(isEmpty);


    const [formData, setFormData] = useState({
        denominacion: applicationName || '',
        objetivo: initialData?.objetivo || '',
        antecedentes: initialData?.antecedentes || {},
        accionistas: initialData?.accionistas || [],
        representantes: initialData?.representantes || [],
        observaciones: initialData?.observaciones || '',
        cuestionario: initialData?.cuestionario || {},
        documentacion: initialData?.documentacion || {},
        documentacionPersonas: initialData?.documentacionPersonas || [],
        escrituras: initialData?.escrituras || [],
        conlusion: initialData?.conlusion || 'Pendiente',
        comentarios: initialData?.comentarios || '',
        datosNotariales: { escritura: '', volumen: '', fecha: '', notario: '', numero: '', ciudad: '', ...initialData?.datosNotariales }, // Keeping for backward compatibility or mapping
        registroPublico: { folio: '', fecha: '', lugar: '', ...initialData?.registroPublico },
        representanteLegal: { nombre: '', poderes: '', ...initialData?.representanteLegal },
        poderes: { actosDominio: 'Mancomunado', actosAdministracion: 'Indistinto', pleitosCobranzas: 'Indistinto', titulosCredito: 'Mancomunado', otros: '', ...initialData?.poderes },
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/);

            const parsed = {
                Denominación: [], Objetivo: [], Antecedentes: [], Accionistas: [],
                Representantes: [], Observaciones: [], Cuestionamientos: [],
                Documentación: [], Documentación_Personas: [], Escrituras: [], Conclusión: []
            };

            let currentSection = null;
            let headers = null;

            const parseCSVLine = (line) => {
                const values = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') { inQuotes = !inQuotes; }
                    else if (char === ',' && !inQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());
                return values.map(v => v.replace(/^"|"$/g, '').trim());
            };

            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                if (line.startsWith('SECTION:')) {
                    const sec = line.split(':')[1].trim();
                    // Map to parsed keys case-insensitive
                    const key = Object.keys(parsed).find(k => k.toLowerCase() === sec.toLowerCase());
                    currentSection = key || null;
                    headers = null;
                    continue;
                }
                if (currentSection) {
                    const vals = parseCSVLine(line);
                    if (!headers) { headers = vals; }
                    else {
                        const row = {};
                        headers.forEach((h, i) => { if (vals[i] !== undefined) row[h] = vals[i]; });
                        parsed[currentSection].push(row);
                    }
                }
            }

            setFormData(prev => ({
                ...prev,
                denominacion: parsed.Denominación[0]?.denominacion || prev.denominacion,
                objetivo: parsed.Objetivo[0]?.obj_descripcion || parsed.Objetivo[0]?.objetivo || '',
                antecedentes: parsed.Antecedentes[0] || {},
                datosNotariales: {
                    ...prev.datosNotariales,
                    escritura: parsed.Antecedentes[0]?.ant_escritura || '',
                    fecha: parsed.Antecedentes[0]?.ant_fecha || '',
                    notario: parsed.Antecedentes[0]?.ant_fedatario || '',
                    ciudad: parsed.Antecedentes[0]?.ant_circunscripcion || '',
                    volumen: parsed.Antecedentes[0]?.ant_volumen || '',
                    numero: parsed.Antecedentes[0]?.ant_num_fedatario || ''
                },
                registroPublico: {
                    ...prev.registroPublico,
                    folio: parsed.Antecedentes[0]?.ant_registro || '',
                    fecha: parsed.Antecedentes[0]?.ant_fecha_reg || '',
                    lugar: parsed.Antecedentes[0]?.ant_lugar_reg || ''
                },
                accionistas: parsed.Accionistas.map(a => ({
                    nombre: a.nombre || a.accionista || '',
                    acciones: parseInt(a.acciones) || 0,
                    porcentaje: parseFloat(a.porcentaje) || 0
                })),
                representantes: parsed.Representantes,
                observaciones: parsed.Observaciones[0]?.obs_texto || '',
                documentacion: parsed.Documentación[0] || {},
                documentacionPersonas: parsed.Documentación_Personas,
                escrituras: parsed.Escrituras,
                conlusion: parsed.Conclusión[0]?.conclusion?.includes('FAVORABLE') ? 'Favorable' : 'Pendiente',
                comentarios: parsed.Conclusión[0]?.comentarios || '',
                representanteLegal: {
                    ...prev.representanteLegal,
                    nombre: parsed.Representantes[0]?.nombre || ''
                },
                poderes: {
                    ...prev.poderes
                    // TODO: Map specific poder fields if they exist in CSV
                }
            }));
            alert("Información importada correctamente.");
        };
        reader.readAsText(file);
    };

    const handlePrint = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPos = 20;

        // --- Header ---
        const img = new Image();
        img.src = logo;
        img.onload = () => {
            const logoWidth = 35;
            const logoHeight = (img.height * logoWidth) / img.width;
            doc.addImage(img, 'PNG', margin, yPos, logoWidth, logoHeight);

            doc.setTextColor(19, 91, 236); // #135bec
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text("DICTAMEN JURÍDICO", pageWidth - margin, yPos + 10, { align: 'right' });

            doc.setTextColor(100, 116, 139); // slate-500
            doc.setFontSize(10);
            doc.text("SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR", pageWidth - margin, yPos + 16, { align: 'right' });
            doc.text(new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, yPos + 22, { align: 'right' });

            yPos += 30;

            // --- Antecedentes ---
            doc.setTextColor(19, 91, 236);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("ANTECEDENTES DEL HECHO", margin, yPos);
            yPos += 8;

            doc.setTextColor(13, 18, 27);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            const antecedentes = [
                `Denominación: ${applicationName || 'N/A'}`,
                `Escritura Pública: ${formData.datosNotariales.escritura || '-'}`,
                `Volumen: ${formData.datosNotariales.volumen || '-'}`,
                `Fecha Constitutiva: ${formData.datosNotariales.fecha || '-'}`,
                `Notario Público: ${formData.datosNotariales.notario || '-'}`,
                `Número de Notaría: ${formData.datosNotariales.numero || '-'}`,
                `Ciudad/Estado: ${formData.datosNotariales.ciudad || '-'}`,
                `Folio Mercantil: ${formData.registroPublico.folio || '-'}`,
                `Lugar de Inscripción: ${formData.registroPublico.lugar || '-'}`
            ];

            // Render antecedentes in 2 columns
            const col2X = pageWidth / 2 + 10;
            antecedentes.forEach((text, i) => {
                const x = i % 2 === 0 ? margin : col2X;
                if (i > 0 && i % 2 === 0) yPos += 6;
                doc.text(text, x, yPos);
            });
            yPos += 15;

            // --- Cuadro Accionario ---
            doc.setTextColor(19, 91, 236);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("CUADRO ACCIONARIO ACTUAL", margin, yPos);
            yPos += 8;

            // Headers
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.text("Nombre / Razón Social", margin + 2, yPos);
            doc.text("Acciones", pageWidth / 2, yPos, { align: 'center' });
            doc.text("Porcentaje", pageWidth - margin - 2, yPos, { align: 'right' });
            yPos += 8;

            // Rows
            doc.setTextColor(13, 18, 27);
            doc.setFont(undefined, 'normal');

            if (formData.cuadroAccionario.length === 0) {
                doc.text("No hay accionistas registrados.", margin + 2, yPos);
                yPos += 8;
            } else {
                formData.cuadroAccionario.forEach(acc => {
                    doc.text(acc.nombre || '-', margin + 2, yPos);
                    doc.text((acc.acciones || 0).toString(), pageWidth / 2, yPos, { align: 'center' });
                    doc.text((acc.porcentaje || 0) + '%', pageWidth - margin - 2, yPos, { align: 'right' });
                    yPos += 6;
                });
            }
            yPos += 10;

            // --- Representante Legal & Poderes ---
            doc.setTextColor(19, 91, 236);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("REPRESENTACIÓN LEGAL Y PODERES", margin, yPos);
            yPos += 8;

            doc.setTextColor(13, 18, 27);
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text(`Representante: ${formData.representanteLegal.nombre || 'No especificado'}`, margin, yPos);
            yPos += 6;

            doc.setFont(undefined, 'normal');
            const poderes = [
                `Actos de Dominio: ${formData.poderes.actosDominio || '-'}`,
                `Actos de Administración: ${formData.poderes.actosAdministracion || '-'}`,
                `Pleitos y Cobranzas: ${formData.poderes.pleitosCobranzas || '-'}`,
                `Títulos de Crédito: ${formData.poderes.titulosCredito || '-'}`
            ];
            poderes.forEach(pod => {
                doc.text(pod, margin, yPos);
                yPos += 6;
            });
            yPos += 10;

            // --- Conclusión ---
            doc.setTextColor(19, 91, 236);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("CONCLUSIÓN", margin, yPos);
            yPos += 8;

            const conclusionColor = formData.conlusion === 'Favorable' ? [22, 163, 74] :
                formData.conlusion === 'No Favorable' ? [220, 38, 38] : [234, 179, 8];
            doc.setTextColor(...conclusionColor);
            doc.setFontSize(10);
            doc.text(`DICTAMEN ${formData.conlusion.toUpperCase()}`, margin, yPos);
            yPos += 6;

            doc.setTextColor(13, 18, 27);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            const splitComentarios = doc.splitTextToSize(formData.comentarios || 'Sin comentarios adicionales.', pageWidth - (margin * 2));
            doc.text(splitComentarios, margin, yPos);

            // Save
            doc.save(`Dictamen_${applicationName || 'Juridico'}.pdf`);
        };

        img.onerror = () => {
            alert("Error al cargar logo. Se generará sin logo.");
            // Fallback generation (copy paste logic sans logo if needed, or just warn)
        };
    };

    // --- Handlers Genéricos ---
    const handleChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    // --- Handlers Accionistas ---
    const addAccionista = () => {
        setFormData(prev => ({
            ...prev,
            accionistas: [...(prev.accionistas || []), { nombre: '', acciones: 0, porcentaje: 0 }]
        }));
    };
    const updateAccionista = (index, field, value) => {
        const newArr = [...formData.accionistas];
        newArr[index][field] = value;
        setFormData(prev => ({ ...prev, accionistas: newArr }));
    };
    const removeAccionista = (index) => {
        setFormData(prev => ({ ...prev, accionistas: prev.accionistas.filter((_, i) => i !== index) }));
    };

    const handleQuestionChange = (question, value) => {
        setFormData(prev => ({
            ...prev,
            cuestionario: {
                ...prev.cuestionario,
                [question]: value
            }
        }));
    };

    const renderContent = () => (
        <div className={`flex flex-col lg:flex-row gap-6 ${mode === 'page' ? 'h-screen p-6 bg-slate-50' : 'h-[75vh]'}`}>

            {/* IZQUIERDA: FORMULARIO con TABS */}
            <div className={`flex-1 overflow-y-auto pr-2 border-r border-slate-100 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 ${mode === 'page' ? 'bg-white p-6 rounded-lg shadow-sm' : ''}`}>

                {/* Accordion Content */}
                <div className="space-y-4 pr-2">
                    <FormSection
                        title="1. Denominación"
                        isOpen={expandedSections['denominacion']}
                        onToggle={() => toggleSection('denominacion')}
                        hasError={isEmpty(formData.denominacion)}
                    >
                        <h3 className="font-bold text-slate-800">Denominación Social</h3>
                        <Input
                            label="Nombre / Razón Social"
                            value={formData.denominacion}
                            onChange={(e) => handleChange(null, 'denominacion', e.target.value)}
                            error={isEmpty(formData.denominacion) ? " " : ""}
                        />
                    </FormSection>

                    <FormSection
                        title="2. Antecedentes"
                        isOpen={expandedSections['antecedentes']}
                        onToggle={() => toggleSection('antecedentes')}
                        hasError={isObjEmpty(formData.datosNotariales) || isObjEmpty(formData.registroPublico)}
                    >
                        <h3 className="font-bold text-slate-800">Datos Notariales (Constitutiva)</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Escritura" value={formData.datosNotariales.escritura} onChange={(e) => handleChange('datosNotariales', 'escritura', e.target.value)} error={isEmpty(formData.datosNotariales.escritura) ? " " : ""} />
                            <Input label="Volumen" value={formData.datosNotariales.volumen} onChange={(e) => handleChange('datosNotariales', 'volumen', e.target.value)} error={isEmpty(formData.datosNotariales.volumen) ? " " : ""} />
                            <Input label="Fecha" type="date" value={formData.datosNotariales.fecha} onChange={(e) => handleChange('datosNotariales', 'fecha', e.target.value)} error={isEmpty(formData.datosNotariales.fecha) ? " " : ""} />
                            <Input label="Notario" value={formData.datosNotariales.notario} onChange={(e) => handleChange('datosNotariales', 'notario', e.target.value)} error={isEmpty(formData.datosNotariales.notario) ? " " : ""} />
                            <Input label="Número Notaría" value={formData.datosNotariales.numero} onChange={(e) => handleChange('datosNotariales', 'numero', e.target.value)} error={isEmpty(formData.datosNotariales.numero) ? " " : ""} />
                            <Input label="Ciudad" value={formData.datosNotariales.ciudad} onChange={(e) => handleChange('datosNotariales', 'ciudad', e.target.value)} error={isEmpty(formData.datosNotariales.ciudad) ? " " : ""} />
                        </div>
                        <h3 className="font-bold text-slate-800 mt-4">Registro Público</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Folio Mercantil" value={formData.registroPublico.folio} onChange={(e) => handleChange('registroPublico', 'folio', e.target.value)} error={isEmpty(formData.registroPublico.folio) ? " " : ""} />
                            <Input label="Lugar Registro" value={formData.registroPublico.lugar} onChange={(e) => handleChange('registroPublico', 'lugar', e.target.value)} error={isEmpty(formData.registroPublico.lugar) ? " " : ""} />
                            <Input label="Fecha Registro" value={formData.registroPublico.fecha} onChange={(e) => handleChange('registroPublico', 'fecha', e.target.value)} error={isEmpty(formData.registroPublico.fecha) ? " " : ""} />
                        </div>
                        <h3 className="font-bold text-slate-800 mt-4">Observaciones Antecedentes</h3>
                        <textarea
                            className={`w-full border rounded-lg p-3 text-sm mt-2 ${isEmpty(formData.observaciones) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            rows="3"
                            value={typeof formData.observaciones === 'string' ? formData.observaciones : ''}
                            onChange={(e) => handleChange(null, 'observaciones', e.target.value)}
                        />
                    </FormSection>

                    <FormSection
                        title="3. Objetivo"
                        isOpen={expandedSections['objetivo']}
                        onToggle={() => toggleSection('objetivo')}
                        hasError={isEmpty(formData.objetivo)}
                    >
                        <h3 className="font-bold text-slate-800">Objetivo y Descripción</h3>
                        <textarea
                            className={`w-full border rounded-lg p-3 text-sm mt-2 ${isEmpty(formData.objetivo) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            rows="6"
                            value={formData.objetivo}
                            onChange={(e) => handleChange(null, 'objetivo', e.target.value)}
                            placeholder="Descripción del objetivo..."
                        />
                        <h3 className="font-bold text-slate-800 mt-4">Comentarios Generales</h3>
                        <textarea
                            className="w-full border rounded-lg p-3 text-sm mt-2"
                            rows="4"
                            value={formData.comentarios}
                            onChange={(e) => handleChange(null, 'comentarios', e.target.value)}
                        />
                    </FormSection>

                    <FormSection
                        title="4. Accionistas"
                        isOpen={expandedSections['accionistas']}
                        onToggle={() => toggleSection('accionistas')}
                        hasError={!formData.accionistas || formData.accionistas.length === 0 || formData.accionistas.some(a => isEmpty(a.nombre) || !a.acciones || !a.porcentaje)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-800">Cuadro Accionario</h3>
                            <button onClick={addAccionista} className="text-[#135bec] text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        {formData.accionistas?.map((ax, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-end">
                                <div className="flex-1"><Input label="Nombre / Razón Social" value={ax.nombre} onChange={(e) => updateAccionista(idx, 'nombre', e.target.value)} error={isEmpty(ax.nombre) ? " " : ""} /></div>
                                <div className="w-20"><Input label="Acciones" type="number" value={ax.acciones} onChange={(e) => updateAccionista(idx, 'acciones', e.target.value)} error={!ax.acciones ? " " : ""} /></div>
                                <div className="w-20"><Input label="%" type="number" value={ax.porcentaje} onChange={(e) => updateAccionista(idx, 'porcentaje', e.target.value)} error={!ax.porcentaje ? " " : ""} /></div>
                                <button onClick={() => removeAccionista(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded mb-1"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        {(!formData.accionistas || formData.accionistas.length === 0) && <p className="text-red-500 italic text-sm text-center py-4 border border-dashed border-red-300 rounded bg-red-50">No hay accionistas registrados</p>}
                    </FormSection>

                    <FormSection
                        title="5. Representantes"
                        isOpen={expandedSections['representantes']}
                        onToggle={() => toggleSection('representantes')}
                        hasError={formData.representantes.length === 0}
                    >
                        <h3 className="font-bold text-slate-800 mb-2">Representantes Legales</h3>
                        {formData.representantes.map((rep, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded mb-2 border">
                                <div className="font-bold text-[#135bec]">{rep.nombre}</div>
                                <div className="text-xs text-slate-500">Cargo: {rep.cargo} | RFC: {rep.rfc}</div>
                                <div className="mt-2 text-sm">Escritura: {rep.escritura} ({rep.fecha})</div>
                            </div>
                        ))}
                        {formData.representantes.length === 0 && <p className="text-red-500 italic text-sm border border-dashed border-red-300 p-2 rounded bg-red-50">Sin representantes cargados.</p>}
                    </FormSection>

                    <FormSection
                        title="6. Cuestionamientos"
                        isOpen={expandedSections['cuestionamientos']}
                        onToggle={() => toggleSection('cuestionamientos')}
                        hasError={PREGUNTAS_CUESTIONARIO.some(q => isEmpty(formData.cuestionario?.[q]))}
                    >
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4">Cuestionamientos de Validación</h3>
                            <div className="space-y-4">
                                {PREGUNTAS_CUESTIONARIO.map((pregunta, index) => (
                                    <div key={index} className="border-b border-slate-100 pb-3 last:border-0">
                                        <p className="text-sm text-slate-700 mb-2">{index + 1}. {pregunta}</p>
                                        <select
                                            className={`block w-full rounded-lg border bg-white py-2 px-3 text-secondary-900 focus:outline-none focus:ring-1 sm:text-sm transition-colors ${isEmpty(formData.cuestionario?.[pregunta]) ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500' : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'}`}
                                            value={formData.cuestionario?.[pregunta] || ''}
                                            onChange={(e) => handleQuestionChange(pregunta, e.target.value)}
                                        >
                                            <option value="">-- Seleccione una opción --</option>
                                            <option value="Si">Si</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            {PREGUNTAS_CUESTIONARIO.some(q => isEmpty(formData.cuestionario?.[q])) && <p className="text-red-500 text-xs mt-4 font-medium">Por favor responda todas las preguntas.</p>}
                        </div>
                    </FormSection>

                    <FormSection
                        title="7. Documentación"
                        isOpen={expandedSections['documentacion']}
                        onToggle={() => toggleSection('documentacion')}
                        hasError={Object.keys(formData.documentacion).length === 0}
                    >
                        <h3 className="font-bold text-slate-800">Checklist Documental</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(formData.documentacion).map(([k, v]) => (
                                <div key={k} className="flex justify-between border-b py-1">
                                    <span className="text-xs capitalize">{k.replace('doc_', '').replace(/_/g, ' ')}</span>
                                    <span className={`text-xs font-bold ${typeof v === 'string' && v.toUpperCase() === 'SI' ? 'text-green-600' : 'text-slate-400'}`}>{v}</span>
                                </div>
                            ))}
                            {Object.keys(formData.documentacion).length === 0 && <p className="text-red-500 italic text-sm col-span-2 py-2">Sin documentación registrada</p>}
                        </div>
                    </FormSection>

                    <FormSection
                        title="8. Doc. Personas"
                        isOpen={expandedSections['documentacion_personas']}
                        onToggle={() => toggleSection('documentacion_personas')}
                        hasError={formData.documentacionPersonas.length === 0}
                    >
                        <h3 className="font-bold text-slate-800 mt-6">Documentación Personas</h3>
                        {formData.documentacionPersonas.map((p, i) => (
                            <div key={i} className="border-b py-2">
                                <div className="font-bold text-sm">{p.nombre || p.sujeto}</div>
                                <div className="text-xs text-slate-500">RFC: {p.rfc} | {p.identificacion_comp === 'SI' ? 'ID OK' : 'Falta ID'}</div>
                            </div>
                        ))}
                        {formData.documentacionPersonas.length === 0 && <p className="text-red-500 italic text-sm py-2">Sin documentación de personas</p>}
                    </FormSection>

                    <FormSection
                        title="9. Escrituras"
                        isOpen={expandedSections['escrituras']}
                        onToggle={() => toggleSection('escrituras')}
                        hasError={formData.escrituras.length === 0}
                    >
                        <h3 className="font-bold text-slate-800 mb-2">Reformas y Otras Escrituras</h3>
                        {formData.escrituras.map((esc, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded mb-2 border flex justify-between">
                                <div>
                                    <div className="font-bold">{esc.tipo} - No. {esc.numero}</div>
                                    <div className="text-sm text-slate-600">{esc.fecha} | {esc.fedatario}</div>
                                </div>
                                <div className="text-xs text-slate-400">{esc.lugar}</div>
                            </div>
                        ))}
                        {formData.escrituras.length === 0 && <p className="text-red-500 italic text-sm border border-dashed border-red-300 p-2 rounded bg-red-50">Sin escrituras adicionales.</p>}
                    </FormSection>

                    <FormSection
                        title="10. Conclusión"
                        isOpen={expandedSections['conclusion']}
                        onToggle={() => toggleSection('conclusion')}
                        hasError={formData.conlusion === 'Pendiente' || isEmpty(formData.comentarios)}
                    >
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800">Dictamen Final</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleChange(null, 'conlusion', 'Favorable')} className={`flex-1 py-2 font-bold rounded ${formData.conlusion === 'Favorable' ? 'bg-green-100 text-green-700 border border-green-500' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>Favorable</button>
                                <button onClick={() => handleChange(null, 'conlusion', 'No Favorable')} className={`flex-1 py-2 font-bold rounded ${formData.conlusion === 'No Favorable' ? 'bg-red-100 text-red-700 border border-red-500' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>No Favorable</button>
                            </div>
                            <textarea
                                className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${isEmpty(formData.comentarios) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                rows="6"
                                placeholder="Redactar conclusión legal..."
                                value={formData.comentarios}
                                onChange={(e) => handleChange(null, 'comentarios', e.target.value)}
                            />
                        </div>
                    </FormSection>
                </div>
            </div>

            {/* DERECHA: PREVISUALIZACIÓN PDF */}
            <div className={`hidden lg:block w-[50%] bg-slate-100 rounded-lg p-4 overflow-y-auto shadow-inner ${mode === 'page' ? 'h-full' : ''}`}>
                <h4 className="text-center text-slate-500 text-xs uppercase font-bold mb-4 sticky top-0 bg-slate-100 py-2">Vista Previa de Impresión</h4>
                <div className="w-full">
                    <DictamenPDF data={formData} applicationName={applicationName} />
                </div>
            </div>

        </div>
    );

    // Si es modo página, renderizar estructura completa con Header
    if (mode === 'page') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Dictamen Jurídico</h1>
                        <p className="text-sm text-slate-500">Expediente: {applicationName}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button variant="outline" icon={Save}>Cargar CSV</Button>
                        </div>
                        <Button variant="outline" onClick={handlePrint} icon={Printer}>Imprimir PDF</Button>
                        <Button icon={Save} onClick={() => alert("Guardado")}>Guardar</Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Dictamen Jurídico - ${applicationName}`}
            maxWidth="max-w-6xl"
            footer={
                <div className="flex justify-between w-full">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" icon={Save}>Cargar CSV</Button>
                    </div>
                    <Button variant="outline" onClick={handlePrint} icon={Printer}>
                        Imprimir PDF
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cerrar</Button>
                        <Button icon={Save} onClick={() => alert("Guardado (Simulado)")}>Guardar Cambios</Button>
                    </div>
                </div>
            }
        >
            {renderContent()}
        </Modal>
    );
};

const FormSection = ({ title, isOpen, onToggle, children, hasError }) => {
    return (
        <div className={`border rounded-lg overflow-hidden bg-white mb-2 shadow-sm transition-colors ${hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
            <button
                onClick={onToggle}
                className={`w-full flex justify-between items-center p-3 transition-colors text-left ${hasError ? 'bg-red-50 hover:bg-red-100' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${hasError ? 'text-red-700' : 'text-slate-700'}`}>{title}</span>
                    {hasError && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
                {isOpen ? <ChevronUp size={18} className={hasError ? "text-red-400" : "text-slate-400"} /> : <ChevronDown size={18} className={hasError ? "text-red-400" : "text-slate-400"} />}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DictamenForm;
