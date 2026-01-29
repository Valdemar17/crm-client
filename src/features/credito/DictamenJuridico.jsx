import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Plus, Trash2, ChevronDown, ChevronRight, ChevronLeft, RefreshCw, Save, Search, Filter, MoreVertical, FileText, Upload, Download } from 'lucide-react';
import './DictamenJuridico.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../assets/sofimas-logo.png';

// Mock Data for List View
const mockRequests = [
  { id: 1, folio: '#CR-2023-001', cliente: 'Transportes del Norte S.A.', producto: 'Arrendamiento', monto: '$1,500,000', estatus: 'En Proceso', etapa: 'Dictamen Jurídico', statusClass: 'bg-amber-100 text-amber-800' },
  { id: 2, folio: '#CR-2023-002', cliente: 'Juan Pérez Martínez', producto: 'Crédito Simple', monto: '$350,000', estatus: 'Análisis', etapa: 'Recopilación de Documentos', statusClass: 'bg-blue-100 text-blue-800' },
  { id: 3, folio: '#CR-2023-003', cliente: 'Constructora del Valle', producto: 'Crédito Simple', monto: '$2,800,000', estatus: 'Aprobado', etapa: 'Formalización', statusClass: 'bg-emerald-100 text-emerald-800' },
  { id: 4, folio: '#CR-2023-004', cliente: 'Servicios Logísticos Express', producto: 'Arrendamiento', monto: '$950,000', estatus: 'Revision', etapa: 'Dictamen Jurídico', statusClass: 'bg-purple-100 text-purple-800' },
];

const AVAILABLE_SIGNERS = [
  'Lic. Andrea Lourdes Felix Felix',
  'Lic. Juan Pérez Martínez',
  'Lic. María González López'
];

const FIXED_COMPANY = 'SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR';

const formatLongDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00'); // Prevent timezone shift
  const day = date.getDate();
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
};

const emptyFormData = {
  fechaDocumento: new Date().toISOString().split('T')[0],
  denominacion: '', objetivo: '',
  ant_escritura: '', ant_volumen: '', ant_fecha: '', ant_fedatario: '', ant_num_fedatario: '',
  ant_circunscripcion: '', ant_registro: '', ant_fecha_reg: '', ant_lugar_reg: '',
  ant_duracion: '', ant_vigencia: '', ant_domicilio: '',
  obj_titulos: '', obj_arrendamiento: '', obj_factoraje: '', obj_otros: '', obj_descripcion: '',
  sat_rfc: '', sat_domicilio: '', sat_actividad: '',
  obs_sociedad: '', obs_rep_legal: '',
  conclusion: '', 
  lugar_fecha_firma: '', // Legacy/Computed
  empresa_firma: FIXED_COMPANY, 
  nombre_firmante: '',
  q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '', q12: '', q13: '',
  doc_comp_dom: '', doc_acta_const: '', doc_rpp_acta: '', 
  doc_otras_esc: '', doc_rpp_otras: '', doc_rfc_const: ''
};

const initialFormData = {
    fechaDocumento: new Date().toISOString().split('T')[0],
    denominacion: 'DESARROLLADORA PAGA-INMAE, S.A. DE C.V.',
    objetivo: 'Dictaminar si la sociedad cumple con los requisitos...',
    
    // Antecedentes
    ant_escritura: '43,321', ant_volumen: '513', ant_fecha: '11 de enero de 2018',
    ant_fedatario: 'Salvador Antonio Corral Martínez', ant_num_fedatario: 'Notario Público no. 28',
    ant_circunscripcion: 'Hermosillo, Sonora', ant_registro: 'N-201800428 SECCION COMERCIO',
    ant_fecha_reg: '18 de enero de 2018', ant_lugar_reg: 'Hermosillo, Sonora',
    ant_duracion: 'Indefinida', ant_vigencia: 'Indefinida', ant_domicilio: 'Hermosillo, Sonora',

    // Objeto Social
    obj_titulos: 'Fracción Cuarta, punto 22. De sus estatutos sociales.',
    obj_arrendamiento: 'Fracción Cuarta, punto 23. De sus estatutos sociales.',
    obj_factoraje: 'Fracción Cuarta, punto 15. De sus estatutos sociales.',
    obj_otros: 'Fracción Cuarta, todos los puntos de sus estatutos sociales.',
    obj_descripcion: 'La realización de todo tipo de construcciones...',
    
    // SAT
    sat_rfc: 'SSD090123RU5', sat_domicilio: 'Calle Comonfort numero 74...', sat_actividad: 'Construcción de vivienda unifamiliar...',

    // Observaciones
    obs_sociedad: 'Se gestiona a través de un Consejo...',
    obs_rep_legal: 'Los miembros del Consejo...',

    // Conclusion
    conclusion: 'DICTAMEN FAVORABLE',
    lugar_fecha_firma: '', // Will be computed
    empresa_firma: FIXED_COMPANY,
    nombre_firmante: '',

    // Cuestionamientos (1-13)
    q1: '', q2: '', q3: '', q4: '', q5: '', 
    q6: '', q7: '', q8: '', q9: '', q10: '',
    q11: '', q12: '', q13: '',

    // Doc Checklist
    doc_comp_dom: '', doc_acta_const: '', doc_rpp_acta: '', 
    doc_otras_esc: '', doc_rpp_otras: '', doc_rfc_const: ''
};

// Initial State Helpers
const initialShareholder = { id: 1, name: '', acciones: '', valor: '', porcentaje: '' };
const initialRep = { id: 1, name: '', cargo: '', rfc: '', id_oficial: '', curp: '', domicilio: '', escritura: '', fecha: '', volumen: '', fedatario: '', registro: '', fecha_registro: '' }; // Empty Rep
const initialDocPerson = { id: 1, name: '', sujeto: '', identificacion: '', curp: '', rfc: '', comp_dom: '', acta_mat: '' };
const initialAdmin = { id: 1, name: '', cargo: '', es_socio: 'no', porcentaje: 'N/A' };
const initialDeed = { id: 1, tipo: '', numero: '', fecha: '', fedatario: '', lugar: '', registro: '' };

