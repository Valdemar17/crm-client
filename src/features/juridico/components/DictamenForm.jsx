import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../assets/sofimas-logo.png';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Save, Printer, Plus, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import DictamenPDF from './DictamenPDF';
import Toast from '../../../components/ui/Toast';

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
    const [toast, setToast] = useState({ message: '', type: 'info' });
    const componentRef = useRef();

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast({ ...toast, message: '' });
    };

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

        rfc: initialData?.rfc || '',
        actividadEconomica: initialData?.actividadEconomica || '',
        objetivo: initialData?.objetivo || '',
        objetivoDictamen: initialData?.objetivoDictamen || '',
        objetoSocial: {
            titulosCredito: '',
            arrendamiento: '',
            factoraje: '',
            otros: '',
            ...initialData?.objetoSocial
        },
        antecedentes: initialData?.antecedentes || {},
        accionistas: initialData?.accionistas || [],
        representantes: initialData?.representantes || [],
        representantes: initialData?.representantes || [],
        observacionesSociedad: initialData?.observacionesSociedad || '',
        observacionesRepresentante: initialData?.observacionesRepresentante || '',
        cuestionario: initialData?.cuestionario || {},
        documentacion: initialData?.documentacion || {
            denominacion: '',
            comprobante_domicilio: '',
            acta_constitutiva: '',
            rpp_acta_constitutiva: '',
            otras_escrituras: '',
            rpp_otras_escrituras: '',
            rfc_situacion_fiscal: ''
        },
        documentacionPersonas: initialData?.documentacionPersonas || [],
        escrituras: initialData?.escrituras || [],
        administracion: initialData?.administracion || [], // Fix: Initialize administracion
        conlusion: initialData?.conlusion || 'Pendiente',
        comentarios: initialData?.comentarios || '',
        datosNotariales: { escritura: '', volumen: '', fecha: '', notario: '', numero: '', ciudad: '', ...initialData?.datosNotariales },
        registroPublico: { folio: '', fecha: '', lugar: '', ...initialData?.registroPublico },
        representanteLegal: { nombre: '', poderes: '', ...initialData?.representanteLegal },
        poderes: { actosDominio: 'Mancomunado', actosAdministracion: 'Indistinto', pleitosCobranzas: 'Indistinto', titulosCredito: 'Mancomunado', otros: '', ...initialData?.poderes },
        duracion: initialData?.duracion || '',
        vigencia: initialData?.vigencia || '',
        domicilio: initialData?.domicilio || '',
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result.replace(/^\uFEFF/, ''); // Strip BOM
            const lines = text.split(/\r?\n/);

            const parsed = {
                Denominación: [], Objetivo: [], Antecedentes: [], Accionistas: [],
                Representantes: [], Observaciones: [], Cuestionamientos: [],
                Denominación: [], Objetivo: [], Antecedentes: [], Accionistas: [],
                Representantes: [], Observaciones: [], Cuestionamientos: [],
                Documentación: [], 'Doc. Personas': [], Escrituras: [], Conclusión: [], Administración: [], 'Datos SAT': [], 'Objeto Social': []
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
                // Handle cases where Excel wraps the section header in quotes
                const cleanLine = line.replace(/^"|"$/g, '');
                if (cleanLine.startsWith('SECTION:')) {
                    const sec = cleanLine.split(':')[1].split(',')[0].trim();
                    // Map section names to parsed keys
                    let key = Object.keys(parsed).find(k => k.toLowerCase() === sec.toLowerCase());
                    // Special case for sections with spaces or different export names
                    if (!key) {
                        if (sec.toLowerCase() === 'doc. personas') key = 'Doc. Personas';
                        if (sec.toLowerCase() === 'datos sat') key = 'Datos SAT';
                        if (sec.toLowerCase() === 'objeto social') key = 'Objetivo'; // Map to Objetivo array check
                    }
                    // If Objeto Social is distinct in export, we should map it. 
                    // Wait, export has 'Objeto Social' (SECTION 3) separate from 'Objetivo'? 
                    // in Reader: parsed.Objetivo. 
                    // in Writer: SECTION: Objeto Social -> keys: objetivo, titulos_credito...
                    // So we should map 'Objeto Social' -> 'Objetivo' component in parsed? 
                    // Actually, let's just map it to 'Objetivo' in the parser object or handle alias.
                    if (sec === 'Objeto Social') key = 'Objetivo';

                    currentSection = key || null;
                    headers = null;
                    continue;
                }
                if (currentSection) {
                    const vals = parseCSVLine(line);
                    if (!headers) { headers = vals.map(v => v.toLowerCase()); }
                    else {
                        const row = {};
                        // Fix for unquoted commas in text fields
                        if (vals.length > headers.length) {
                            const textHeaders = ['conclusion', 'comentarios', 'observaciones', 'objetivo', 'descripción', 'nombre', 'razón social'];
                            const targetIdx = headers.findIndex(h => textHeaders.some(th => h.includes(th)));

                            if (targetIdx !== -1) {
                                const overflow = vals.length - headers.length;
                                // Reconstruct values
                                const merged = vals.slice(targetIdx, targetIdx + overflow + 1).join(',');
                                const newVals = [
                                    ...vals.slice(0, targetIdx),
                                    merged,
                                    ...vals.slice(targetIdx + overflow + 1)
                                ];
                                headers.forEach((h, i) => { if (newVals[i] !== undefined) row[h] = newVals[i]; });
                            } else {
                                // Fallback
                                headers.forEach((h, i) => { if (vals[i] !== undefined) row[h] = vals[i]; });
                            }
                        } else {
                            headers.forEach((h, i) => { if (vals[i] !== undefined) row[h] = vals[i]; });
                        }
                        parsed[currentSection].push(row);
                    }
                }
            }

            setFormData(prev => ({
                ...prev,
                denominacion: parsed.Denominación[0]?.razon_social || parsed.Denominación[0]?.denominacion || prev.denominacion,
                objetivoDictamen: parsed.Denominación[0]?.objetivo_dictamen || prev.objetivoDictamen,

                rfc: parsed['Datos SAT'][0]?.rfc || parsed.Denominación[0]?.rfc || '',
                actividadEconomica: parsed['Datos SAT'][0]?.actividad || parsed.Denominación[0]?.actividad || '',
                domicilio: parsed['Datos SAT'][0]?.domicilio || parsed.Denominación[0]?.den_domicilio || '',
                objetivo: parsed.Objetivo[0]?.objetivo || parsed.Objetivo[0]?.obj_descripcion || '',
                objetoSocial: {
                    titulosCredito: parsed.Objetivo[0]?.titulos_credito || parsed.Objetivo[0]?.obj_titulos || '',
                    arrendamiento: parsed.Objetivo[0]?.arrendamiento || parsed.Objetivo[0]?.obj_arrendamiento || '',
                    factoraje: parsed.Objetivo[0]?.factoraje || parsed.Objetivo[0]?.obj_factoraje || '',
                    otros: parsed.Objetivo[0]?.otros_objetos || parsed.Objetivo[0]?.otros || parsed.Objetivo[0]?.obj_otros || ''
                },
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
                    folio: parsed.Antecedentes[0]?.ant_registro_publico || parsed.Antecedentes[0]?.ant_registro || '',
                    lugar: parsed.Antecedentes[0]?.ant_lugar_registro || parsed.Antecedentes[0]?.ant_lugar_reg || '',
                    fecha: parsed.Antecedentes[0]?.ant_fecha_registro || parsed.Antecedentes[0]?.ant_fecha_reg || ''
                },
                duracion: parsed.Antecedentes[0]?.ant_duracion || '',
                // Removed duplicate domicilio assignment since it's handled in SAT Data
                vigencia: parsed.Antecedentes[0]?.ant_vigencia || '',
                accionistas: parsed.Accionistas.map(a => ({
                    nombre: a.nombre || a.accionista || a.name || '',
                    acciones: parseInt(a.acciones) || 0,
                    valor: parseFloat(a.valor || a.monto || a.capital || 0),
                    porcentaje: parseFloat(a.porcentaje) || 0
                })).filter(a => a.nombre),
                representantes: parsed.Representantes.map(r => ({
                    nombre: r.nombre || r.representante || r.name || '',
                    cargo: r.cargo || r.puesto || '',
                    rfc: r.rfc || r.rep_rfc || '',
                    curp: r.curp || r.rep_curp || '',
                    idOficial: r.id_oficial || r.identificacion || r.rep_id || '',
                    domicilio: r.domicilio || r.direccion || r.rep_domicilio || '',
                    poderes: r.poderes || r.facultades || r.rep_poderes || 'Actos de Dominio de Manera Mancomunada',
                    escritura: r.escritura || r.rep_escritura || '',
                    fecha: r.fecha || r.rep_fecha || '',
                    fedatario: r.fedatario || r.notario || r.rep_fedatario || '',
                    registro: r.registro || r.rpt || r.rep_registro || '',
                    fedatario: r.fedatario || r.notario || r.rep_fedatario || '',
                    registro: r.registro || r.rpt || r.rep_registro || '',
                    volumen: r.volumen || r.rep_volumen || ''
                })).filter(r => r.nombre).reduce((acc, current) => {
                    const x = acc.find(item => item.nombre === current.nombre);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []),
                observacionesSociedad: parsed.Observaciones[0]?.obs_sociedad || '',
                observacionesRepresentante: parsed.Observaciones[0]?.obs_representante || parsed.Observaciones[0]?.obs_rep_legal || '',
                documentacion: {
                    denominacion: parsed.Denominación[0]?.razon_social || parsed.Denominación[0]?.denominacion || '',
                    comprobante_domicilio: parsed.Documentación[0]?.doc_comprobante_domicilio || '',
                    acta_constitutiva: parsed.Documentación[0]?.doc_acta_constitutiva || '',
                    rpp_acta_constitutiva: parsed.Documentación[0]?.doc_rpp_acta_constitutiva || '',
                    otras_escrituras: parsed.Documentación[0]?.doc_otras_escrituras || '',
                    rpp_otras_escrituras: parsed.Documentación[0]?.doc_rpp_otras_escrituras || '',
                    rfc_situacion_fiscal: parsed.Documentación[0]?.doc_rfc_situacion_fiscal || ''
                },
                cuestionario: PREGUNTAS_CUESTIONARIO.reduce((acc, pregunta, index) => {
                    const qKey = `q${index + 1}`;
                    const val = parsed.Cuestionamientos[0]?.[qKey];
                    if (val) acc[pregunta] = val;
                    return acc;
                }, {}),
                documentacionPersonas: (parsed['Doc. Personas'] && parsed['Doc. Personas'].length > 0) ? parsed['Doc. Personas'].map(p => ({
                    nombre: p.nombre || '',
                    rfc: p.rfc || '',
                    curp: p.curp || '',
                    identificacion_comp: 'SI',
                    comprobante_domicilio: 'SI',
                    acta_matrimonio: 'NO',
                    archivo_id: null
                })).filter(p => p.nombre) : parsed.Representantes.map(r => ({
                    nombre: r.nombre || r.representante || r.name || '',
                    rfc: r.rfc || r.rep_rfc || '',
                    curp: r.curp || r.rep_curp || '',
                    identificacion_comp: 'SI',
                    comprobante_domicilio: 'SI',
                    acta_matrimonio: 'NO',
                    archivo_id: null
                })).filter(r => r.nombre),
                escrituras: parsed.Escrituras.map(e => ({
                    tipo: e.tipo || e.escritura || '',
                    numero: e.numero || e.no || '',
                    fecha: e.fecha || '',
                    fedatario: e.fedatario || e.notario || '',
                    lugar: e.lugar || e.ciudad || '',
                    registro: e.registro || e.rpt || e.datos_registro || ''
                })).filter(e => e.tipo),
                administracion: parsed.Administración.map(a => ({
                    nombre: a.nombre || '',
                    cargo: a.cargo || '',
                    esSocio: a.es_socio || a.socio || '',
                    porcentaje: a.porcentaje || a.porcentaje_accionario || ''
                })).filter(a => a.nombre),
                conlusion: (parsed.Conclusión[0]?.conclusion?.toUpperCase().includes('FAVORABLE') || parsed.Conclusión[0]?.comentarios?.toUpperCase().includes('FAVORABLE')) ? 'Favorable' : 'Pendiente',
                comentarios: parsed.Conclusión[0]?.conclusion || parsed.Conclusión[0]?.comentarios || '',
                representanteLegal: {
                    ...prev.representanteLegal,
                    nombre: parsed.Representantes[0]?.nombre || ''
                },
                poderes: {
                    ...prev.poderes
                    // TODO: Map specific poder fields if they exist in CSV
                }
            }));

            showToast("Información importada correctamente.", "success");
        };
        reader.readAsText(file);
    };

    const handleDownloadCSV = () => {
        const sections = [];

        // Helper to escape CSV values
        const csvVal = (val) => {
            if (val === null || val === undefined) return '""';
            const stringVal = String(val);
            if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        };

        // 1. Denominación
        sections.push('SECTION: Denominación');
        sections.push('razon_social,objetivo_dictamen');
        sections.push(`${csvVal(formData.denominacion)},${csvVal(formData.objetivoDictamen)}`);
        sections.push('');

        // 2. Antecedentes
        sections.push('SECTION: Antecedentes');
        sections.push('ant_escritura,ant_volumen,ant_fecha,ant_fedatario,ant_num_fedatario,ant_circunscripcion,ant_registro_publico,ant_lugar_registro,ant_fecha_registro,ant_duracion,ant_vigencia');
        sections.push(`${csvVal(formData.datosNotariales.escritura)},${csvVal(formData.datosNotariales.volumen)},${csvVal(formData.datosNotariales.fecha)},${csvVal(formData.datosNotariales.notario)},${csvVal(formData.datosNotariales.numero)},${csvVal(formData.datosNotariales.ciudad)},${csvVal(formData.registroPublico.folio)},${csvVal(formData.registroPublico.lugar)},${csvVal(formData.registroPublico.fecha)},${csvVal(formData.duracion)},${csvVal(formData.vigencia)}`);
        sections.push('');

        // 3. Objeto Social
        sections.push('SECTION: Objeto Social');
        sections.push('objetivo,titulos_credito,arrendamiento,factoraje,otros_objetos');
        sections.push(`${csvVal(formData.objetivo)},${csvVal(formData.objetoSocial.titulosCredito)},${csvVal(formData.objetoSocial.arrendamiento)},${csvVal(formData.objetoSocial.factoraje)},${csvVal(formData.objetoSocial.otros)}`);
        sections.push('');

        // 4. Datos Inscritos ante el SAT
        sections.push('SECTION: Datos SAT');
        sections.push('rfc,actividad,domicilio');
        sections.push(`${csvVal(formData.rfc)},${csvVal(formData.actividadEconomica)},${csvVal(formData.domicilio)}`);
        sections.push('');

        // 5. Accionistas
        sections.push('SECTION: Accionistas');
        sections.push('nombre,acciones,valor,porcentaje');
        formData.accionistas.forEach(a => {
            sections.push(`${csvVal(a.nombre)},${csvVal(a.acciones)},${csvVal(a.valor)},${csvVal(a.porcentaje)}`);
        });
        sections.push('');

        // 6. Representantes
        sections.push('SECTION: Representantes');
        sections.push('nombre,cargo,rfc,curp,id_oficial,domicilio,poderes,escritura,volumen,fecha,fedatario,registro');
        formData.representantes.forEach(r => {
            sections.push(`${csvVal(r.nombre)},${csvVal(r.cargo)},${csvVal(r.rfc)},${csvVal(r.curp)},${csvVal(r.idOficial)},${csvVal(r.domicilio)},${csvVal(r.poderes)},${csvVal(r.escritura)},${csvVal(r.volumen)},${csvVal(r.fecha)},${csvVal(r.fedatario)},${csvVal(r.registro)}`);
        });
        sections.push('');

        // 7. Observaciones
        sections.push('SECTION: Observaciones');
        sections.push('obs_sociedad,obs_representante');
        sections.push(`${csvVal(formData.observacionesSociedad)},${csvVal(formData.observacionesRepresentante)}`);
        sections.push('');

        // 8. Cuestionamientos
        sections.push('SECTION: Cuestionamientos');
        const qHeaders = PREGUNTAS_CUESTIONARIO.map((_, i) => `q${i + 1}`).join(',');
        sections.push(qHeaders);
        const qValues = PREGUNTAS_CUESTIONARIO.map((q) => csvVal(formData.cuestionario[q] || '')).join(',');
        sections.push(qValues);
        sections.push('');

        // 9. Documentación
        sections.push('SECTION: Documentación');
        sections.push('doc_comprobante_domicilio,doc_acta_constitutiva,doc_rpp_acta_constitutiva,doc_otras_escrituras,doc_rpp_otras_escrituras,doc_rfc_situacion_fiscal');
        sections.push(`${csvVal(formData.documentacion.comprobante_domicilio)},${csvVal(formData.documentacion.acta_constitutiva)},${csvVal(formData.documentacion.rpp_acta_constitutiva)},${csvVal(formData.documentacion.otras_escrituras)},${csvVal(formData.documentacion.rpp_otras_escrituras)},${csvVal(formData.documentacion.rfc_situacion_fiscal)}`);
        sections.push('');

        // 10. Doc. Personas
        sections.push('SECTION: Doc. Personas');
        sections.push('nombre,identificacion,comprobante_domicilio,acta_matrimonio,rfc');
        formData.documentacionPersonas.forEach(p => {
            sections.push(`${csvVal(p.nombre)},${csvVal(p.identificacion_comp)},${csvVal(p.comprobante_domicilio)},${csvVal(p.acta_matrimonio)},${csvVal(p.rfc ? 'SI' : 'NO')}`);
        });
        sections.push('');

        // 11. Administración
        sections.push('SECTION: Administración');
        sections.push('nombre,cargo,es_socio,porcentaje');
        formData.administracion.forEach(a => {
            sections.push(`${csvVal(a.nombre)},${csvVal(a.cargo)},${csvVal(a.esSocio)},${csvVal(a.porcentaje)}`);
        });
        sections.push('');

        // 12. Escrituras
        if (formData.escrituras && formData.escrituras.length > 0) {
            sections.push('SECTION: Escrituras');
            sections.push('tipo,numero,fecha,fedatario,lugar,registro');
            formData.escrituras.forEach(e => {
                sections.push(`${csvVal(e.tipo)},${csvVal(e.numero)},${csvVal(e.fecha)},${csvVal(e.fedatario)},${csvVal(e.lugar)},${csvVal(e.registro)}`);
            });
            sections.push('');
        }

        // 13. Conclusión
        sections.push('SECTION: Conclusión');
        sections.push('conclusion');
        sections.push(`${csvVal(formData.comentarios)}`);

        // Create blob and download
        const csvContent = sections.join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Dictamen_${applicationName || 'Juridico'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const validateForm = () => {
        const errors = [];
        if (isEmpty(formData.denominacion)) errors.push("Denominación / Razón Social");
        if (isEmpty(formData.rfc)) errors.push("RFC");
        if (isEmpty(formData.actividadEconomica)) errors.push("Actividad Económica");
        if (isEmpty(formData.domicilio)) errors.push("Domicilio Fiscal");
        if (isEmpty(formData.objetivo)) errors.push("Objeto Social Principal");

        // Antecedentes
        if (isEmpty(formData.datosNotariales.escritura)) errors.push("Antecedentes - Escritura");
        if (isEmpty(formData.datosNotariales.fecha)) errors.push("Antecedentes - Fecha");
        if (isEmpty(formData.datosNotariales.notario)) errors.push("Antecedentes - Notario");
        if (isEmpty(formData.registroPublico.folio)) errors.push("Registro Público - Folio");
        if (isEmpty(formData.registroPublico.fecha)) errors.push("Registro Público - Fecha");

        if (formData.accionistas.length === 0) errors.push("Accionistas (Al menos uno)");

        const totalPorcentaje = formData.accionistas.reduce((acc, curr) => acc + (parseFloat(curr.porcentaje) || 0), 0);
        if (Math.abs(totalPorcentaje - 100) > 0.01) {
            errors.push(`La suma de los porcentajes accionarios es ${totalPorcentaje.toFixed(2)}% (Debe ser 100%)`);
        }

        if (formData.representantes.length === 0) errors.push("Representantes (Al menos uno)");
        if (!formData.administracion || formData.administracion.length === 0) errors.push("Administración (Al menos uno)");

        if (formData.conlusion === 'Pendiente' || !formData.conlusion) errors.push("Conclusión - Favorable / No Favorable");
        if (isEmpty(formData.comentarios)) errors.push("Conclusión - Comentarios");

        // Validate IDs
        formData.documentacionPersonas.forEach(p => {
            if (p.identificacion_comp === 'SI' && !p.archivo_id) {
                errors.push(`Falta ID de ${p.nombre}`);
            }
        });

        return errors;
    };

    const handleDownloadPDF = async () => {
        const missingFields = validateForm();
        if (missingFields.length > 0) {
            showToast(`Faltan campos por llenar:\n${missingFields.join(', ')}`, "error");
            return;
        }

        const input = componentRef.current;
        if (!input) {
            showToast("No se encontró el contenido para generar el PDF.", "error");
            return;
        }

        try {
            // Wait for images/fonts if needed
            await document.fonts.ready;
            // Short delay to ensure images are rendered for html2canvas
            await new Promise(resolve => setTimeout(resolve, 500));

            // Using a higher scale for better resolution
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true, // If there are any external images
                logging: false,
                windowWidth: 1200 // Force a desktop-like rendering width
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate PDF dimensions (Letter)
            // Capture Header and Body Parts
            const headerElement = input.querySelector('#pdf-header');
            const bodyPart1Element = input.querySelector('#pdf-body-part1');
            const bodyPart2Element = input.querySelector('#pdf-body-part2');
            const bodyPart3Element = input.querySelector('#pdf-body-part3');
            const bodyPart4Element = input.querySelector('#pdf-body-part4');

            if (!headerElement || !bodyPart1Element || !bodyPart2Element || !bodyPart3Element || !bodyPart4Element) {
                showToast("Error al identificar secciones del PDF.", "error");
                return;
            }

            const headerCanvas = await html2canvas(headerElement, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
            const bodyPart1Canvas = await html2canvas(bodyPart1Element, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
            const bodyPart2Canvas = await html2canvas(bodyPart2Element, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
            const bodyPart3Canvas = await html2canvas(bodyPart3Element, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
            const bodyPart4Canvas = await html2canvas(bodyPart4Element, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });

            const headerImgData = headerCanvas.toDataURL('image/png');
            const bodyPart1ImgData = bodyPart1Canvas.toDataURL('image/png');
            const bodyPart2ImgData = bodyPart2Canvas.toDataURL('image/png');
            const bodyPart3ImgData = bodyPart3Canvas.toDataURL('image/png');
            const bodyPart4ImgData = bodyPart4Canvas.toDataURL('image/png');

            // Initialize PDF (Letter)
            const pdf = new jsPDF('p', 'mm', 'letter');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 215.9
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 279.4

            // Margins (mm)
            const marginTop = 10;
            const marginBottom = 14.1;
            const marginLeft = 10;
            const marginRight = 10;
            const headerFromEdge = 12.5;
            const footerFromEdge = 12.5;

            const contentWidth = pdfWidth - marginLeft - marginRight;

            // Calculate dimensions
            const headerProps = pdf.getImageProperties(headerImgData);
            const headerHeight = (headerProps.height * contentWidth) / headerProps.width;

            // Calculate heights for parts
            const bodyPart1Props = pdf.getImageProperties(bodyPart1ImgData);
            const bodyPart1Height = (bodyPart1Props.height * contentWidth) / bodyPart1Props.width;

            const bodyPart2Props = pdf.getImageProperties(bodyPart2ImgData);
            const bodyPart2Height = (bodyPart2Props.height * contentWidth) / bodyPart2Props.width;

            const bodyPart3Props = pdf.getImageProperties(bodyPart3ImgData); // Part 3
            const bodyPart3Height = (bodyPart3Props.height * contentWidth) / bodyPart3Props.width;

            const bodyPart4Props = pdf.getImageProperties(bodyPart4ImgData); // Part 4
            const bodyPart4Height = (bodyPart4Props.height * contentWidth) / bodyPart4Props.width;

            // Layout constants
            // Layout constants
            const footerHeight = 10;
            const bodyStartY = headerFromEdge + headerHeight + 5; // Start body 5mm below header
            const footerY = pdfHeight - footerFromEdge;
            const footerLineY = footerY - 5;
            // Ensure content stops BEFORE the footer line (plus some padding, e.g. 2mm)
            const bodyLimitY = footerLineY - 2;
            const contentHeightPerPage = bodyLimitY - bodyStartY;

            // Helper to add content pages
            let pageNum = 1;

            // We need to know total pages beforehand for "Page X of Y"
            // We need to know total pages beforehand for "Page X of Y"
            // Since we FORCE a new page for each part, each part takes at least 1 page of "space" in the sequence, 
            // unless we want blank pages to not count? But we add them. 
            // Better: logical pages. 
            // Part 1 starts P1.
            // Part 2 starts P2.
            // Part 3 starts P3.
            // Part 4 starts P4.
            // So minimum 4 pages.
            // If any part exceeds 1 page (content > contentHeightPerPage), we add more.

            const pagesP1 = Math.max(1, Math.ceil(bodyPart1Height / contentHeightPerPage));
            const pagesP2 = Math.max(1, Math.ceil(bodyPart2Height / contentHeightPerPage));
            const pagesP3 = Math.max(1, Math.ceil(bodyPart3Height / contentHeightPerPage));
            const pagesP4 = Math.max(1, Math.ceil(bodyPart4Height / contentHeightPerPage));
            const totalPages = pagesP1 + (pagesP2 - 1) + (pagesP3 - 1) + (pagesP4 - 1);
            // Wait, logic:
            // P1 starts at 1. If it needs 2 pages, it takes 1, 2. Next starts at 3.
            // Current code forces next part to "pdf.addPage()".
            // If P1 takes 1 page. We are at P1. addPage -> P2. Correct.
            // If P1 takes 2 pages. We are at P2. addPage -> P3. Correct.
            // So simply sum of pages needed is correct.

            const actualTotalPages = Math.ceil(bodyPart1Height / contentHeightPerPage) +
                Math.ceil(bodyPart2Height / contentHeightPerPage) +
                Math.ceil(bodyPart3Height / contentHeightPerPage) +
                Math.ceil(bodyPart4Height / contentHeightPerPage);

            // However, we force page breaks even if content is 0? 
            // If content is 0, ceil is 0. But we addPage(). So we use 1 page.
            // So we should use Math.max(1, ...) if we want to reflect the blank page.
            // But let's assume content is never 0 for now or blank pages are ok.
            // Let's stick effectively to:

            const calcPages = (h) => Math.max(1, Math.ceil(h / contentHeightPerPage));
            const totalPagesFixed = calcPages(bodyPart1Height) + calcPages(bodyPart2Height) + calcPages(bodyPart3Height) + calcPages(bodyPart4Height);


            // Helper to crop image from canvas/imgData
            const cropImage = (base64Image, cropY, cropHeight, originalWidth, originalHeight) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = originalWidth;
                        canvas.height = (cropHeight * originalWidth) / contentWidth; // Map PDF height back to pixels

                        const ctx = canvas.getContext('2d');

                        // Source Y in pixels
                        // position (cropY) is in PDF units (mm). originalHeight is in pixels.
                        // contentWidth is PDF units width.
                        // We need pixel ratio.
                        // pixelWidth = originalWidth. pdfWidth = contentWidth.
                        const ratio = originalWidth / contentWidth;

                        const sy = cropY * ratio;
                        const sHeight = cropHeight * ratio;

                        // Draw slice
                        ctx.drawImage(img, 0, sy, originalWidth, sHeight, 0, 0, originalWidth, sHeight);

                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.src = base64Image;
                });
            };

            const addContentSection = async (imgData, totalHeight, props) => {
                let heightLeft = totalHeight;
                let position = 0;

                // Ensure at least one loop run if forced page? 
                // No, if height is 0, we don't draw content, but we already added the page outside.
                // But we need to draw the footer!
                // If height is 0, loop doesn't run, footer not drawn on that blank page.

                if (heightLeft <= 0) {
                    // Draw footer on empty page
                    // Divider Line
                    pdf.setDrawColor(19, 91, 236);
                    pdf.setLineWidth(0.5);
                    pdf.line(marginLeft, footerLineY, pdfWidth - marginRight, footerLineY);

                    pdf.setFontSize(8);
                    pdf.setTextColor(150);
                    pdf.text(`Página ${pageNum} de ${totalPagesFixed}`, pdfWidth - marginRight, footerY, { align: 'right' });
                    return;
                }

                while (heightLeft > 0) {
                    // Add Header
                    pdf.addImage(headerImgData, 'PNG', marginLeft, headerFromEdge, contentWidth, headerHeight);

                    // Determine current slice height
                    const currentSliceHeight = Math.min(heightLeft, contentHeightPerPage);

                    // Crop the image slice
                    // position is the PDF-unit Y start position in the total content
                    const sliceImgData = await cropImage(imgData, position, currentSliceHeight, props.width, props.height);

                    // Add the slice
                    // contentRectY is where we want the TOP of the current slice to appear.
                    const contentRectY = bodyStartY;
                    pdf.addImage(sliceImgData, 'PNG', marginLeft, contentRectY, contentWidth, currentSliceHeight);

                    // Add Footer
                    // Divider Line
                    pdf.setDrawColor(19, 91, 236); // #135bec
                    pdf.setLineWidth(0.5);
                    pdf.line(marginLeft, footerLineY, pdfWidth - marginRight, footerLineY);

                    pdf.setFontSize(8);
                    pdf.setTextColor(150);
                    pdf.text(`Página ${pageNum} de ${totalPagesFixed}`, pdfWidth - marginRight, footerY, { align: 'right' });

                    heightLeft -= contentHeightPerPage;
                    position += contentHeightPerPage;

                    // If more content in this section OR if we have another section coming
                    if (heightLeft > 0) {
                        pdf.addPage();
                        pageNum++;
                    }
                }
            };

            // Add Part 1
            await addContentSection(bodyPart1ImgData, bodyPart1Height, bodyPart1Props);

            // Force new page for Part 2 (Representacion Legal)
            pdf.addPage();
            pageNum++;
            await addContentSection(bodyPart2ImgData, bodyPart2Height, bodyPart2Props);

            // Force new page for Part 3
            pdf.addPage();
            pageNum++;
            await addContentSection(bodyPart3ImgData, bodyPart3Height, bodyPart3Props);

            // Force new page for Part 4
            pdf.addPage();
            pageNum++;
            await addContentSection(bodyPart4ImgData, bodyPart4Height, bodyPart4Props);

            pdf.save(`Dictamen_${applicationName || 'Juridico'}.pdf`);

        } catch (error) {
            console.error("Error generando PDF:", error);
            showToast("Hubo un error al generar el PDF.", "error");
        }
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
            accionistas: [...(prev.accionistas || []), { nombre: '', acciones: 0, valor: 0, porcentaje: 0 }]
        }));
    };
    const updateAccionista = (index, field, value) => {
        setFormData(prev => {
            const newAccionistas = [...prev.accionistas];
            newAccionistas[index] = { ...newAccionistas[index], [field]: value };
            return { ...prev, accionistas: newAccionistas };
        });
    };
    const removeAccionista = (index) => {
        setFormData(prev => ({ ...prev, accionistas: prev.accionistas.filter((_, i) => i !== index) }));
    };

    // --- Handlers Representantes ---
    const addRepresentante = () => {
        setFormData(prev => {
            const newRep = {
                nombre: '', cargo: '', rfc: '', curp: '', idOficial: '',
                domicilio: '', poderes: '', escritura: '', fecha: '',
                fedatario: '', registro: '', volumen: ''
            };
            const newDoc = {
                nombre: '',
                rfc: '',
                curp: '',
                identificacion_comp: 'NO',
                comprobante_domicilio: 'NO',
                acta_matrimonio: 'NO'
            };
            return {
                ...prev,
                representantes: [...(prev.representantes || []), newRep],
                documentacionPersonas: [...(prev.documentacionPersonas || []), newDoc]
            };
        });
    };
    const updateRepresentante = (index, field, value) => {
        setFormData(prev => {
            const newReps = [...prev.representantes];
            newReps[index] = { ...newReps[index], [field]: value };

            // Sync with Documentation if relevant fields change
            const newDocs = [...prev.documentacionPersonas];
            if (newDocs[index]) {
                if (field === 'nombre') newDocs[index].nombre = value;
                if (field === 'rfc') newDocs[index].rfc = value;
                if (field === 'curp') newDocs[index].curp = value;
            }

            return { ...prev, representantes: newReps, documentacionPersonas: newDocs };
        });
    };
    const removeRepresentante = (index) => {
        setFormData(prev => ({
            ...prev,
            representantes: prev.representantes.filter((_, i) => i !== index),
            documentacionPersonas: prev.documentacionPersonas.filter((_, i) => i !== index)
        }));
    };

    const updateDocPersona = (index, field, value) => {
        setFormData(prev => {
            const newDocs = [...prev.documentacionPersonas];
            newDocs[index] = { ...newDocs[index], [field]: value };
            return { ...prev, documentacionPersonas: newDocs };
        });
    };

    const updateCompanyDoc = (field, value) => {
        setFormData(prev => ({
            ...prev,
            documentacion: { ...prev.documentacion, [field]: value }
        }));
    };

    const addEscritura = () => {
        setFormData(prev => ({
            ...prev,
            escrituras: [...prev.escrituras, { tipo: '', numero: '', fecha: '', fedatario: '', lugar: '', registro: '' }]
        }));
    };

    const updateEscritura = (index, field, value) => {
        const newEsc = [...formData.escrituras];
        newEsc[index][field] = value;
        setFormData(prev => ({ ...prev, escrituras: newEsc }));
    };

    const removeEscritura = (index) => {
        setFormData(prev => ({
            ...prev,
            escrituras: prev.escrituras.filter((_, i) => i !== index)
        }));
    };

    const addAdministracion = () => {
        setFormData(prev => ({
            ...prev,
            administracion: [...prev.administracion, { nombre: '', cargo: '', esSocio: '', porcentaje: '' }]
        }));
    };

    const updateAdministracion = (index, field, value) => {
        const newAdm = [...formData.administracion];
        newAdm[index][field] = value;
        setFormData(prev => ({ ...prev, administracion: newAdm }));
    };

    const removeAdministracion = (index) => {
        setFormData(prev => ({
            ...prev,
            administracion: prev.administracion.filter((_, i) => i !== index)
        }));
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

    // Helper para convertir string a formato YYYY-MM-DD para input[type=date]
    const toInputDate = (dateString) => {
        if (!dateString) return '';
        // If already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

        // Handle DD/MM/YY or DD/MM/YYYY
        // Example: 17/06/25 -> 2025-06-17
        const match = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (match) {
            let [_, day, month, year] = match;
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            if (year.length === 2) year = '20' + year; // Assume 20xx
            return `${year}-${month}-${day}`;
        }

        // Fallback
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return '';
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



                        <h3 className="font-bold text-slate-800 mt-4">Objetivo del Dictamen</h3>
                        <textarea
                            className={`w-full border rounded-lg p-3 text-sm mt-2 ${isEmpty(formData.objetivoDictamen) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            rows="4"
                            value={formData.objetivoDictamen}
                            onChange={(e) => handleChange(null, 'objetivoDictamen', e.target.value)}
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
                            <Input label="Fecha" type="date" value={toInputDate(formData.datosNotariales.fecha)} onChange={(e) => handleChange('datosNotariales', 'fecha', e.target.value)} error={isEmpty(formData.datosNotariales.fecha) ? " " : ""} />
                            <Input label="Notario" value={formData.datosNotariales.notario} onChange={(e) => handleChange('datosNotariales', 'notario', e.target.value)} error={isEmpty(formData.datosNotariales.notario) ? " " : ""} />
                            <Input label="Número Notaría" value={formData.datosNotariales.numero} onChange={(e) => handleChange('datosNotariales', 'numero', e.target.value)} error={isEmpty(formData.datosNotariales.numero) ? " " : ""} />
                            <Input label="Ciudad" value={formData.datosNotariales.ciudad} onChange={(e) => handleChange('datosNotariales', 'ciudad', e.target.value)} error={isEmpty(formData.datosNotariales.ciudad) ? " " : ""} />
                        </div>
                        <h3 className="font-bold text-slate-800 mt-4">Registro Público</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Folio Mercantil" value={formData.registroPublico.folio} onChange={(e) => handleChange('registroPublico', 'folio', e.target.value)} error={isEmpty(formData.registroPublico.folio) ? " " : ""} />
                            <Input
                                label="Lugar Registro"
                                value={formData.registroPublico.lugar}
                                onChange={(e) => handleChange('registroPublico', 'lugar', e.target.value)}
                            />
                            <Input
                                label="Fecha de Registro"
                                type="date"
                                value={toInputDate(formData.registroPublico.fecha)}
                                onChange={(e) => handleChange('registroPublico', 'fecha', e.target.value)}
                            />
                            <Input
                                label="Duración Sociedad"
                                value={formData.duracion}
                                onChange={(e) => handleChange(null, 'duracion', e.target.value)}
                                placeholder="Ej. 99 años"
                            />
                            <Input
                                label="Vigencia (Mesa Directiva / Poderes)"
                                value={formData.vigencia}
                                onChange={(e) => handleChange(null, 'vigencia', e.target.value)}
                                placeholder="Ej. Indefinida"
                            />
                        </div>

                    </FormSection>

                    <FormSection
                        title="3. Objeto Social"
                        isOpen={expandedSections['objetivo']}
                        onToggle={() => toggleSection('objetivo')}
                        hasError={isEmpty(formData.objetivo)}
                    >
                        <h3 className="font-bold text-slate-800">Objeto Social Principal</h3>
                        <textarea
                            className={`w-full border rounded-lg p-3 text-sm mt-2 ${isEmpty(formData.objetivo) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            rows="6"
                            value={formData.objetivo}
                            onChange={(e) => handleChange(null, 'objetivo', e.target.value)}
                            placeholder="Descripción del objetivo..."
                        />

                        <h3 className="font-bold text-slate-800 mt-4 mb-2">Objeto Social Detallado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-3 bg-slate-50 rounded border ${isEmpty(formData.objetoSocial?.titulosCredito) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                                <label className={`text-xs font-bold uppercase block mb-1 ${isEmpty(formData.objetoSocial?.titulosCredito) ? 'text-red-700' : 'text-slate-500'}`}>Facultad para Títulos de Crédito</label>
                                <textarea
                                    className="w-full bg-transparent text-sm border-none p-0 focus:ring-0 resize-none"
                                    rows="3"
                                    value={formData.objetoSocial?.titulosCredito || ''}
                                    onChange={(e) => handleChange('objetoSocial', 'titulosCredito', e.target.value)}
                                    placeholder="No especificado"
                                />
                            </div>
                            <div className={`p-3 bg-slate-50 rounded border ${isEmpty(formData.objetoSocial?.arrendamiento) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                                <label className={`text-xs font-bold uppercase block mb-1 ${isEmpty(formData.objetoSocial?.arrendamiento) ? 'text-red-700' : 'text-slate-500'}`}>Facultad para Arrendamiento</label>
                                <textarea
                                    className="w-full bg-transparent text-sm border-none p-0 focus:ring-0 resize-none"
                                    rows="3"
                                    value={formData.objetoSocial?.arrendamiento || ''}
                                    onChange={(e) => handleChange('objetoSocial', 'arrendamiento', e.target.value)}
                                    placeholder="No especificado"
                                />
                            </div>
                            <div className={`p-3 bg-slate-50 rounded border ${isEmpty(formData.objetoSocial?.factoraje) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                                <label className={`text-xs font-bold uppercase block mb-1 ${isEmpty(formData.objetoSocial?.factoraje) ? 'text-red-700' : 'text-slate-500'}`}>Facultad para Factoraje</label>
                                <textarea
                                    className="w-full bg-transparent text-sm border-none p-0 focus:ring-0 resize-none"
                                    rows="3"
                                    value={formData.objetoSocial?.factoraje || ''}
                                    onChange={(e) => handleChange('objetoSocial', 'factoraje', e.target.value)}
                                    placeholder="No especificado"
                                />
                            </div>
                            <div className={`p-3 bg-slate-50 rounded border ${isEmpty(formData.objetoSocial?.otros) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                                <label className={`text-xs font-bold uppercase block mb-1 ${isEmpty(formData.objetoSocial?.otros) ? 'text-red-700' : 'text-slate-500'}`}>Otros Objetos Sociales</label>
                                <textarea
                                    className="w-full bg-transparent text-sm border-none p-0 focus:ring-0 resize-none"
                                    rows="3"
                                    value={formData.objetoSocial?.otros || ''}
                                    onChange={(e) => handleChange('objetoSocial', 'otros', e.target.value)}
                                    placeholder="No especificado"
                                />
                            </div>
                        </div>


                    </FormSection>

                    <FormSection
                        title="4. Datos Inscritos ante el SAT"
                        isOpen={expandedSections['datosSat']}
                        onToggle={() => toggleSection('datosSat')}
                        hasError={isEmpty(formData.rfc) || isEmpty(formData.domicilio) || isEmpty(formData.actividadEconomica)}
                    >
                        <h3 className="font-bold text-slate-800 mb-2">Información Fiscal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="RFC"
                                value={formData.rfc}
                                onChange={(e) => handleChange(null, 'rfc', e.target.value)}
                                placeholder="RFC de la empresa"
                                error={isEmpty(formData.rfc) ? " " : ""}
                            />
                            <Input
                                label="Actividad Económica"
                                value={formData.actividadEconomica}
                                onChange={(e) => handleChange(null, 'actividadEconomica', e.target.value)}
                                placeholder="Actividad preponderante"
                                error={isEmpty(formData.actividadEconomica) ? " " : ""}
                            />
                            <Input
                                label="Domicilio Fiscal"
                                value={formData.domicilio}
                                onChange={(e) => handleChange(null, 'domicilio', e.target.value)}
                                className="col-span-2"
                                error={isEmpty(formData.domicilio) ? " " : ""}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="5. Accionistas"
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
                                <div className="w-24"><Input label="Valor ($)" type="number" value={ax.valor} onChange={(e) => updateAccionista(idx, 'valor', e.target.value)} placeholder="0.00" /></div>
                                <div className="w-20"><Input label="%" type="number" value={ax.porcentaje} onChange={(e) => updateAccionista(idx, 'porcentaje', e.target.value)} error={!ax.porcentaje ? " " : ""} /></div>
                                <button onClick={() => removeAccionista(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded mb-1"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        {(!formData.accionistas || formData.accionistas.length === 0) && <p className="text-red-500 italic text-sm text-center py-4 border border-dashed border-red-300 rounded bg-red-50">No hay accionistas registrados</p>}
                    </FormSection>

                    <FormSection
                        title="6. Representantes"
                        isOpen={expandedSections['representantes']}
                        onToggle={() => toggleSection('representantes')}
                        hasError={formData.representantes.length === 0 || formData.representantes.some(r => isObjEmpty(r))}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-800">Representantes Legales</h3>
                            <button onClick={addRepresentante} className="text-[#135bec] text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        {formData.representantes.map((rep, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded mb-4 border relative">
                                <button onClick={() => removeRepresentante(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                    <Trash2 size={16} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <Input label="Nombre" value={rep.nombre} onChange={(e) => updateRepresentante(i, 'nombre', e.target.value)} error={!rep.nombre ? " " : ""} />
                                    <Input label="Cargo" value={rep.cargo} onChange={(e) => updateRepresentante(i, 'cargo', e.target.value)} error={!rep.cargo ? " " : ""} />
                                    <Input label="RFC" value={rep.rfc} onChange={(e) => updateRepresentante(i, 'rfc', e.target.value)} error={!rep.rfc ? " " : ""} />
                                    <Input label="CURP" value={rep.curp} onChange={(e) => updateRepresentante(i, 'curp', e.target.value)} error={!rep.curp ? " " : ""} />
                                    <Input label="ID Oficial (No.)" value={rep.idOficial} onChange={(e) => updateRepresentante(i, 'idOficial', e.target.value)} error={!rep.idOficial ? " " : ""} />
                                    <Input label="Domicilio Completo" value={rep.domicilio} onChange={(e) => updateRepresentante(i, 'domicilio', e.target.value)} className="md:col-span-2" error={!rep.domicilio ? " " : ""} />
                                </div>
                                <div className="border-t border-slate-200 pt-3 mt-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Datos del Poder (Escritura)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <Input label="Escritura No." value={rep.escritura} onChange={(e) => updateRepresentante(i, 'escritura', e.target.value)} error={!rep.escritura ? " " : ""} />
                                        <Input label="Volumen" value={rep.volumen} onChange={(e) => updateRepresentante(i, 'volumen', e.target.value)} error={!rep.volumen ? " " : ""} />
                                        <Input label="Fecha" value={rep.fecha} onChange={(e) => updateRepresentante(i, 'fecha', e.target.value)} error={!rep.fecha ? " " : ""} />
                                        <Input label="Fedatario" value={rep.fedatario} onChange={(e) => updateRepresentante(i, 'fedatario', e.target.value)} error={!rep.fedatario ? " " : ""} />
                                        <Input label="Registro Público" value={rep.registro} onChange={(e) => updateRepresentante(i, 'registro', e.target.value)} className="md:col-span-2" error={!rep.registro ? " " : ""} />
                                    </div>
                                    <div className="mt-3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Poderes Otorgados</label>
                                        <textarea
                                            className={`w-full bg-white border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${isEmpty(rep.poderes) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                                            rows="2"
                                            value={rep.poderes}
                                            onChange={(e) => updateRepresentante(i, 'poderes', e.target.value)}
                                            placeholder="Ej. Actos de Dominio, Administración..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {formData.representantes.length === 0 && <p className="text-red-500 italic text-sm border border-dashed border-red-300 p-2 rounded bg-red-50 text-center">Sin representantes registrados.</p>}
                    </FormSection>

                    <FormSection
                        title="7. Observaciones"
                        isOpen={expandedSections['observaciones']}
                        onToggle={() => toggleSection('observaciones')}
                        hasError={isEmpty(formData.observacionesSociedad) || isEmpty(formData.observacionesRepresentante)}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">DE LA SOCIEDAD</label>
                                <textarea
                                    className={`w-full bg-white border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${isEmpty(formData.observacionesSociedad) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                                    rows="3"
                                    value={formData.observacionesSociedad}
                                    onChange={(e) => setFormData(prev => ({ ...prev, observacionesSociedad: e.target.value }))}
                                    placeholder="Ingrese observaciones referentes a la sociedad..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">DEL REPRESENTANTE LEGAL</label>
                                <textarea
                                    className={`w-full bg-white border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${isEmpty(formData.observacionesRepresentante) ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
                                    rows="3"
                                    value={formData.observacionesRepresentante}
                                    onChange={(e) => setFormData(prev => ({ ...prev, observacionesRepresentante: e.target.value }))}
                                    placeholder="Ingrese observaciones referentes al representante legal..."
                                />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection
                        title="8. Cuestionamientos"
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
                        title="9. Documentación"
                        isOpen={expandedSections['documentacion']}
                        onToggle={() => toggleSection('documentacion')}
                        hasError={isObjEmpty(formData.documentacion)}
                    >
                        <h3 className="font-bold text-slate-800 mb-2">Checklist Documental</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2">Denominación Social</th>
                                        <th className="px-3 py-2 text-center">Comp. Domicilio</th>
                                        <th className="px-3 py-2 text-center">Acta Const.</th>
                                        <th className="px-3 py-2 text-center">RPP Acta</th>
                                        <th className="px-3 py-2 text-center">Otras Esc.</th>
                                        <th className="px-3 py-2 text-center">RPP Otras</th>
                                        <th className="px-3 py-2 text-center">RFC / Constancia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-3 py-2 font-bold text-slate-900">
                                            {formData.documentacion.denominacion || formData.denominacion || 'NO ESPECIFICADO'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                value={formData.documentacion.comprobante_domicilio}
                                                onChange={(e) => updateCompanyDoc('comprobante_domicilio', e.target.value)}
                                                className={`border rounded px-1 py-0.5 ${isEmpty(formData.documentacion.comprobante_domicilio) ? 'border-red-500 ring-1 ring-red-500' : formData.documentacion.comprobante_domicilio === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                            >
                                                <option value="">--</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                                <option value="NA">N/A</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                value={formData.documentacion.acta_constitutiva}
                                                onChange={(e) => updateCompanyDoc('acta_constitutiva', e.target.value)}
                                                className={`border rounded px-1 py-0.5 ${isEmpty(formData.documentacion.acta_constitutiva) ? 'border-red-500 ring-1 ring-red-500' : formData.documentacion.acta_constitutiva === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                            >
                                                <option value="">--</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                                <option value="NA">N/A</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                value={formData.documentacion.rpp_acta_constitutiva}
                                                onChange={(e) => updateCompanyDoc('rpp_acta_constitutiva', e.target.value)}
                                                className={`border rounded px-1 py-0.5 ${isEmpty(formData.documentacion.rpp_acta_constitutiva) ? 'border-red-500 ring-1 ring-red-500' : formData.documentacion.rpp_acta_constitutiva === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                            >
                                                <option value="">--</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                                <option value="NA">N/A</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                value={formData.documentacion.otras_escrituras}
                                                onChange={(e) => updateCompanyDoc('otras_escrituras', e.target.value)}
                                                className={`border rounded px-1 py-0.5 ${isEmpty(formData.documentacion.otras_escrituras) ? 'border-red-500 ring-1 ring-red-500' : formData.documentacion.otras_escrituras === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                            >
                                                <option value="">--</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                                <option value="NA">N/A</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                value={formData.documentacion.rpp_otras_escrituras}
                                                onChange={(e) => updateCompanyDoc('rpp_otras_escrituras', e.target.value)}
                                                className={`border rounded px-1 py-0.5 ${isEmpty(formData.documentacion.rpp_otras_escrituras) ? 'border-red-500 ring-1 ring-red-500' : formData.documentacion.rpp_otras_escrituras === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                            >
                                                <option value="">--</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                                <option value="NA">N/A</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select
                                                value={formData.documentacion.rfc_situacion_fiscal}
                                                onChange={(e) => updateCompanyDoc('rfc_situacion_fiscal', e.target.value)}
                                                className={`border rounded px-1 py-0.5 ${isEmpty(formData.documentacion.rfc_situacion_fiscal) ? 'border-red-500 ring-1 ring-red-500' : formData.documentacion.rfc_situacion_fiscal === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                            >
                                                <option value="">--</option>
                                                <option value="SI">SI</option>
                                                <option value="NO">NO</option>
                                                <option value="NA">N/A</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </FormSection>

                    <FormSection
                        title="10. Doc. Personas"
                        isOpen={expandedSections['documentacion_personas']}
                        onToggle={() => toggleSection('documentacion_personas')}
                        hasError={formData.documentacionPersonas.length === 0 || formData.documentacionPersonas.some(p => p.identificacion_comp === 'SI' && !p.archivo_id)}
                    >
                        <h3 className="font-bold text-slate-800 mt-6 mb-2">Documentación Personas</h3>
                        {formData.documentacionPersonas.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-3 py-2">Nombre</th>
                                            <th className="px-3 py-2 text-center">ID Oficial</th>
                                            <th className="px-3 py-2 text-center">Comp. Domicilio</th>
                                            <th className="px-3 py-2 text-center">Acta Matrimonio</th>
                                            <th className="px-3 py-2 text-center">Const. Fiscal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.documentacionPersonas.map((p, i) => (
                                            <tr key={i} className={`border-b ${(!p.archivo_id && p.identificacion_comp === 'SI') ? 'bg-red-50 border-red-300' : 'bg-white hover:bg-slate-50'}`}>
                                                <td className="px-3 py-2 font-medium text-slate-900">
                                                    {p.nombre || '-'}
                                                    <div className="text-[10px] text-slate-400">{p.rfc}</div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <select
                                                            value={p.identificacion_comp}
                                                            onChange={(e) => updateDocPersona(i, 'identificacion_comp', e.target.value)}
                                                            className={`border rounded px-1 py-0.5 w-full text-center ${p.identificacion_comp === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                                        >
                                                            <option value="SI">SI</option>
                                                            <option value="NO">NO</option>
                                                            <option value="NA">N/A</option>
                                                        </select>
                                                        <div className="relative w-full">
                                                            <input
                                                                type="file"
                                                                id={`file-id-${i}`}
                                                                accept="image/png, image/jpeg, image/jpg"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const newDocs = [...formData.documentacionPersonas];
                                                                        newDocs[i].archivo_id = file;
                                                                        newDocs[i].archivo_url = URL.createObjectURL(file); // Create URL for preview/PDF
                                                                        newDocs[i].identificacion_comp = 'SI';
                                                                        setFormData(prev => ({ ...prev, documentacionPersonas: newDocs }));
                                                                    }
                                                                }}
                                                            />
                                                            <div className="flex items-center gap-1">
                                                                <label
                                                                    htmlFor={`file-id-${i}`}
                                                                    className={`cursor-pointer text-[10px] w-full block text-center py-1 rounded border truncate ${p.archivo_id ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 hover:bg-red-100 text-red-500 border-red-300'}`}
                                                                    title={p.archivo_id ? p.archivo_id.name : "Cargar Archivo"}
                                                                >
                                                                    {p.archivo_id ? 'Archivo Cargado' : 'Cargar ID'}
                                                                </label>
                                                                {p.archivo_id && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const newDocs = [...formData.documentacionPersonas];
                                                                            if (newDocs[i].archivo_url) {
                                                                                URL.revokeObjectURL(newDocs[i].archivo_url);
                                                                            }
                                                                            newDocs[i].archivo_id = null;
                                                                            newDocs[i].archivo_url = null;
                                                                            newDocs[i].identificacion_comp = 'NO';
                                                                            setFormData(prev => ({ ...prev, documentacionPersonas: newDocs }));
                                                                        }}
                                                                        className="text-red-500 hover:bg-red-50 p-1 rounded border border-transparent hover:border-red-200"
                                                                        title="Eliminar imagen"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="text-[8px] text-slate-400 text-center mt-0.5">JPG, PNG (Max 5MB)</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <select
                                                        value={p.comprobante_domicilio}
                                                        onChange={(e) => updateDocPersona(i, 'comprobante_domicilio', e.target.value)}
                                                        className={`border rounded px-1 py-0.5 ${p.comprobante_domicilio === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                                    >
                                                        <option value="SI">SI</option>
                                                        <option value="NO">NO</option>
                                                        <option value="NA">N/A</option>
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <select
                                                        value={p.acta_matrimonio}
                                                        onChange={(e) => updateDocPersona(i, 'acta_matrimonio', e.target.value)}
                                                        className={`border rounded px-1 py-0.5 ${p.acta_matrimonio === 'SI' ? 'text-green-600 font-bold' : 'text-slate-500'}`}
                                                    >
                                                        <option value="SI">SI</option>
                                                        <option value="NO">NO</option>
                                                        <option value="NA">N/A</option>
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {/* Using RFC presence as proxy for tax doc presence, but editable */}
                                                    <span className={p.rfc ? "text-green-600 font-bold" : "text-red-400"}>{p.rfc ? 'SI' : 'NO'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-red-500 italic text-sm py-2">Sin documentación de personas (Agregue Representantes primero)</p>
                        )}
                    </FormSection>

                    <FormSection
                        title="11. Identificación de la Administración"
                        isOpen={expandedSections['administracion']}
                        onToggle={() => toggleSection('administracion')}
                        hasError={formData.administracion.length === 0}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-800">Administración de la Sociedad</h3>
                            <button onClick={addAdministracion} className="text-[#135bec] text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        {formData.administracion.map((adm, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded mb-2 border">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-5">
                                        <Input
                                            label="Nombre"
                                            value={adm.nombre}
                                            onChange={(e) => updateAdministracion(i, 'nombre', e.target.value)}
                                            className={!adm.nombre ? 'border-red-300 bg-red-50' : ''}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            label="Cargo"
                                            value={adm.cargo}
                                            onChange={(e) => updateAdministracion(i, 'cargo', e.target.value)}
                                            className={!adm.cargo ? 'border-red-300 bg-red-50' : ''}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">¿Es Socio?</label>
                                        <select
                                            value={adm.esSocio}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateAdministracion(i, 'esSocio', val);
                                                if (val === 'NO') updateAdministracion(i, 'porcentaje', 'N/A');
                                                else if (adm.porcentaje === 'N/A') updateAdministracion(i, 'porcentaje', '');
                                            }}
                                            className={`w-full border rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${!adm.esSocio ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                        >
                                            <option value="">--</option>
                                            <option value="SI">SI</option>
                                            <option value="NO">NO</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="% Accionario"
                                            value={adm.porcentaje}
                                            onChange={(e) => updateAdministracion(i, 'porcentaje', e.target.value)}
                                            placeholder="Ej. 50%"
                                            disabled={adm.esSocio === 'NO'}
                                            className={adm.esSocio === 'SI' && !adm.porcentaje ? 'border-red-300 bg-red-50' : ''}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <button onClick={() => removeAdministracion(i)} className="text-red-500 hover:bg-red-50 p-1 rounded flex items-center gap-1 text-xs">
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                        {formData.administracion.length === 0 && <p className="text-slate-400 italic text-sm text-center py-4 border border-dashed rounded">No hay miembros de administración registrados</p>}
                    </FormSection>

                    <FormSection
                        title="12. Escrituras"
                        isOpen={expandedSections['escrituras']}
                        onToggle={() => toggleSection('escrituras')}
                        hasError={formData.escrituras.length === 0}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-800">Reformas y Otras Escrituras</h3>
                            <button onClick={addEscritura} className="text-[#135bec] text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        {formData.escrituras.map((esc, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded mb-2 border">
                                <div className="grid grid-cols-6 gap-2 mb-2">
                                    <div className="col-span-2"><Input label="Tipo Escritura" value={esc.tipo} onChange={(e) => updateEscritura(i, 'tipo', e.target.value)} placeholder="Ej. Aumento Capital" className={!esc.tipo ? 'border-red-300 bg-red-50' : ''} /></div>
                                    <div><Input label="Número" value={esc.numero} onChange={(e) => updateEscritura(i, 'numero', e.target.value)} className={!esc.numero ? 'border-red-300 bg-red-50' : ''} /></div>
                                    <div><Input type="date" label="Fecha" value={toInputDate(esc.fecha)} onChange={(e) => updateEscritura(i, 'fecha', e.target.value)} className={!esc.fecha ? 'border-red-300 bg-red-50' : ''} /></div>
                                    <div className="col-span-2"><Input label="Fedatario Público" value={esc.fedatario} onChange={(e) => updateEscritura(i, 'fedatario', e.target.value)} className={!esc.fedatario ? 'border-red-300 bg-red-50' : ''} /></div>
                                </div>
                                <div className="grid grid-cols-6 gap-2 items-end">
                                    <div className="col-span-2"><Input label="Lugar" value={esc.lugar} onChange={(e) => updateEscritura(i, 'lugar', e.target.value)} className={!esc.lugar ? 'border-red-300 bg-red-50' : ''} /></div>
                                    <div className="col-span-3"><Input label="Datos Registro Público" value={esc.registro} onChange={(e) => updateEscritura(i, 'registro', e.target.value)} className={!esc.registro ? 'border-red-300 bg-red-50' : ''} /></div>
                                    <div className="flex justify-end mb-1">
                                        <button onClick={() => removeEscritura(i)} className="text-red-500 hover:bg-red-50 p-2 rounded flex items-center gap-1 text-xs">
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {formData.escrituras.length === 0 && <p className="text-slate-400 italic text-sm text-center py-4 border border-dashed rounded">No hay escrituras adicionales registradas</p>}
                    </FormSection>

                    <FormSection
                        title="13. Conclusión"
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

            {/* Hidden Print Component - Capturing Area */}
            {/* Added fixed width to ensure consistent render for html2canvas regardless of screen size */}
            <div style={{ position: "absolute", top: "-10000px", left: "-10000px", width: "1000px" }}>
                <DictamenPDF ref={componentRef} data={formData} applicationName={applicationName} />
            </div>

        </div >
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
                            <Button variant="outline" onClick={handleDownloadCSV} icon={FileText}>Descargar CSV</Button>
                            <Button variant="outline" onClick={handleDownloadPDF} icon={Printer}>Imprimir PDF</Button>
                            <Button icon={Save} onClick={() => showToast("Guardado correctamente", "success")}>Guardar</Button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {renderContent()}
                </div>
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
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
                    <div className="flex gap-2">
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button variant="outline" icon={Save}>Cargar CSV</Button>
                            </div>
                            <Button variant="outline" onClick={handleDownloadCSV} icon={FileText}>Descargar CSV</Button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadPDF} icon={Printer}>
                            Imprimir PDF
                        </Button>
                        <Button icon={Save} onClick={() => showToast("Guardado correctamente", "success")}>Guardar Cambios</Button>
                    </div>
                </div>
            }
        >
            {renderContent()}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
            />
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