export default function DictamenJuridico({ onBack }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [currentSheet, setCurrentSheet] = useState(1);
  const totalSheets = 4;

  const nextSheet = () => setCurrentSheet(prev => Math.min(prev + 1, totalSheets));
  const prevSheet = () => setCurrentSheet(prev => Math.max(prev - 1, 1));
  
  // State for collapsible sections
  const [sections, setSections] = useState({
    denominacion: false,
    objetivo: false, // New separate section
    antecedentes: false,
    accionistas: false,
    objeto: false, // This is III. Objeto Social y SAT
    representacion: false,
    observaciones: false,
    cuestionamientos: false,
    documentacion: false,
    administracion: false,
    escrituras: false,
    conclusion: false
  });

  const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Form Data State
  const [formData, setFormData] = useState({
    fechaDocumento: new Date().toISOString().split('T')[0],
    denominacion: 'DESARROLLADORA PAGA-INMAE, S.A. DE C.V.',
    objetivo: 'Dictaminar si la sociedad cumple con los requisitos...',
    
    // Antecedentes
    ant_escritura: '43,321', ant_volumen: '513', ant_fecha: '11 de enero de 2018',
    ant_fedatario: 'Salvador Antonio Corral Martínez', ant_num_fedatario: 'Notario Público no. 28',
    ant_circunscripcion: 'Hermosillo, Sonora', ant_registro: 'N-201800428 SECCION COMERCIO',
    ant_fecha_reg: '18 de enero de 2018', ant_lugar_reg: 'Hermosillo, Sonora',
    ant_duracion: 'Indefinida', ant_vigencia: 'Indefinida', ant_domicilio: 'Hermosillo, Sonora',

    // Objeto Social
    obj_titulos: 'Fracción Cuarta, punto 22. De sus estatutos sociales.',
    obj_arrendamiento: 'Fracción Cuarta, punto 23. De sus estatutos sociales.',
    obj_factoraje: 'Fracción Cuarta, punto 15. De sus estatutos sociales.',
    obj_otros: 'Fracción Cuarta, todos los puntos de sus estatutos sociales.',
    obj_descripcion: 'La realización de todo tipo de construcciones...',
    
    // SAT
    sat_rfc: 'SSD090123RU5', sat_domicilio: 'Calle Comonfort numero 74...', sat_actividad: 'Construcción de vivienda unifamiliar...',

    // Observaciones
    obs_sociedad: 'Se gestiona a través de un Consejo...',
    obs_rep_legal: 'Los miembros del Consejo...',

    // Conclusion
    conclusion: 'DICTAMEN FAVORABLE',
    lugar_fecha_firma: 'Hermosillo, Sonora a 14 de enero de 2024',
    empresa_firma: 'SOFIMAS Consultores del Noroeste, S.A. de C.V., SOFOM, ENR',
    nombre_firmante: 'Lic. Andrea Lourdes Felix Felix',

    // Cuestionamientos (1-13)
    q1: '', q2: '', q3: '', q4: '', q5: '', 
    q6: '', q7: '', q8: '', q9: '', q10: '',
    q11: '', q12: '', q13: '',

    // Doc Checklist
    doc_comp_dom: 'SI', doc_acta_const: 'SI', doc_rpp_acta: 'SI', 
    doc_otras_esc: 'SI', doc_rpp_otras: 'SI', doc_rfc_const: 'SI'
  });

  // Dynamic Lists State
  const [shareholders, setShareholders] = useState([initialShareholder]);
  const [reps, setReps] = useState([initialRep]);
  const [docPersons, setDocPersons] = useState([initialDocPerson]);
  const [admins, setAdmins] = useState([initialAdmin]);
  const [deeds, setDeeds] = useState([initialDeed]);

  // Validation Helpers
  const isInvalid = (val) => !val || (typeof val === 'string' && val.trim() === '');
  const getInputClass = (val) => `dictamen-input ${isInvalid(val) ? 'border-red-400 bg-red-50' : ''}`;
  const getTextareaClass = (val) => `dictamen-textarea ${isInvalid(val) ? 'border-red-400 bg-red-50' : ''}`;
  const getSelectClass = (val) => `dictamen-select ${isInvalid(val) ? 'border-red-400 bg-red-50' : ''}`;
  const getSmallSelectClass = (val) => `border rounded text-xs p-1 ${isInvalid(val) ? 'border-red-400 bg-red-50' : 'border-slate-300'}`;

  const checkSection = (keys) => keys.some(k => isInvalid(formData[k]));
  
  // Section Validity State
  const sectionInvalid = {
      denominacion: checkSection(['fechaDocumento', 'denominacion']),
      objetivo: checkSection(['objetivo']),
      antecedentes: checkSection(['ant_escritura', 'ant_fecha', 'ant_fedatario', 'ant_num_fedatario', 'ant_registro', 'ant_fecha_reg', 'ant_lugar_reg', 'ant_duracion', 'ant_vigencia', 'ant_domicilio']),
      accionistas: shareholders.some(s => isInvalid(s.name) || isInvalid(s.acciones) || isInvalid(s.valor) || isInvalid(s.porcentaje)),
      objeto: checkSection(['obj_titulos', 'obj_arrendamiento', 'obj_factoraje', 'obj_otros', 'obj_descripcion', 'sat_rfc', 'sat_domicilio', 'sat_actividad']),
      representacion: reps.some(r => isInvalid(r.name) || isInvalid(r.cargo) || isInvalid(r.escritura) || isInvalid(r.id_oficial) || isInvalid(r.domicilio) || isInvalid(r.fecha) || isInvalid(r.fedatario)),
      observaciones: checkSection(['obs_sociedad', 'obs_rep_legal']),
      cuestionamientos: checkSection(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13']),
      documentacion: checkSection(['doc_comp_dom', 'doc_acta_const']) || docPersons.some(p => isInvalid(p.name) || isInvalid(p.identificacion)),
      administracion: false, // Added missing key to prevent potential undefined issues
      escrituras: deeds.length > 0 && deeds.some(d => isInvalid(d.numero) || isInvalid(d.fecha) || isInvalid(d.fedatario)),
      conclusion: checkSection(['conclusion', 'nombre_firmante'])
  };

  // Calculations
  const totalPercentage = shareholders.reduce((acc, curr) => acc + (parseFloat(curr.porcentaje) || 0), 0);
  const totalShares = shareholders.reduce((acc, curr) => acc + (parseFloat(curr.acciones) || 0), 0);
  const totalAmount = shareholders.reduce((acc, curr) => {
    const val = parseFloat(curr.valor.replace(/[^0-9.]/g, '')) || 0;
    return acc + val;
  }, 0);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateItem = (setter, list, id, field, value) => {
    setter(list.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (setter, list, id) => {
    if (list.length > 1) setter(list.filter(item => item.id !== id));
  };

  const addItem = (setter, list, initial) => {
    const newId = (list.length > 0 ? Math.max(...list.map(i => i.id)) : 0) + 1;
    setter([...list, { ...initial, id: newId }]);
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFont('times', 'normal'); // Times font default
    
    // CRM Colors Matching CSS
    const primaryColor = [26, 69, 128]; // #1a4580 (Dictamen Blue)
    const secondaryColor = [207, 220, 235]; // #cfdceb (Light Blue for Doc headers)
    const darkText = [0, 0, 0]; 
    const whiteText = [255, 255, 255];
    
    const margin = 15; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    const img = new Image();
    img.src = logo;

    img.onload = () => {
        let yPos = 20;
        let logoHeight = 0;
        const logoWidth = 40;

        // --- Header ---
        // 1. Logo (Left)
        try {
            if (img.width > 0) {
                logoHeight = (img.height * logoWidth) / img.width;
                doc.addImage(img, 'PNG', margin, yPos, logoWidth, logoHeight);
            }
        } catch (e) { console.error("Logo error", e); }
        
        // Calculate vertical center based on logo (or default height if logo fails)
        const headerRefHeight = logoHeight > 0 ? logoHeight : 25;
        const headerMidY = yPos + (headerRefHeight / 2);

        // 2. Date (Right)
        // Content spread: Label at 0, Value at 7. Center ~3.5
        const dateStartY = headerMidY - 3.5;
        
        doc.setTextColor(0,0,0);
        doc.setFontSize(11);
        doc.setFont('times', 'bold');
        doc.text("Fecha", pageWidth - margin, dateStartY, { align: 'right' });
        doc.setFont('times', 'normal');
        doc.text(formatDate(formData.fechaDocumento), pageWidth - margin, dateStartY + 7, { align: 'right' });

        // 3. Center Text Info
        // Offsets: Title 0, Line1 5, Line2 9, Line3 13.
        // Total spread ~13. Center ~6.5
        let headerTextY = headerMidY - 6.5; 
        const centerX = pageWidth / 2;
        
        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        doc.text('Dictamen Jurídico', centerX, headerTextY, { align: 'center' });
        headerTextY += 5;
        
        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.text('SOFIMAS Consultores del Noroeste S.A. de C.V. SOFOM E.N.R.', centerX, headerTextY, { align: 'center' });
        headerTextY += 4;
        doc.text('Paseo Río Sonora Sur #205, Col. Proyecto Río Sonora 83270', centerX, headerTextY, { align: 'center' });
        headerTextY += 4;
        doc.text('Hermosillo Sonora; www.sofimas.com', centerX, headerTextY, { align: 'center' });
        
        // Header Spacing - Move down past the logo/content
        yPos = Math.max(yPos + headerRefHeight + 5, headerTextY + 10);
        yPos += 5;

        // Helper: Section Title
        const addSectionTitle = (title, y) => {
            doc.setFillColor(...primaryColor);
            doc.rect(margin, y, contentWidth, 7, 'F'); // Blue bar
            doc.setDrawColor(0, 0, 0);
            doc.rect(margin, y, contentWidth, 7, 'S'); // Black border
            
            doc.setTextColor(...whiteText);
            doc.setFontSize(10);
            doc.setFont('times', 'bold');
            doc.text(title, pageWidth / 2, y + 5, { align: 'center' });
            return y + 7;
        };

        const addTextContent = (text, y, isHighEmphasis = false) => {
            doc.setDrawColor(0, 0, 0); 
            doc.setFontSize(isHighEmphasis ? 11 : 9);
            doc.setFont('times', isHighEmphasis ? 'bold' : 'normal');
            
            const splitText = doc.splitTextToSize(text || '', contentWidth - 4);
            const blockHeight = Math.max(7, (splitText.length * 4) + 4);
            
            // Draw Box
            doc.setFillColor(isHighEmphasis ? 255 : 255); 
            doc.rect(margin, y, contentWidth, blockHeight, 'S'); 
            
            // Text
            doc.setTextColor(0, 0, 0);
            doc.text(splitText, margin + 2, y + 4);
            
            return y + blockHeight - 0.2;
        };

        // I. Denominación
        yPos = addSectionTitle('I.- Denominación de la Sociedad', yPos);
        yPos = addTextContent(formData.denominacion, yPos, true);

        // II. Objetivo
        yPos = addSectionTitle('II.- Objetivo', yPos);
        yPos = addTextContent(formData.objetivo, yPos);
        yPos += 0;

        // III. Antecedentes
        yPos = addSectionTitle('III.- Antecedentes del Hecho', yPos);
        
        doc.autoTable({
            startY: yPos,
            head: [],
            body: [
                [{ content: 'Constitución de la Sociedad:', rowSpan: 12, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center' } }, 'Número de escritura:', formData.ant_escritura],
                ['Volumen:', formData.ant_volumen],
                ['Fecha de Escritura Pública:', formData.ant_fecha],
                ['Fedatario Público:', formData.ant_fedatario],
                ['No de Fedatario Público:', formData.ant_num_fedatario],
                ['Circunscripción:', formData.ant_circunscripcion],
                ['Numero de Registro Público:', formData.ant_registro],
                ['Fecha de Registro Público:', formData.ant_fecha_reg],
                ['Lugar de Registro Público:', formData.ant_lugar_reg],
                ['Duración de la Sociedad:', formData.ant_duracion],
                ['Vigencia:', formData.ant_vigencia],
                ['Domicilio:', formData.ant_domicilio],
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], font: 'times' },
            columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 45, fontStyle: 'bold', fillColor: [255, 255, 255], halign: 'right' }, 2: { cellWidth: 'auto' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY - 0.2;

        doc.autoTable({
            startY: yPos,
            head: [[{ content: 'Cuadro Accionario Actual:', colSpan: 4, styles: { halign: 'left', fontStyle: 'bold' } }]],
            body: [
                ['Nombre', 'Acciones', 'Cantidad', 'Porcentaje'],
                ...shareholders.map(s => [s.name, s.acciones, s.valor, s.porcentaje + '%']),
                ['TOTAL', totalShares, `$${totalAmount.toLocaleString()}`, `${totalPercentage}%`]
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 2, font: 'times' },
            columnStyles: { 0: { cellWidth: 60 } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY - 0.2;
        
        doc.autoTable({
            startY: yPos,
            body: [
                [{ content: 'Objeto Social:', rowSpan: 5, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center' } }, 'Facultad Títulos Crédito:', formData.obj_titulos],
                ['Facultad Arrendamiento:', formData.obj_arrendamiento],
                ['Facultad Factoraje:', formData.obj_factoraje],
                ['Otros objetos:', formData.obj_otros],
                [{ content: formData.obj_descripcion, colSpan: 2, styles: { halign: 'justify', minCellHeight: 15 } }], 
                
                [{ content: 'Datos Inscritos SAT:', rowSpan: 3, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center' } }, 'RFC:', formData.sat_rfc],
                ['Domicilio Fiscal:', formData.sat_domicilio],
                ['Actividad Económica:', formData.sat_actividad],
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], font: 'times' },
            columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 45, fontStyle: 'bold' }, 2: { cellWidth: 'auto' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });

        // --- PAGE 2: Rep Legal, Observaciones, Cuestionamientos ---
        doc.addPage();
        yPos = 20;

        // IV. Representación Legal
        yPos = addSectionTitle('IV.- Representación Legal', yPos);
        
        reps.forEach(rep => {
            doc.autoTable({
                startY: yPos,
                body: [
                    [{ content: 'Datos Personales:', rowSpan: 4, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center', cellWidth: 35 } }, 'Nombre:', rep.name, 'Cargo:', rep.cargo],
                    ['RFC:', rep.rfc, 'ID Oficial:', rep.id_oficial],
                    ['CURP:', rep.curp, { content: '', colSpan: 2 }],
                    ['Domicilio:', { content: rep.domicilio, colSpan: 3 }],
                    
                    [{ content: 'Escritura Pública:', rowSpan: 3, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center' } }, 'Número:', rep.escritura, 'Fecha:', rep.fecha],
                    ['Volumen:', rep.volumen, 'Fedatario:', rep.fedatario],
                    ['Registro:', rep.registro, 'Fecha Reg:', rep.fecha_registro]
                ],
                theme: 'plain',
                styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 2, font: 'times' },
                columnStyles: { 1: { fontStyle: 'bold', cellWidth: 25 }, 3: { fontStyle: 'bold', cellWidth: 25 } },
                margin: { left: margin, right: margin },
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.1
            });
            yPos = doc.lastAutoTable.finalY - 0.2; 
        });
        yPos += 0;

        // V. Observaciones
        yPos = addSectionTitle('V.- Observaciones', yPos);
        
        doc.autoTable({
            startY: yPos,
            body: [
                ['Observaciones de la Sociedad:', formData.obs_sociedad],
                ['Observaciones del Representante Legal:', formData.obs_rep_legal]
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 3, font: 'times' },
            columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold', valign: 'middle' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY + 0;

        // VI. Cuestionamientos
        yPos = addSectionTitle('VI.- Cuestionamientos', yPos);

        const questions = Array.from({length: 13}, (_, i) => getQuestionLabel(i + 1));

        doc.autoTable({
            startY: yPos,
            body: questions.map((q, i) => [q, formData[`q${i+1}`] || '']),
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 1, font: 'times' },
            columnStyles: { 0: { cellWidth: 150 }, 1: { fontStyle: 'bold', halign: 'center' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });


        // --- PAGE 3: Documentación, Escrituras ---
        doc.addPage();
        yPos = 20;

        // VII. Documentación
        yPos = addSectionTitle('VII.- Documentación Dictaminada', yPos);

        // Subheader
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]); // #cfdceb
        doc.rect(margin, yPos, contentWidth, 6, 'FD'); // Fill and Border
        doc.setFontSize(8); doc.setTextColor(0,0,0); 
        doc.setFont('times', 'bold');
        doc.text("Lista de Documentos Dictaminados.-", pageWidth/2, yPos + 4, { align: 'center' });
        yPos += 6;

        doc.autoTable({
            startY: yPos,
            head: [['Denominación Social', 'Comprobante domicilio', 'Acta Constitutiva', 'RPP Acta Constitutiva', 'Otras Escrituras', 'RPP otras Escrituras', 'RPP otras Escrituras', 'RFC/Constancia']],
            body: [[
                formData.denominacion, 
                formData.doc_comp_dom, formData.doc_acta_const, formData.doc_rpp_acta,
                formData.doc_otras_esc, formData.doc_rpp_otras, formData.doc_rfc_const
            ]],
            theme: 'plain',
            headStyles: { fillColor: secondaryColor, textColor: [0,0,0], fontSize: 7, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1, font: 'times' },
            styles: { fontSize: 7, cellPadding: 2, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1, textColor: [0,0,0], font: 'times' },
            columnStyles: { 0: { cellWidth: 35, halign: 'left', fontStyle: 'bold' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY - 0.1;

        if (docPersons.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [['Personas Físicas', 'Identificación Oficial', 'CURP', 'RFC', 'Comprobante Domicilio', 'Acta Matrimonio', '-']],
                body: docPersons.map(p => [
                    p.name + (p.sujeto ? ` (${p.sujeto})` : ''),
                    p.identificacion, p.curp, p.rfc, p.comp_dom, p.acta_mat, '-'
                ]),
                theme: 'plain',
                headStyles: { fillColor: secondaryColor, textColor: [0,0,0], fontSize: 7, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1, font: 'times' },
                styles: { fontSize: 7, cellPadding: 2, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1, textColor: [0,0,0], font: 'times' },
                columnStyles: { 0: { cellWidth: 35, halign: 'left', fontStyle: 'bold' } },
                margin: { left: margin, right: margin },
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.1
            });
            yPos = doc.lastAutoTable.finalY + 5;
        }

        // IX. Escrituras
        if (deeds.length > 0) {
             yPos = addSectionTitle('IX.- Escrituras Dictaminadas', yPos);
             doc.autoTable({
                startY: yPos,
                head: [['Tipo de Escritura', 'Numero de Escritura', 'Fecha', 'Nombre Fedatario', 'Lugar', 'Datos Registro']],
                body: deeds.map(d => [d.tipo, d.numero, d.fecha, d.fedatario, d.lugar, d.registro]),
                theme: 'plain',
                headStyles: { fillColor: [220, 230, 241], textColor: [0,0,0], fontSize: 8, lineColor: [0,0,0], lineWidth: 0.1, font: 'times' }, // #dce6f1
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0,0,0], lineWidth: 0.1, textColor: [0,0,0], font: 'times' },
                margin: { left: margin, right: margin },
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.1
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }

        // --- PAGE 4: Conclusión, Firma ---
        doc.addPage();
        yPos = 20;

        // X. Conclusión
        yPos = addSectionTitle('X.- Conclusión', yPos);
        
        doc.setDrawColor(0,0,0);
        doc.rect(margin, yPos, contentWidth, 15, 'S'); 
        doc.setFontSize(11);
        doc.setTextColor(0,0,0);
        doc.setFont('times', 'bold');
        doc.text(formData.conclusion, pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 25;

        // XI. Firma
        yPos = addSectionTitle('XI.- Fecha y Firma', yPos);
        yPos += 5;
        
        doc.setTextColor(0,0,0); // Ensure text is black
        doc.rect(margin, yPos, contentWidth, 50, 'S');
        
        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        // Construct place and date string
        const lugarFecha = `Hermosillo, Sonora a ${formatLongDate(formData.fechaDocumento)}`;
        doc.text(lugarFecha, pageWidth / 2, yPos + 10, { align: 'center' });
        
        yPos += 30;
        doc.setLineWidth(0.5);
        doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
        yPos += 5;

        doc.setFont('times', 'bold');
        doc.text(FIXED_COMPANY, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
        doc.setFont('times', 'normal');
        doc.text(formData.nombre_firmante, pageWidth / 2, yPos, { align: 'center' });

        // Save
        doc.save(`Dictamen_${formData.denominacion.substring(0,20).replace(/\s+/g, '_')}.pdf`);
    };
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (acc) => {
        let text = "";
        try {
            // Try decoding as UTF-8 first
            const decoder = new TextDecoder('utf-8', { fatal: true });
            text = decoder.decode(acc.target.result);
        } catch (e) {
            // Decoding failed, perform heuristic check
            const winDecoder = new TextDecoder('windows-1252');
            const winText = winDecoder.decode(acc.target.result);
            
            // Check for MacRoman artifacts (Spanish accents appearing as specific Windows-1252 chars)
            // é -> Ž (0x8E), ó -> — (0x97), á -> ‡ (0x87), ñ -> – (0x96)
            if (winText.includes('Ž') || winText.includes('—') || winText.includes('‡')) {
                const macDecoder = new TextDecoder('macintosh');
                text = macDecoder.decode(acc.target.result);
            } else {
                text = winText;
            }
        }

        if (!text) return;

        const sections = text.split(/SECTION:/g).filter(s => s.trim().length > 0);
        
        let newFormData = { ...emptyFormData };
        let newLists = {
            shareholders: [],
            reps: [],
            docPersons: [],
            deeds: []
        };

        sections.forEach(sectionStr => {
            const lines = sectionStr.trim().split('\n');
            if (lines.length < 2) return; 

            const sectionName = lines[0].trim();
            const headerLine = lines[1];
            // Handle different line endings causing artifacts
            const headers = headerLine.replace(/\r$/, '').split(',').map(h => h.trim());
            
            const rows = lines.slice(2).map(rowStr => {
                 if (!rowStr.trim()) return null;
                 const vals = rowStr.replace(/\r$/, '').split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                 const obj = {};
                 headers.forEach((h, i) => obj[h] = vals[i] || '');
                 return obj;
            }).filter(x => x);

            if (rows.length > 0) {
                 // Determine target based on section name
                 if (sectionName.includes('Accionistas')) {
                     newLists.shareholders = rows.map(r => ({ ...r, id: parseInt(r.id) || Date.now() }));
                 } else if (sectionName.includes('Representantes')) {
                     newLists.reps = rows.map(r => ({ ...r, id: parseInt(r.id) || Date.now() }));
                 } else if (sectionName.includes('Documentación_Personas')) {
                     newLists.docPersons = rows.map(r => ({ ...r, id: parseInt(r.id) || Date.now() }));
                 } else if (sectionName.includes('Escrituras')) {
                     newLists.deeds = rows.map(r => ({ ...r, id: parseInt(r.id) || Date.now() }));
                 } else {
                     // Scalar sections - Merge all fields found
                     const data = rows[0];
                     newFormData = { ...newFormData, ...data };
                 }
            }
        });

        // Restore defaults if lists are empty (and not just empty in CSV, but user meant clear? Let's keep at least one empty row for UI)
        if (newLists.shareholders.length === 0) newLists.shareholders = [initialShareholder];
        if (newLists.reps.length === 0) newLists.reps = [initialRep];
        if (newLists.docPersons.length === 0) newLists.docPersons = [initialDocPerson];
        if (newLists.deeds.length === 0) newLists.deeds = [initialDeed];
        
        setFormData(newFormData);
        setShareholders(newLists.shareholders);
        setReps(newLists.reps);
        setDocPersons(newLists.docPersons);
        setDeeds(newLists.deeds);
        setAdmins([initialAdmin]); // Not in CSV currently

        alert('Datos cargados exitosamente.');
    };
    // Read as ArrayBuffer allows us to control decoding manually
    reader.readAsArrayBuffer(file);
    e.target.value = ''; 
  };

  const handleFileExport = () => {
    const esc = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val).replace(/"/g, '""');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s}"`;
        return s;
    };

    let csvContent = '';
    const appendSection = (name, keys, dataRows) => {
        csvContent += `SECTION:${name}\n`;
        csvContent += keys.join(',') + '\n';
        dataRows.forEach(row => {
            const line = keys.map(k => esc(row[k])).join(',');
            csvContent += line + '\n';
        });
        csvContent += '\n';
    };

    // 1. Denominación
    appendSection('Denominación', ['denominacion', 'fechaDocumento'], [formData]);

    // 2. Objetivo
    appendSection('Objetivo', ['objetivo', 'obj_titulos', 'obj_arrendamiento', 'obj_factoraje', 'obj_otros', 'obj_descripcion', 'sat_rfc', 'sat_domicilio', 'sat_actividad'], [formData]);

    // 3. Antecedentes
    appendSection('Antecedentes', ['ant_escritura', 'ant_volumen', 'ant_fecha', 'ant_fedatario', 'ant_num_fedatario', 'ant_circunscripcion', 'ant_registro', 'ant_fecha_reg', 'ant_lugar_reg', 'ant_duracion', 'ant_vigencia', 'ant_domicilio'], [formData]);

    // 4. Accionistas
    appendSection('Accionistas', Object.keys(initialShareholder), shareholders);

    // 5. Representantes
    appendSection('Representantes', Object.keys(initialRep), reps);

    // 6. Observaciones
    appendSection('Observaciones', ['obs_sociedad', 'obs_rep_legal'], [formData]);

    // 7. Cuestionamientos
    appendSection('Cuestionamientos', ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13'], [formData]);

    // 8. Documentación
    appendSection('Documentación', ['doc_comp_dom', 'doc_acta_const', 'doc_rpp_acta', 'doc_otras_esc', 'doc_rpp_otras', 'doc_rfc_const'], [formData]);
    appendSection('Documentación_Personas', Object.keys(initialDocPerson), docPersons);

    // 9. Escrituras
    appendSection('Escrituras', Object.keys(initialDeed), deeds);

    // 10. Conclusión
    appendSection('Conclusión', ['conclusion', 'lugar_fecha_firma', 'empresa_firma', 'nombre_firmante'], [formData]);

    // Add Byte Order Mark (BOM) for correct Excel UTF-8 recognition
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dictamen_data_${formData.denominacion.substring(0,10).replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => generarPDF();

  const clearFormState = () => {
    setFormData(emptyFormData);
    setShareholders([initialShareholder]);
    setReps([initialRep]);
    setDocPersons([initialDocPerson]);
    setAdmins([initialAdmin]);
    setDeeds([initialDeed]);
  };

  const handleNewDictamen = () => {
    clearFormState();
    setViewMode('form');
  };

  const resetForm = () => {
    if(window.confirm('¿Estás seguro de reiniciar todo el formulario?')) {
       clearFormState();
    }
  };

  const handleRowClick = (req) => {
    // Optional: Load request data into formData here if needed
    // For now, just switch view
    setViewMode('form');
  };

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-6 animate-[fadeIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
             {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
             )}
             <div>
               <h1 className="text-2xl font-bold text-[#1a4580]">Dictamen Jurídico</h1>
               <p className="text-slate-500 text-sm">Gestión y emisión de dictámenes legales para solicitudes de crédito.</p>
             </div>
          </div>
          <button onClick={handleNewDictamen} className="bg-[#1a4580] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 transition-colors font-medium">
             <Plus size={18} /> Nuevo Dictamen
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por cliente, folio..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
                    <Filter size={16} /> Filtros
                </button>
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
                    <ChevronDown size={16} /> Últimos 30 días
                </button>
            </div>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Solicitudes Recientes</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{mockRequests.length} registros</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4 border-b border-slate-100">Folio</th>
                            <th className="p-4 border-b border-slate-100">Cliente</th>
                            <th className="p-4 border-b border-slate-100">Producto</th>
                            <th className="p-4 border-b border-slate-100">Monto</th>
                            <th className="p-4 border-b border-slate-100">Estatus</th>
                            <th className="p-4 border-b border-slate-100">Etapa Actual</th>
                            <th className="p-4 border-b border-slate-100 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                        {mockRequests.map((item) => (
                            <tr 
                                key={item.id} 
                                onClick={() => handleRowClick(item)}
                                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            >
                                <td className="p-4 font-medium text-blue-600">{item.folio}</td>
                                <td className="p-4 font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-white group-hover:text-blue-600 border border-slate-200">
                                            {item.cliente.substring(0,2).toUpperCase()}
                                        </div>
                                        {item.cliente}
                                    </div>
                                </td>
                                <td className="p-4">{item.producto}</td>
                                <td className="p-4 font-medium">{item.monto}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${item.statusClass.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 ')}`}>
                                        {item.estatus}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500">{item.etapa}</td>
                                <td className="p-4 text-right">
                                    <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Mock */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
                <span>Mostrando 1-{mockRequests.length} de {mockRequests.length}</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                    <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50">Siguiente</button>
                </div>
            </div>
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Top Header - Hidden in Print */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm z-10 print:hidden">
        <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft size={18} /> Volver a lista
            </button>
           <h1 className="text-xl font-bold text-[#1a4580]">Editor de Dictamen Jurídico</h1>
        </div>
        <div className="flex gap-2">
            <button onClick={resetForm} className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md flex items-center gap-2 text-sm font-medium">
                <RefreshCw size={16} /> Reiniciar
            </button>
            <label className="px-3 py-2 text-slate-600 hover:bg-blue-50 rounded-md flex items-center gap-2 text-sm font-medium cursor-pointer">
                <Upload size={16} /> Cargar CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
            </label>
            <button onClick={handleFileExport} className="px-3 py-2 text-slate-600 hover:bg-blue-50 rounded-md flex items-center gap-2 text-sm font-medium">
                <Download size={16} /> Descargar CSV
            </button>
            <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2 text-sm font-medium">
                <Save size={16} /> Guardar Borrador
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md flex items-center gap-2 text-sm font-bold shadow-sm">
                <Printer size={18} /> IMPRIMIR PDF
            </button>
        </div>
      </div>

      <div className="dictamen-container">
        {/* SIDEBAR EDIT */}
        <div className="dictamen-sidebar print:hidden">
            <div className="dictamen-sidebar-header">
                <h2 className="text-[#1a4580] font-bold text-sm uppercase">Datos del Dictamen</h2>
                <p className="text-xs text-slate-500 mt-1">Ingresa la información para generar el documento.</p>
            </div>
            
            <div className="dictamen-scroll-content">
                {/* I. Denominación */}
                <SectionToggle title="I. Denominación" isOpen={sections.denominacion} onToggle={() => toggleSection('denominacion')} isInvalid={sectionInvalid.denominacion}>
                     <div className="dictamen-group">
                        <label className="dictamen-label">Fecha Documento</label>
                        <input type="date" name="fechaDocumento" value={formData.fechaDocumento} onChange={handleInputChange} className={getInputClass(formData.fechaDocumento)} />
                    </div>
                    <div className="dictamen-group">
                        <label className="dictamen-label">Denominación</label>
                        <input className={getInputClass(formData.denominacion)} name="denominacion" value={formData.denominacion} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* II. Objetivo */}
                <SectionToggle title="II. Objetivo" isOpen={sections.objetivo} onToggle={() => toggleSection('objetivo')} isInvalid={sectionInvalid.objetivo}>
                    <div className="dictamen-group">
                        <label className="dictamen-label">Objetivo</label>
                        <textarea className={getTextareaClass(formData.objetivo)} name="objetivo" value={formData.objetivo} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* III. Antecedentes */}
                <SectionToggle title="III. Antecedentes - Constitución" isOpen={sections.antecedentes} onToggle={() => toggleSection('antecedentes')} isInvalid={sectionInvalid.antecedentes}>
                    <div className="dictamen-row-inputs">
                        <input className={getInputClass(formData.ant_escritura)} placeholder="Escritura" name="ant_escritura" value={formData.ant_escritura} onChange={handleInputChange} />
                        <input className={getInputClass(formData.ant_volumen)} placeholder="Volumen" name="ant_volumen" value={formData.ant_volumen} onChange={handleInputChange} />
                    </div>
                    <div className="dictamen-group"><label className="dictamen-label">Fecha</label><input className={getInputClass(formData.ant_fecha)} name="ant_fecha" value={formData.ant_fecha} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Fedatario</label><input className={getInputClass(formData.ant_fedatario)} name="ant_fedatario" value={formData.ant_fedatario} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">No. Fedatario</label><input className={getInputClass(formData.ant_num_fedatario)} name="ant_num_fedatario" value={formData.ant_num_fedatario} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Circunscripción</label><input className={getInputClass(formData.ant_circunscripcion)} name="ant_circunscripcion" value={formData.ant_circunscripcion} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Registro Público</label><input className={getInputClass(formData.ant_registro)} name="ant_registro" value={formData.ant_registro} onChange={handleInputChange} /></div>
                    <div className="dictamen-row-inputs">
                        <input className={getInputClass(formData.ant_fecha_reg)} placeholder="Fecha Reg." name="ant_fecha_reg" value={formData.ant_fecha_reg} onChange={handleInputChange} />
                        <input className={getInputClass(formData.ant_lugar_reg)} placeholder="Lugar Reg." name="ant_lugar_reg" value={formData.ant_lugar_reg} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* III. Cuadro Accionario */}
                <SectionToggle title="III. Cuadro Accionario" isOpen={sections.accionistas} onToggle={() => toggleSection('accionistas')} isInvalid={sectionInvalid.accionistas}>
                     {shareholders.map((person, index) => (
                         <div key={person.id} className="card-dynamic">
                             <button className="btn-del" onClick={() => removeItem(setShareholders, shareholders, person.id)}>X</button>
                             <input className={getInputClass(person.name) + " mb-2"} placeholder="Nombre Accionista" value={person.name} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'name', e.target.value)} />
                             <div className="dictamen-row-inputs">
                                 <input className={getInputClass(person.acciones)} placeholder="Acciones" value={person.acciones} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'acciones', e.target.value)} />
                                 <input className={getInputClass(person.valor)} placeholder="Valor ($)" value={person.valor} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'valor', e.target.value)} />
                                 <input className={getInputClass(person.porcentaje)} placeholder="%" type="number" value={person.porcentaje} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'porcentaje', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="btn-add" onClick={() => addItem(setShareholders, shareholders, initialShareholder)}>+ Agregar Accionista</button>
                     <div className={`text-center font-bold text-xs p-2 rounded ${Math.abs(totalPercentage - 100) < 0.1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Total: {totalPercentage}% {Math.abs(totalPercentage - 100) > 0.1 && '(Debe sumar 100%)'}
                     </div>
                </SectionToggle>

                 {/* III. Objeto Social y SAT */}
                 <SectionToggle title="III. Objeto Social y SAT" isOpen={sections.objeto} onToggle={() => toggleSection('objeto')} isInvalid={sectionInvalid.objeto}>
                    <div className="dictamen-group"><label className="dictamen-label">Facultad Títulos</label><input className={getInputClass(formData.obj_titulos)} name="obj_titulos" value={formData.obj_titulos} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Facultad Arrendamiento</label><input className={getInputClass(formData.obj_arrendamiento)} name="obj_arrendamiento" value={formData.obj_arrendamiento} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Facultad Factoraje</label><input className={getInputClass(formData.obj_factoraje)} name="obj_factoraje" value={formData.obj_factoraje} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Descripción</label><textarea className={getTextareaClass(formData.obj_descripcion) + " h-24"} name="obj_descripcion" value={formData.obj_descripcion} onChange={handleInputChange} /></div>
                    <div className="border-t border-slate-200 my-2 pt-2">
                        <div className="dictamen-group"><label className="dictamen-label">SAT RFC</label><input className={getInputClass(formData.sat_rfc)} name="sat_rfc" value={formData.sat_rfc} onChange={handleInputChange} /></div>
                        <div className="dictamen-group"><label className="dictamen-label">SAT Domicilio</label><textarea className={getTextareaClass(formData.sat_domicilio)} name="sat_domicilio" value={formData.sat_domicilio} onChange={handleInputChange} /></div>
                    </div>
                </SectionToggle>

                {/* IV. Representación Legal */}
                <SectionToggle title="IV. Representación Legal" isOpen={sections.representacion} onToggle={() => toggleSection('representacion')} isInvalid={sectionInvalid.representacion}>
                     {reps.map((rep) => (
                         <div key={rep.id} className="card-dynamic">
                             <div className="font-bold text-[10px] text-blue-800 mb-1">REPRESENTANTE #{rep.id}</div>
                             <button className="btn-del" onClick={() => removeItem(setReps, reps, rep.id)}>X</button>
                             
                             <div className="dictamen-row-inputs">
                                <input className={getInputClass(rep.name)} placeholder="Nombre" value={rep.name} onChange={(e) => updateItem(setReps, reps, rep.id, 'name', e.target.value)} />
                                <input className={getInputClass(rep.cargo)} placeholder="Cargo" value={rep.cargo} onChange={(e) => updateItem(setReps, reps, rep.id, 'cargo', e.target.value)} />
                             </div>
                             <div className="dictamen-row-inputs">
                                <input className={getInputClass(rep.rfc)} placeholder="RFC" value={rep.rfc} onChange={(e) => updateItem(setReps, reps, rep.id, 'rfc', e.target.value)} />
                                <input className={getInputClass(rep.id_oficial)} placeholder="ID Oficial" value={rep.id_oficial} onChange={(e) => updateItem(setReps, reps, rep.id, 'id_oficial', e.target.value)} />
                             </div>
                             <input className={getInputClass(rep.domicilio) + " mb-2"} placeholder="Domicilio" value={rep.domicilio} onChange={(e) => updateItem(setReps, reps, rep.id, 'domicilio', e.target.value)} />
                             
                             <label className="dictamen-label mt-2">Escritura Poder</label>
                             <div className="dictamen-row-inputs">
                                <input className={getInputClass(rep.escritura)} placeholder="Num" value={rep.escritura} onChange={(e) => updateItem(setReps, reps, rep.id, 'escritura', e.target.value)} />
                                <input className={getInputClass(rep.fecha)} placeholder="Fecha" value={rep.fecha} onChange={(e) => updateItem(setReps, reps, rep.id, 'fecha', e.target.value)} />
                             </div>
                             <input className={getInputClass(rep.fedatario) + " mb-1"} placeholder="Fedatario" value={rep.fedatario} onChange={(e) => updateItem(setReps, reps, rep.id, 'fedatario', e.target.value)} />
                         </div>
                     ))}
                     <button className="btn-add bg-cyan-600" onClick={() => addItem(setReps, reps, initialRep)}>+ Agregar Representante</button>
                </SectionToggle>

                {/* V. Observaciones */}
                <SectionToggle title="V. Observaciones" isOpen={sections.observaciones} onToggle={() => toggleSection('observaciones')} isInvalid={sectionInvalid.observaciones}>
                    <div className="dictamen-group"><label className="dictamen-label">Obs. Sociedad</label><textarea className={getTextareaClass(formData.obs_sociedad) + " h-20"} name="obs_sociedad" value={formData.obs_sociedad} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Obs. Rep. Legal</label><textarea className={getTextareaClass(formData.obs_rep_legal) + " h-20"} name="obs_rep_legal" value={formData.obs_rep_legal} onChange={handleInputChange} /></div>
                </SectionToggle>

                {/* VI. Cuestionamientos */}
                <SectionToggle title="VI. Cuestionamientos" isOpen={sections.cuestionamientos} onToggle={() => toggleSection('cuestionamientos')} isInvalid={sectionInvalid.cuestionamientos}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => (
                        <div key={n} className="flex justify-between items-center mb-1 text-xs">
                           <span className="text-slate-600 w-3/4 truncate">
                             {n}. {getQuestionLabel(n)}
                           </span>
                           <select className={getSmallSelectClass(formData[`q${n}`])} name={`q${n}`} value={formData[`q${n}`]} onChange={handleInputChange}>
                               <option value=""></option><option>Si</option><option>No</option><option>N/A</option>
                           </select>
                        </div>
                    ))}
                </SectionToggle>

                {/* VII. Documentacion */}
                <SectionToggle title="VII. Documentación" isOpen={sections.documentacion} onToggle={() => toggleSection('documentacion')} isInvalid={sectionInvalid.documentacion}>
                     <div className="grid grid-cols-2 gap-2 mb-4">
                        {['Comp. Dom', 'Acta Const', 'RPP Acta', 'Otras Esc', 'RPP Otras', 'RFC/Const'].map((label, idx) => {
                             const keys = ['doc_comp_dom', 'doc_acta_const', 'doc_rpp_acta', 'doc_otras_esc', 'doc_rpp_otras', 'doc_rfc_const'];
                             return (
                                <div key={label} className="flex flex-col">
                                    <label className="text-[10px] lowercase text-slate-500">{label}</label>
                                    <select className={getSmallSelectClass(formData[keys[idx]])} name={keys[idx]} value={formData[keys[idx]]} onChange={handleInputChange}>
                                        <option value=""></option><option>SI</option><option>NO</option><option>N/A</option>
                                    </select>
                                </div>
                             )
                        })}
                     </div>
                     
                     <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Personas Identificadas</div>
                     {docPersons.map((p) => (
                         <div key={p.id} className="card-dynamic">
                             <button className="btn-del" onClick={() => removeItem(setDocPersons, docPersons, p.id)}>X</button>
                             <input className={getInputClass(p.name) + " mb-1"} placeholder="Nombre" value={p.name} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'name', e.target.value)} />
                             <div className="dictamen-row-inputs">
                                 <input className={getInputClass(p.identificacion)} placeholder="ID (INE/Pasaporte)" value={p.identificacion} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'identificacion', e.target.value)} />
                                 <select className={getSelectClass(p.comp_dom) + " w-20"} value={p.comp_dom || ''} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'comp_dom', e.target.value)}>
                                     <option value=""></option><option value="SI">Dom: SI</option><option value="NO">NO</option>
                                 </select>
                             </div>
                         </div>
                     ))}
                     <button className="btn-add bg-slate-500" onClick={() => addItem(setDocPersons, docPersons, initialDocPerson)}>+ Persona</button>
                </SectionToggle>

                {/* IX. Escrituras */}
                 <SectionToggle title="IX. Escrituras Dictaminadas" isOpen={sections.escrituras} onToggle={() => toggleSection('escrituras')} isInvalid={sectionInvalid.escrituras}>
                     {deeds.map((deed) => (
                         <div key={deed.id} className="card-dynamic">
                             <button className="btn-del" onClick={() => removeItem(setDeeds, deeds, deed.id)}>X</button>
                             <div className="dictamen-row-inputs">
                                 <select className={getSelectClass(deed.tipo) + " w-1/2"} value={deed.tipo || ''} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'tipo', e.target.value)}>
                                     <option value=""></option><option>Acta Constitutiva</option><option>Acta de Asamblea</option><option>Poderes</option>
                                 </select>
                                 <input className={getInputClass(deed.numero) + " w-1/2"} placeholder="Numero" value={deed.numero} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'numero', e.target.value)} />
                             </div>
                             <div className="dictamen-row-inputs">
                                 <input className={getInputClass(deed.fecha)} placeholder="Fecha" value={deed.fecha} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'fecha', e.target.value)} />
                                 <input className={getInputClass(deed.fedatario)} placeholder="Fedatario" value={deed.fedatario} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'fedatario', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="btn-add bg-indigo-400" onClick={() => addItem(setDeeds, deeds, initialDeed)}>+ Escritura</button>
                </SectionToggle>

                {/* X. Conclusión */}
                <SectionToggle title="X. Conclusión y Firma" isOpen={sections.conclusion} onToggle={() => toggleSection('conclusion')} isInvalid={sectionInvalid.conclusion}>
                    <div className="dictamen-group"><label className="dictamen-label">Conclusión</label><input className={getInputClass(formData.conclusion)} name="conclusion" value={formData.conclusion} onChange={handleInputChange} /></div>
                    <div className="dictamen-group">
                        <label className="dictamen-label">Lugar y Fecha</label>
                        <div className="dictamen-input bg-slate-100 text-slate-500 text-xs flex items-center px-1">
                            Hermosillo, Sonora a {formatLongDate(formData.fechaDocumento)}
                        </div>
                    </div>
                    <div className="dictamen-group">
                        <label className="dictamen-label">Nombre Firmante</label>
                        <select className={getSelectClass(formData.nombre_firmante)} name="nombre_firmante" value={formData.nombre_firmante} onChange={handleInputChange}>
                             <option value=""></option>
                             {AVAILABLE_SIGNERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="dictamen-group">
                        <label className="dictamen-label">Empresa</label>
                        <input className="dictamen-input bg-slate-100 text-slate-500" name="empresa_firma" value={FIXED_COMPANY} readOnly />
                    </div>
                </SectionToggle>
            </div>
        </div>

        {/* PREVIEW AREA (The Sheet) */}
        <div className="dictamen-preview bg-slate-700 flex flex-col items-center">
            {/* Pagination Controls */}
            <div className="flex items-center justify-between w-[215.9mm] mb-4 text-white">
                <button 
                    onClick={prevSheet} 
                    disabled={currentSheet === 1}
                    className="p-2 bg-slate-600 rounded hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    <ChevronLeft size={20} className="mr-1" /> Anterior
                </button>
                <div className="font-bold">Página {currentSheet} de {totalSheets}</div>
                <button 
                    onClick={nextSheet} 
                    disabled={currentSheet === totalSheets}
                    className="p-2 bg-slate-600 rounded hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    Siguiente <ChevronRight size={20} className="ml-1" />
                </button>
            </div>

            <div className="sheet relative min-h-[279.4mm]">
                
                {/* Header - Shown on Page 1 (or all? usually page 1 has full header, others simplified. Let's show on Page 1 only for now as typically requested) */}
                {currentSheet === 1 && (
                <div className="header">
                    <div className="logo">
                        <img src={logo} alt="SOFIMAS" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div className="h-info">
                        <strong>Dictamen Jurídico</strong><br/>
                        SOFIMAS Consultores del Noroeste S.A. de C.V. SOFOM E.N.R.<br/>
                        Paseo Río Sonora Sur #205, Col. Proyecto Río Sonora 83270<br/>
                        Hermosillo Sonora; www.sofimas.com
                    </div>
                    <div className="h-date">Fecha<br/><span>{formData.fechaDocumento}</span></div>
                </div>
                )}
                
                {/* Simplified Header for other pages if needed? For now, blank top margin is standard for 'continued' pages in some views, but let's stick to content */}

                {/* Sections Page 1 */}
                {currentSheet === 1 && (
                <>
                    <div className="sec-h">I.- Denominación de la Sociedad</div>
                    <div className="sec-c high">{formData.denominacion}</div>

                    <div className="sec-h">II.- Objetivo</div>
                    <div className="sec-c">{formData.objetivo}</div>

                    <div className="sec-h">III.- Antecedentes del Hecho</div>
                    <table className="main-table">
                        <tbody>
                            <tr><td rowSpan="12" className="t-side">Constitución de la Sociedad:</td><td className="t-key">Número de escritura:</td><td className="t-val">{formData.ant_escritura}</td></tr>
                            <tr><td className="t-key">Volumén:</td><td className="t-val">{formData.ant_volumen}</td></tr>
                            <tr><td className="t-key">Fecha de Escritura Pública:</td><td className="t-val">{formData.ant_fecha}</td></tr>
                            <tr><td className="t-key">Fedatario Público:</td><td className="t-val">{formData.ant_fedatario}</td></tr>
                            <tr><td className="t-key">No de Fedatario Público:</td><td className="t-val">{formData.ant_num_fedatario}</td></tr>
                            <tr><td className="t-key">Circunscripción:</td><td className="t-val">{formData.ant_circunscripcion}</td></tr>
                            <tr><td className="t-key">Numero de Registro Público:</td><td className="t-val">{formData.ant_registro}</td></tr>
                            <tr><td className="t-key">Fecha de Registro Público:</td><td className="t-val">{formData.ant_fecha_reg}</td></tr>
                            <tr><td className="t-key">Lugar de Registro Público:</td><td className="t-val">{formData.ant_lugar_reg}</td></tr>
                            <tr><td className="t-key">Duración de la Sociedad:</td><td className="t-val">{formData.ant_duracion}</td></tr>
                            <tr><td className="t-key">Vigencia:</td><td className="t-val">{formData.ant_vigencia}</td></tr>
                            <tr><td className="t-key">Domicilio:</td><td className="t-val">{formData.ant_domicilio}</td></tr>
                            
                            {/* Dynamic Shareholders Table inside Main Table */}
                            <tr>
                                <td className="t-side">Cuadro Accionario Actual:</td>
                                <td colSpan="2" style={{padding: 0, border: 'none'}}>
                                    <table className="nested-table">
                                        <thead><tr><td>Nombre</td><td>Acciones</td><td>Cantidad</td><td>Porcentaje</td></tr></thead>
                                        <tbody>
                                            {shareholders.map(sh => (
                                                <tr key={sh.id} className="nested-row">
                                                    <td>{sh.name}</td>
                                                    <td>{sh.acciones}</td>
                                                    <td>{sh.valor}</td>
                                                    <td>{sh.porcentaje}%</td>
                                                </tr>
                                            ))}
                                            <tr className="nested-total">
                                                <td>TOTAL</td>
                                                <td>{totalShares}</td>
                                                <td>${totalAmount.toLocaleString()}</td>
                                                <td style={{color: Math.abs(totalPercentage - 100) > 0.1 ? 'red' : 'black'}}>{totalPercentage}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr><td rowSpan="5" className="t-side">Objeto Social:</td><td className="t-key-white">Facultad Títulos Crédito:</td><td className="t-val">{formData.obj_titulos}</td></tr>
                            <tr><td className="t-key-white">Facultad Arrendamiento:</td><td className="t-val">{formData.obj_arrendamiento}</td></tr>
                            <tr><td className="t-key-white">Facultad Factoraje:</td><td className="t-val">{formData.obj_factoraje}</td></tr>
                            <tr><td className="t-key-white">Otros objetos:</td><td className="t-val">{formData.obj_otros}</td></tr>
                            <tr><td colSpan="2" className="t-val" style={{textAlign: 'justify', padding: '8px'}}>{formData.obj_descripcion}</td></tr>

                            <tr><td rowSpan="3" className="t-side">Datos Inscritos SAT:</td><td className="t-key-white">RFC:</td><td className="t-val">{formData.sat_rfc}</td></tr>
                            <tr><td className="t-key-white">Domicilio Fiscal:</td><td className="t-val">{formData.sat_domicilio}</td></tr>
                            <tr><td className="t-key-white">Actividad Económica:</td><td className="t-val">{formData.sat_actividad}</td></tr>
                        </tbody>
                    </table>
                </>
                )}

                {/* Sections Page 2 */}
                {currentSheet === 2 && (
                <>
                    <div className="sec-h">IV.- Representación Legal</div>
                    {reps.map(rep => (
                        <table key={rep.id} className="rep-table">
                            <tbody>
                                <tr><td rowSpan="4" className="rep-side">Datos Personales:</td><td className="rep-label">Nombre:</td><td className="rep-val">{rep.name}</td><td className="rep-label">Cargo:</td><td className="rep-val">{rep.cargo}</td></tr>
                                <tr><td className="rep-label">RFC:</td><td className="rep-val">{rep.rfc}</td><td rowSpan="2" className="rep-label">ID Oficial:</td><td rowSpan="2" className="rep-val">{rep.id_oficial}</td></tr>
                                <tr><td className="rep-label">CURP:</td><td className="rep-val">{rep.curp}</td></tr>
                                <tr><td className="rep-label">Domicilio:</td><td colSpan="3" className="rep-val">{rep.domicilio}</td></tr>
                                <tr><td rowSpan="3" className="rep-side">Escritura Pública:</td><td className="rep-label">Número:</td><td className="rep-val">{rep.escritura}</td><td className="rep-label">Fecha:</td><td className="rep-val">{rep.fecha}</td></tr>
                                <tr><td className="rep-label">Volumén:</td><td className="rep-val">{rep.volumen}</td><td className="rep-label">Fedatario:</td><td className="rep-val">{rep.fedatario}</td></tr>
                                <tr><td className="rep-label">Registro:</td><td className="rep-val">{rep.registro}</td><td className="rep-label">Fecha Reg:</td><td className="rep-val">{rep.fecha_registro}</td></tr>
                            </tbody>
                        </table>
                    ))}

                    <div className="sec-h">V.- Observaciones</div>
                    <table className="main-table">
                        <tbody>
                            <tr><td className="t-side" style={{width: '25%'}}>Observaciones de la Sociedad:</td><td className="t-val" style={{textAlign: 'justify', padding: '10px'}}>{formData.obs_sociedad}</td></tr>
                            <tr><td className="t-side" style={{width: '25%'}}>Observaciones del Representante Legal:</td><td className="t-val" style={{textAlign: 'justify', padding: '10px'}}>{formData.obs_rep_legal}</td></tr>
                        </tbody>
                    </table>

                    <div className="sec-h">VI.- Cuestionamientos</div>
                    <div className="sec-c">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <div key={n} className="q-row"><span>{n}. {getQuestionLabel(n)}</span><span className="q-ans">{formData[`q${n}`]}</span></div>
                        ))}
                    </div>
                </>
                )}

                {/* Sections Page 3 */}
                {currentSheet === 3 && (
                <>
                    <div className="sec-h">VII.- Documentación Dictaminada</div>
                    <div className="sec-c" style={{padding: 0, border: 'none'}}>
                        <div style={{background: '#cfdceb', padding: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', border: '1px solid #000', borderTop: 'none'}}>Lista de Documentos Dictaminados.-</div>
                        <table className="doc-table">
                            <thead><tr><th className="col-wide">Denominación Social</th><th className="col-std">Comprobante domicilio</th><th className="col-std">Acta Constitutiva</th><th className="col-std">RPP Acta Constitutiva</th><th className="col-std">Otras Escrituras</th><th className="col-std">RPP otras Escrituras</th><th className="col-std">RFC/Constancia de</th></tr></thead>
                            <tbody><tr>
                                <td style={{fontWeight: 'bold', fontSize: '10px'}}>{formData.denominacion}</td>
                                <td>{formData.doc_comp_dom}</td><td>{formData.doc_acta_const}</td><td>{formData.doc_rpp_acta}</td>
                                <td>{formData.doc_otras_esc}</td><td>{formData.doc_rpp_otras}</td><td>{formData.doc_rfc_const}</td>
                            </tr></tbody>
                        </table>
                        
                        {/* Dynamic Table for People Documents */}
                        {docPersons.length > 0 && (
                            <table className="doc-table" style={{marginTop: '-1px'}}>
                                <thead><tr><th className="col-wide">Personas Físicas</th><th className="col-std">Identificación Oficial</th><th className="col-std">CURP</th><th className="col-std">RFC</th><th className="col-std">Comprobante Domicilio</th><th className="col-std">Acta Matrimonio</th><th className="col-std">-</th></tr></thead>
                                <tbody>
                                    {docPersons.map(p => (
                                        <tr key={p.id}>
                                            <td style={{fontWeight: 'bold'}}>{p.name} {p.sujeto ? `(${p.sujeto})` : ''}</td>
                                            <td>{p.identificacion}</td>
                                            <td>{p.curp}</td>
                                            <td>{p.rfc}</td>
                                            <td>{p.comp_dom}</td>
                                            <td>{p.acta_mat}</td>
                                            <td>-</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="sec-h">IX.- Escrituras Dictaminadas</div>
                    <div className="sec-c" style={{padding: 0, border: 'none'}}>
                        <table className="deed-table">
                            <thead><tr><th>Tipo de Escritura</th><th>Numero de Escritura</th><th>Fecha</th><th>Nombre Fedatario</th><th>Lugar</th><th>Datos Registro</th></tr></thead>
                            <tbody>
                                {deeds.map(deed => (
                                    <tr key={deed.id}>
                                        <td>{deed.tipo}</td>
                                        <td>{deed.numero}</td>
                                        <td>{deed.fecha}</td>
                                        <td>{deed.fedatario}</td>
                                        <td>{deed.lugar}</td>
                                        <td>{deed.registro}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
                )}

                {/* Sections Page 4 */}
                {currentSheet === 4 && (
                <>
                    <div className="sec-h">X.- Conclusión</div><div className="sec-c" style={{textAlign: 'center', fontWeight: 'bold', fontSize:'14px', padding:'10px'}}>{formData.conclusion}</div>
                    
                    <div className="sec-h">XI.- Fecha y Firma</div>
                    <div className="sec-c" style={{padding: '20px'}}>
                        <div style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '40px', fontSize: '12px'}}>
                            Hermosillo, Sonora a {formatLongDate(formData.fechaDocumento)}
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-64 border-t border-black mb-2"></div>
                            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{FIXED_COMPANY}</div>
                            <div>{formData.nombre_firmante}</div>
                        </div>
                    </div>
                </>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SectionToggle({ title, isOpen, onToggle, isInvalid, children }) {
    return (
        <div>
            <div className={`cat-h ${!isOpen ? 'collapsed' : ''} ${isInvalid ? 'bg-red-100 text-red-800 border-red-200' : ''}`} onClick={onToggle}>
                {title} <span className="arrow">▼</span>
            </div>
            {isOpen && <div className="bg-white p-3 border border-slate-200 border-t-0 mb-3">{children}</div>}
        </div>
    );
}

function getQuestionLabel(n) {
    const labels = [
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
    return labels[n-1] || "";
}
