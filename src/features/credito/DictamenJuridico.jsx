import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Plus, Trash2, ChevronDown, ChevronRight, ChevronLeft, RefreshCw, Save, Search, Filter, MoreVertical, FileText, Upload, Download, CheckCircle, User, Briefcase, Info, MapPin, Calendar, ClipboardCheck } from 'lucide-react';
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
  ];

const FIXED_COMPANY = 'SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR';

const formatLongDate = (dateStr) => {
  if (!dateStr) return '';
  // Check if it matches YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  if (month < 1 || month > 12) return dateStr;
  
  return `${day} de ${months[month - 1]} de ${year}`;
};

const formatNumber = (num) => {
    if (!num) return '';
    const clean = String(num).replace(/,/g, '');
    if (clean === '' || isNaN(clean)) return num; 
    return Number(clean).toLocaleString('en-US'); 
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
    ant_escritura: '43,321', ant_volumen: '513', ant_fecha: '2018-01-11',
    ant_fedatario: 'Salvador Antonio Corral Martínez', ant_num_fedatario: 'Notario Público no. 28',
    ant_circunscripcion: 'Hermosillo, Sonora', ant_registro: 'N-201800428 SECCION COMERCIO',
    ant_fecha_reg: '2018-01-18', ant_lugar_reg: 'Hermosillo, Sonora',
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
const initialRep = { id: 1, name: '', cargo: '', rfc: '', id_oficial: '', curp: '', domicilio: '', escritura: '', fecha: '', volumen: '', fedatario: '', registro: '', fecha_registro: '', tipo_poderes: '', tipo_escritura: '' }; // Empty Rep
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
    ant_escritura: '43,321', ant_volumen: '513', ant_fecha: '2018-01-11',
    ant_fedatario: 'Salvador Antonio Corral Martínez', ant_num_fedatario: 'Notario Público no. 28',
    ant_circunscripcion: 'Hermosillo, Sonora', ant_registro: 'N-201800428 SECCION COMERCIO',
    ant_fecha_reg: '2018-01-18', ant_lugar_reg: 'Hermosillo, Sonora',
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
  const [reps, setReps] = useState([{ ...initialRep, id: 1, _docPersonId: 1 }]);
  const [docPersons, setDocPersons] = useState([{ ...initialDocPerson, id: 1, _repId: 1, sujeto: 'Representante Legal' }]);
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
  const totalShares = shareholders.reduce((acc, curr) => acc + (parseFloat(String(curr.acciones).replace(/,/g, '')) || 0), 0);
  const totalAmount = shareholders.reduce((acc, curr) => {
    const val = parseFloat(String(curr.valor).replace(/[^0-9.]/g, '')) || 0;
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

  // Función especializada para agregar representante legal y sincronizar con docPersons
  const addRepresentante = () => {
    const newRepId = (reps.length > 0 ? Math.max(...reps.map(i => i.id)) : 0) + 1;
    const newDocId = (docPersons.length > 0 ? Math.max(...docPersons.map(i => i.id)) : 0) + 1;
    
    // Agregar representante
    setReps(prev => [...prev, { ...initialRep, id: newRepId, _docPersonId: newDocId }]);
    
    // Agregar persona a documentos
    setDocPersons(prev => [...prev, { ...initialDocPerson, id: newDocId, _repId: newRepId, sujeto: 'Representante Legal' }]);
  };

  // Función para eliminar representante y su persona asociada en documentos
  const removeRepresentante = (repId) => {
    if (reps.length > 1) {
      const rep = reps.find(r => r.id === repId);
      setReps(prev => prev.filter(r => r.id !== repId));
      
      // Eliminar persona asociada si existe
      if (rep && rep._docPersonId) {
        setDocPersons(prev => prev.filter(p => p.id !== rep._docPersonId));
      } else {
        // Buscar por _repId si no hay _docPersonId
        setDocPersons(prev => prev.filter(p => p._repId !== repId));
      }
    }
  };

  // Función para actualizar representante y sincronizar datos con docPersons
  const updateRepresentante = (repId, field, value) => {
    // Primero actualizar el representante
    setReps(prev => prev.map(rep => 
      rep.id === repId ? { ...rep, [field]: value } : rep
    ));
    
    // Sincronizar campos relevantes con docPersons
    if (['name', 'rfc', 'curp', 'id_oficial'].includes(field)) {
      const fieldMap = { name: 'name', rfc: 'rfc', curp: 'curp', id_oficial: 'identificacion' };
      const docField = fieldMap[field] || field;
      
      setDocPersons(prev => prev.map(p => 
        p._repId === repId ? { ...p, [docField]: value } : p
      ));
    }
  };

  const generarPDF = (logoImg) => {
    const doc = new jsPDF();
    // Colores exactos del diseño web
    const colorBlue900 = [30, 58, 138];     // blue-900 (#1e3a8a)
    const colorBlue = [26, 69, 128];        // Azul corporativo
    const colorSlate900 = [15, 23, 42];     // #0f172a
    const colorSlate700 = [51, 65, 85];     // #334155
    const colorSlate600 = [71, 85, 105];    // #475569
    const colorSlate500 = [100, 116, 139];  // #64748b
    const colorSlate400 = [148, 163, 184];  // #94a3b8
    const colorSlate300 = [203, 213, 225];  // #cbd5e1
    const colorSlate200 = [226, 232, 240];  // #e2e8f0
    const colorSlate100 = [241, 245, 249];  // #f1f5f9
    const colorSlate50 = [248, 250, 252];   // #f8fafc
    const colorGray = [100, 116, 139];      // slate-500
    const colorLightGray = [241, 245, 249]; // slate-100
    const colorGreen600 = [22, 163, 74];    // green-600
    const colorRed = [220, 38, 38]; // red-600

    const margin = 12;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = 10;

    // --- HELPER FUNCTIONS ---
    // Coincide con: <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
    const drawSectionHeader = (title) => {
        doc.setFontSize(9);
        doc.setTextColor(...colorBlue900);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin + 1, yPos);
        
        // Línea debajo del título (border-slate-100)
        doc.setDrawColor(...colorSlate100);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        
        return yPos + 6;
    };

    // Bloque estilo: bg-slate-50 p-4 rounded-lg border-l-4
    const drawBlock = (title, content, x, y, w, h, borderColor = null, isBold = false) => {
        // Background slate-50 con bordes redondeados
        doc.setFillColor(...colorSlate50);
        doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
        
        // Borde izquierdo (border-l-4)
        if (borderColor) {
            doc.setDrawColor(...borderColor);
            doc.setLineWidth(1.2);
            doc.line(x, y + 1, x, y + h - 1);
        }

        // Título pequeño uppercase (text-[10px] uppercase font-bold)
        doc.setFontSize(6.5);
        doc.setTextColor(...(borderColor && borderColor[0] === colorBlue900[0] ? colorBlue900 : colorSlate500));
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), x + 4, y + 4);

        // Contenido
        doc.setFontSize(isBold ? 11 : 8);
        doc.setTextColor(...(isBold ? colorSlate900 : colorSlate600));
        doc.setFont('helvetica', isBold ? 'bold' : 'italic');
        
        const splitText = doc.splitTextToSize(content || '', w - 8);
        doc.text(splitText, x + 4, y + 9);
        
        return y + h + 3;
    };

    // Bloque de datos pequeños (bg-slate-50 p-3 rounded border border-slate-100)
    const drawInfoBlock = (title, content, x, y, w, h) => {
        doc.setFillColor(...colorSlate50);
        doc.roundedRect(x, y, w, h, 1, 1, 'F');
        doc.setDrawColor(...colorSlate100);
        doc.roundedRect(x, y, w, h, 1, 1, 'S');
        
        doc.setFontSize(6);
        doc.setTextColor(...colorSlate400);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), x + 3, y + 4);
        
        doc.setFontSize(7);
        doc.setTextColor(...colorSlate700);
        doc.setFont('helvetica', 'bold');
        const splitText = doc.splitTextToSize(content || '-', w - 6);
        doc.text(splitText, x + 3, y + 8);
        
        return y + h + 2;
    };

    const checkPageBreak = (neededHeight) => {
        if (yPos + neededHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = 20;
            return true;
        }
        return false;
    };

    // --- HEADER (coincide con diseño web) ---
    // Borde superior azul (border-t-8 border-blue-900)
    doc.setFillColor(...colorBlue900);
    doc.rect(0, 0, pageWidth, 3, 'F');
    
    yPos = 10;
    
    // Left side: LOGO
    if (logoImg) {
        try {
            const logoWidth = 35; 
            const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
            doc.addImage(logoImg, 'PNG', margin, yPos, logoWidth, logoHeight);
        } catch (e) {
            console.error(e);
            doc.setFontSize(20);
            doc.setTextColor(...colorBlue900);
            doc.setFont('helvetica', 'bold');
            doc.text("SOFIMAS", margin, yPos + 8);
        }
    } else {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorBlue900);
        doc.text("SOFIMAS", margin, yPos + 8);
    }

    // Right side (text-right)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorBlue900);
    doc.text("DICTAMEN JURÍDICO", pageWidth - margin, yPos + 10, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorSlate500);
    doc.text(FIXED_COMPANY, pageWidth - margin, yPos + 14, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(...colorSlate400);
    doc.text(formatLongDate(formData.fechaDocumento), pageWidth - margin, yPos + 18, { align: 'right' });

    yPos += 26;
    
    // Línea separadora (border-b border-gray-100)
    doc.setDrawColor(...colorSlate100);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;


    // --- I. IDENTIFICACIÓN ---
    
    // Block 1: Denominación (bg-slate-50 p-4 rounded-lg border-l-4 border-blue-900)
    const denomLines = doc.splitTextToSize(formData.denominacion || '', contentWidth - 10);
    const denomHeight = Math.max(14, (denomLines.length * 5) + 6);
    drawBlock("Denominación de la Sociedad", formData.denominacion, margin, yPos, contentWidth, denomHeight, colorBlue900, true);
    yPos += denomHeight + 2;

    // Block 2: Objetivo (bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300)
    const objLines = doc.splitTextToSize(`"${formData.objetivo}"`, contentWidth - 10).length;
    const objHeight = Math.max(14, (objLines * 3.5) + 6);
    drawBlock("Objetivo del Dictamen", `"${formData.objetivo}"`, margin, yPos, contentWidth, objHeight, colorSlate300, false);
    yPos += objHeight + 4;

    // --- II. ANTECEDENTES ---
    checkPageBreak(60);
    yPos = drawSectionHeader("Antecedentes del Hecho");
    
    const antData = [
        { l: "Escritura", v: formatNumber(formData.ant_escritura) }, 
        { l: "Volumen", v: formatNumber(formData.ant_volumen) },
        { l: "Fecha Pública", v: formatLongDate(formData.ant_fecha) }, 
        { l: "Fedatario", v: `${formData.ant_fedatario} (${formData.ant_num_fedatario || ''})` },
        { l: "Registro Público", v: formData.ant_registro }, 
        { l: "Fecha Registro", v: formatLongDate(formData.ant_fecha_reg) },
        { l: "Lugar Registro", v: formData.ant_lugar_reg },
        { l: "Circunscripción", v: formData.ant_circunscripcion },
        { l: "Duración Soc.", v: formData.ant_duracion },
        { l: "Vigencia", v: formData.ant_vigencia },
        { l: "Domicilio Social", v: formData.ant_domicilio }
    ];

    // Grid de 3 columnas (coincide con: grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2)
    let rowY = yPos;
    const cellW = (contentWidth / 3) - 3;
    
    for (let i = 0; i < antData.length; i += 3) {
        const items = [antData[i], antData[i + 1], antData[i + 2]].filter(Boolean);
        
        const heights = items.map(item => {
            const lines = doc.splitTextToSize(item.v || '-', cellW - 4);
            return Math.max(10, (lines.length * 3) + 5);
        });
        const rowHeight = Math.max(...heights);
        
        // Dibujar cada celda con border-b border-gray-100
        items.forEach((item, col) => {
            const x = margin + (col * (cellW + 4.5));
            
            // Label (text-[10px] uppercase font-bold text-gray-400)
            doc.setFontSize(6);
            doc.setTextColor(...colorSlate400);
            doc.setFont('helvetica', 'bold');
            doc.text(item.l.toUpperCase(), x, rowY + 3);
            
            // Valor (text-sm font-semibold text-slate-700)
            doc.setFontSize(8);
            doc.setTextColor(...colorSlate700);
            doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(item.v || '-', cellW - 4);
            doc.text(lines, x, rowY + 7);
            
            // Línea divisora (border-b border-gray-100)
            doc.setDrawColor(...colorSlate100);
            doc.setLineWidth(0.2);
            doc.line(x, rowY + rowHeight - 1, x + cellW - 2, rowY + rowHeight - 1);
        });
        
        rowY += rowHeight;
    }
    yPos = rowY + 4;


    // --- III. CUADRO ACCIONARIO ---
    checkPageBreak(60);
    yPos = drawSectionHeader("Cuadro Accionario Actual");
    
    // Tabla con bordes redondeados (overflow-hidden rounded-lg border border-slate-200)
    doc.autoTable({
        startY: yPos,
        head: [['Nombre / Razón Social', 'Acciones', 'Cantidad', 'Porcentaje']],
        body: [
            ...shareholders.map(s => [s.name, formatNumber(s.acciones), formatNumber(s.valor), s.porcentaje + '%']),
            ['TOTAL', totalShares.toLocaleString('en-US'), `$${totalAmount.toLocaleString('en-US')}`, `${totalPercentage}%`]
        ],
        theme: 'plain',
        headStyles: { 
            fillColor: colorSlate50, 
            textColor: colorSlate500, 
            fontStyle: 'bold', 
            fontSize: 7,
            halign: 'left',
            cellPadding: 3
        },
        styles: { 
            fontSize: 8, 
            cellPadding: 2.5, 
            textColor: colorSlate900,
            overflow: 'linebreak',
            font: 'helvetica',
            lineColor: colorSlate200,
            lineWidth: 0.1
        },
        columnStyles: {
            0: { cellWidth: 'auto', fontStyle: 'bold' },
            1: { halign: 'center', cellWidth: 25 },
            2: { halign: 'right', cellWidth: 35 },
            3: { halign: 'right', cellWidth: 25, fontStyle: 'bold', textColor: colorBlue900 }
        },
        margin: { left: margin, right: margin },
        tableLineColor: colorSlate200,
        tableLineWidth: 0.2
    });
    yPos = doc.lastAutoTable.finalY + 5;

    // --- OBJETO SOCIAL ---
    if (formData.obj_descripcion || formData.obj_titulos) {
        checkPageBreak(40);
        yPos = drawSectionHeader("Objeto Social");

        // Facultades en grid 2x2 (bg-slate-50 p-3 rounded border border-slate-100)
        const faculties = [
            { l: "Facultad para Títulos de Crédito", v: formData.obj_titulos },
            { l: "Facultad para Arrendamiento", v: formData.obj_arrendamiento },
            { l: "Facultad para Factoraje", v: formData.obj_factoraje },
            { l: "Otros Objetos Sociales", v: formData.obj_otros }
        ];

        let fY = yPos;
        const colW = (contentWidth / 2) - 3;

        for (let i = 0; i < faculties.length; i += 2) {
            const f1 = faculties[i];
            const f2 = faculties[i + 1];
            
            const splitVal1 = doc.splitTextToSize(f1.v || 'No especificado', colW - 8);
            const splitVal2 = f2 ? doc.splitTextToSize(f2.v || 'No especificado', colW - 8) : [];
            
            const h1 = Math.max(14, (splitVal1.length * 3) + 8);
            const h2 = f2 ? Math.max(14, (splitVal2.length * 3) + 8) : 0;
            const rowHeight = Math.max(h1, h2);
            
            checkPageBreak(rowHeight + 5);
            
            // Bloque izquierdo
            const fX1 = margin;
            doc.setFillColor(...colorSlate50);
            doc.roundedRect(fX1, fY, colW, rowHeight, 1, 1, 'F');
            doc.setDrawColor(...colorSlate100);
            doc.roundedRect(fX1, fY, colW, rowHeight, 1, 1, 'S');
            doc.setFontSize(6);
            doc.setTextColor(...colorSlate400);
            doc.setFont('helvetica', 'bold');
            doc.text(f1.l.toUpperCase(), fX1 + 3, fY + 5);
            doc.setFontSize(7);
            doc.setTextColor(...colorSlate700);
            doc.setFont('helvetica', 'bold');
            doc.text(splitVal1, fX1 + 3, fY + 10);
            
            // Bloque derecho
            if (f2) {
                const fX2 = margin + colW + 6;
                doc.setFillColor(...colorSlate50);
                doc.roundedRect(fX2, fY, colW, rowHeight, 1, 1, 'F');
                doc.setDrawColor(...colorSlate100);
                doc.roundedRect(fX2, fY, colW, rowHeight, 1, 1, 'S');
                doc.setFontSize(6);
                doc.setTextColor(...colorSlate400);
                doc.setFont('helvetica', 'bold');
                doc.text(f2.l.toUpperCase(), fX2 + 3, fY + 5);
                doc.setFontSize(7);
                doc.setTextColor(...colorSlate700);
                doc.setFont('helvetica', 'bold');
                doc.text(splitVal2, fX2 + 3, fY + 10);
            }
            
            fY += rowHeight + 3;
        }
        yPos = fY;

        // Objeto Social Principal (bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300)
        if (formData.obj_descripcion) {
            const splitObj = doc.splitTextToSize(`"${formData.obj_descripcion}"`, contentWidth - 10);
            const objHeight = Math.max(14, (splitObj.length * 3.5) + 8);
            checkPageBreak(objHeight + 2);
            drawBlock("Objeto Social Principal", `"${formData.obj_descripcion}"`, margin, yPos, contentWidth, objHeight, colorSlate300, false);
            yPos += objHeight + 4;
        }
    }

    // --- DATOS INSCRITOS ANTE EL SAT ---
    if (formData.sat_rfc || formData.sat_domicilio) {
        checkPageBreak(40);
        yPos = drawSectionHeader("Datos Inscritos ante el SAT");
    
        // Grid 1/3 + 2/3 (coincide con: grid grid-cols-1 md:grid-cols-3)
        const rfcW = (contentWidth / 3) - 2;
        const domW = (contentWidth * 2 / 3) - 2;
        
        const rfcLines = doc.splitTextToSize(formData.sat_rfc || '-', rfcW - 8);
        const domLines = doc.splitTextToSize(formData.sat_domicilio || '-', domW - 8);
        
        const rowHeight = Math.max(14, Math.max(rfcLines.length, domLines.length) * 3.5 + 8);
        
        // RFC Block
        drawInfoBlock("RFC", formData.sat_rfc, margin, yPos, rfcW, rowHeight);
        
        // Domicilio Block
        doc.setFillColor(...colorSlate50);
        doc.roundedRect(margin + rfcW + 4, yPos, domW, rowHeight, 1, 1, 'F');
        doc.setDrawColor(...colorSlate100);
        doc.roundedRect(margin + rfcW + 4, yPos, domW, rowHeight, 1, 1, 'S');
        doc.setFontSize(6);
        doc.setTextColor(...colorSlate500);
        doc.setFont('helvetica', 'bold');
        doc.text("DOMICILIO FISCAL", margin + rfcW + 7, yPos + 4);
        doc.setFontSize(7);
        doc.setTextColor(...colorSlate700);
        doc.setFont('helvetica', 'normal');
        doc.text(domLines, margin + rfcW + 7, yPos + 9);
        
        yPos += rowHeight + 3;
    
        // Actividad Económica (full width)
        if (formData.sat_actividad) {
            const actLines = doc.splitTextToSize(formData.sat_actividad || '', contentWidth - 8);
            const actH = Math.max(14, (actLines.length * 3.5) + 8);
            checkPageBreak(actH);
            
            doc.setFillColor(...colorSlate50);
            doc.roundedRect(margin, yPos, contentWidth, actH, 1, 1, 'F');
            doc.setDrawColor(...colorSlate100);
            doc.roundedRect(margin, yPos, contentWidth, actH, 1, 1, 'S');
            doc.setFontSize(6);
            doc.setTextColor(...colorSlate500);
            doc.setFont('helvetica', 'bold');
            doc.text("ACTIVIDAD ECONÓMICA", margin + 3, yPos + 4);
            doc.setFontSize(7);
            doc.setTextColor(...colorSlate700);
            doc.setFont('helvetica', 'normal');
            doc.text(actLines, margin + 3, yPos + 9);
            
            yPos += actH + 3;
        }
    }


    // --- IV. REPRESENTACIÓN LEGAL ---
    checkPageBreak(50);
    yPos = drawSectionHeader("Representación Legal");

    // Grid de 2 columnas para representantes (coincide con diseño web)
    for (let i = 0; i < reps.length; i += 2) {
        const rep1 = reps[i];
        const rep2 = reps[i+1];
        
        const getRepHeight = (r) => {
            if (!r) return 0;
            const typeLines = r.tipo_poderes ? doc.splitTextToSize(r.tipo_poderes, (contentWidth/2) - 15) : [];
            const domLines = r.domicilio ? doc.splitTextToSize(r.domicilio, (contentWidth/2) - 15) : [];
            return 50 + (typeLines.length * 3) + (domLines.length * 3) + 25;
        };

        const h1 = getRepHeight(rep1);
        const h2 = getRepHeight(rep2);
        const rowHeight = Math.max(h1, h2);

        checkPageBreak(rowHeight + 10);
        
        // Función para dibujar tarjeta de representante (p-4 bg-slate-50 rounded-lg border border-slate-100)
        const drawRepCard = (r, x, w, h) => {
            if (!r) return;
            
            // Background con bordes redondeados
            doc.setFillColor(...colorSlate50);
            doc.roundedRect(x, yPos, w, h, 2, 2, 'F');
            doc.setDrawColor(...colorSlate100);
            doc.roundedRect(x, yPos, w, h, 2, 2, 'S');

            // Badge de cargo (absolute top-0 right-0 p-2 bg-blue-900 text-white)
            const cargoText = (r.cargo || 'SIN CARGO').toUpperCase();
            doc.setFontSize(5);
            const cargoW = doc.getTextWidth(cargoText) + 6;
            doc.setFillColor(...colorBlue900);
            doc.roundedRect(x + w - cargoW - 1, yPos + 1, cargoW, 5, 0, 0, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(cargoText, x + w - cargoW/2 - 1, yPos + 4, { align: 'center' });

            // Nombre (text-lg font-bold text-blue-900)
            doc.setTextColor(...colorBlue900);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(r.name || '', x + 4, yPos + 9);
            
            // Campos de datos
            let cY = yPos + 14;
            doc.setFontSize(7);
            
            // RFC
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text("RFC:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.text(r.rfc || '-', x + 14, cY);
            cY += 3.5;
            
            // ID Oficial
            doc.setFont('helvetica', 'bold');
            doc.text("ID Oficial:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.text(r.id_oficial || '-', x + 20, cY);
            cY += 3.5;
            
            // CURP
            doc.setFont('helvetica', 'bold');
            doc.text("CURP:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.text(r.curp || '-', x + 16, cY);
            cY += 3.5;
            
            // Domicilio con ícono
            const domLines = doc.splitTextToSize(r.domicilio || '-', w - 10);
            doc.text(domLines, x + 4, cY);
            cY += (domLines.length * 3.5) + 2;

            // Línea divisora (mt-2 pt-2 border-t border-slate-200)
            doc.setDrawColor(...colorSlate200);
            doc.setLineWidth(0.2);
            doc.line(x + 4, cY, x + w - 4, cY);
            cY += 4;
            
            // Sección Poderes (text-[10px] font-bold text-slate-400 uppercase)
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colorSlate400);
            doc.text("PODERES", x + 4, cY);
            cY += 4;
            
            // Texto de poderes (text-xs text-slate-800 italic)
            if (r.tipo_poderes) {
                const typeLines = doc.splitTextToSize(r.tipo_poderes, w - 10);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(...colorSlate700);
                doc.text(typeLines, x + 4, cY);
                cY += (typeLines.length * 3) + 3;
            }
            
            // Datos de escritura en grid (text-xs text-slate-600)
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSlate600);
            
            if (r.tipo_escritura) {
                doc.setTextColor(...colorBlue900);
                doc.setFont('helvetica', 'bold');
                doc.text("Tipo:", x + 4, cY);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...colorSlate600);
                doc.text(r.tipo_escritura, x + 14, cY);
                cY += 3;
            }

            // Fila: Escritura | Volumen
            doc.setTextColor(...colorBlue900);
            doc.setFont('helvetica', 'bold');
            doc.text("Escritura:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSlate600);
            doc.text(formatNumber(r.escritura) || '-', x + 20, cY);
            
            doc.setTextColor(...colorBlue900);
            doc.setFont('helvetica', 'bold');
            doc.text("Volumen:", x + w/2, cY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSlate600);
            doc.text(formatNumber(r.volumen) || '-', x + w/2 + 15, cY);
            cY += 3;

            // Fila: Fecha | Fecha Reg
            doc.setTextColor(...colorBlue900);
            doc.setFont('helvetica', 'bold');
            doc.text("Fecha:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSlate600);
            doc.text(formatLongDate(r.fecha) || '-', x + 16, cY);
            cY += 3;

            // Fedatario (full width)
            doc.setTextColor(...colorBlue900);
            doc.setFont('helvetica', 'bold');
            doc.text("Fedatario:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSlate600);
            doc.text(r.fedatario || '-', x + 20, cY);
            cY += 3;
            
            // Registro
            doc.setTextColor(...colorBlue900);
            doc.setFont('helvetica', 'bold');
            doc.text("Registro:", x + 4, cY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSlate600);
            const regLines = doc.splitTextToSize(r.registro || '-', w - 25);
            doc.text(regLines, x + 18, cY);
        };

        const cardWidth = (contentWidth / 2) - 3;
        
        drawRepCard(rep1, margin, cardWidth, rowHeight);
        if (rep2) drawRepCard(rep2, margin + cardWidth + 6, cardWidth, rowHeight);
        
        yPos += rowHeight + 5;
    }


    // --- V. IDENTIFICACIÓN DE LA ADMINISTRACIÓN ---
    checkPageBreak(60);
    yPos = drawSectionHeader("Identificación de la Administración");

    doc.autoTable({
        startY: yPos,
        head: [['Nombre', 'Cargo', 'Accionista']],
        body: admins.map(a => [
            a.name, 
            a.cargo, 
            a.es_socio === 'si' ? (a.porcentaje && a.porcentaje !== 'N/A' ? `SÍ (${a.porcentaje}%)` : 'SÍ') : 'NO'
        ]),
        theme: 'plain',
        headStyles: { 
            fillColor: colorSlate50, 
            textColor: colorSlate500, 
            fontStyle: 'bold', 
            fontSize: 7,
            halign: 'left',
            cellPadding: 3
        },
        styles: { 
            fontSize: 7, 
            cellPadding: 2.5, 
            textColor: colorSlate900,
            overflow: 'linebreak',
            font: 'helvetica',
            lineColor: colorSlate100,
            lineWidth: 0.1
        },
        margin: { left: margin, right: margin }
    });
    yPos = doc.lastAutoTable.finalY + 5;


    // --- VI. ESCRITURAS DICTAMINADAS ---
    checkPageBreak(60);
    yPos = drawSectionHeader("Escrituras Dictaminadas");

    // Tarjetas de escrituras (bg-slate-50 p-4 rounded-lg border border-slate-100)
    deeds.forEach((deed, idx) => {
        const cardHeight = 28;
        checkPageBreak(cardHeight + 5);
        
        // Card Background con bordes redondeados
        doc.setFillColor(...colorSlate50);
        doc.roundedRect(margin, yPos, contentWidth, cardHeight, 1.5, 1.5, 'F');
        doc.setDrawColor(...colorSlate100);
        doc.roundedRect(margin, yPos, contentWidth, cardHeight, 1.5, 1.5, 'S');

        let rowY = yPos + 5;

        // Tipo (text-xs font-bold text-blue-900 uppercase)
        doc.setFontSize(7);
        doc.setTextColor(...colorBlue900);
        doc.setFont('helvetica', 'bold');
        doc.text((deed.tipo || 'Escritura').toUpperCase(), margin + 4, rowY);
        
        rowY += 5;

        // Grid 2 columnas para datos
        const col1X = margin + 4;
        const col2X = margin + (contentWidth / 2);
        
        // Número | Fecha
        doc.setFontSize(6.5);
        doc.setTextColor(...colorSlate500);
        doc.setFont('helvetica', 'normal');
        doc.text("Número:", col1X, rowY);
        doc.setTextColor(...colorSlate700);
        doc.text(formatNumber(deed.numero) || '-', col1X + 14, rowY);
        
        doc.setTextColor(...colorSlate500);
        doc.text("Fecha:", col2X, rowY);
        doc.setTextColor(...colorSlate700);
        doc.text(formatLongDate(deed.fecha) || '-', col2X + 12, rowY);
        
        rowY += 4;

        // Fedatario (full width)
        doc.setTextColor(...colorSlate500);
        doc.text("Fedatario:", col1X, rowY);
        doc.setTextColor(...colorSlate700);
        doc.text(deed.fedatario || '-', col1X + 17, rowY);
        
        rowY += 4;

        // Registro | Lugar
        doc.setTextColor(...colorSlate500);
        doc.text("Registro:", col1X, rowY);
        doc.setTextColor(...colorSlate700);
        doc.text(deed.registro || '-', col1X + 15, rowY);
        
        doc.setTextColor(...colorSlate500);
        doc.text("Lugar:", col2X, rowY);
        doc.setTextColor(...colorSlate700);
        doc.text(deed.lugar || '-', col2X + 12, rowY);

        yPos += cardHeight + 3;
    });
    yPos += 2;


    // --- VII. DOCUMENTACIÓN DICTAMINADA ---
    checkPageBreak(80);
    yPos = drawSectionHeader("Documentación Dictaminada");
    
    // Grid de documentos (grid grid-cols-2 md:grid-cols-3 gap-2)
    const docItems = [
        { l: "Comp. Domicilio", v: formData.doc_comp_dom },
        { l: "Acta Constitutiva", v: formData.doc_acta_const },
        { l: "RPP Acta", v: formData.doc_rpp_acta },
        { l: "RFC Constancia", v: formData.doc_rfc_const },
        { l: "Otras Escrituras", v: formData.doc_otras_esc },
        { l: "RPP Otras", v: formData.doc_rpp_otras }
    ];

    let dx = margin;
    let dy = yPos;
    const docW = (contentWidth / 3) - 3;
    
    docItems.forEach((d, i) => {
        if (i > 0 && i % 3 === 0) {
            dx = margin;
            dy += 14;
        }
        
        // Bloque centrado (bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center text-center)
        doc.setFillColor(...colorSlate50);
        doc.roundedRect(dx, dy, docW, 12, 1, 1, 'F');
        doc.setDrawColor(...colorSlate100);
        doc.roundedRect(dx, dy, docW, 12, 1, 1, 'S');
        
        // Label (text-[10px] uppercase text-slate-500 font-bold)
        doc.setFontSize(5.5);
        doc.setTextColor(...colorSlate500);
        doc.setFont('helvetica', 'bold');
        doc.text(d.l.toUpperCase(), dx + docW/2, dy + 4, { align: 'center' });
        
        // Valor (text-sm font-bold) con color según valor
        doc.setFontSize(8);
        if (d.v && d.v.toUpperCase() === 'SI') {
            doc.setTextColor(...colorGreen600);
        } else {
            doc.setTextColor(...colorSlate400);
        }
        doc.setFont('helvetica', 'bold');
        doc.text(d.v || '-', dx + docW/2, dy + 9, { align: 'center' });
        
        dx += docW + 4.5;
    });
    yPos = dy + 17;

    // Tabla de personas documentadas
    if (docPersons.length > 0) {
        checkPageBreak(40);
        doc.autoTable({
            startY: yPos,
            head: [['Persona', 'Identificación', 'CURP']],
            body: docPersons.map(p => [p.name, p.identificacion, p.curp]),
            theme: 'plain',
            headStyles: { 
                fillColor: colorSlate50, 
                textColor: colorSlate500, 
                fontSize: 6, 
                fontStyle: 'bold',
                cellPadding: 2
            },
            styles: { 
                fontSize: 7, 
                textColor: colorSlate700, 
                cellPadding: 2,
                lineColor: colorSlate100,
                lineWidth: 0.1
            },
            margin: { left: margin, right: margin }
        });
        yPos = doc.lastAutoTable.finalY + 5;
    }


    // --- VIII. OBSERVACIONES ---
    if (formData.obs_sociedad || formData.obs_rep_legal) {
        checkPageBreak(30);
        yPos = drawSectionHeader("Observaciones");

        // Bloques con border-l-4 border-slate-300
        if (formData.obs_sociedad) {
            const obsLines1 = doc.splitTextToSize(`"${formData.obs_sociedad}"`, contentWidth - 10);
            const obsHeight1 = Math.max(14, (obsLines1.length * 3.5) + 8);
            checkPageBreak(obsHeight1);
            drawBlock("De la Sociedad", `"${formData.obs_sociedad}"`, margin, yPos, contentWidth, obsHeight1, colorSlate300, false);
            yPos += obsHeight1 + 3;
        }
        
        if (formData.obs_rep_legal) {
            const obsLines2 = doc.splitTextToSize(`"${formData.obs_rep_legal}"`, contentWidth - 10);
            const obsHeight2 = Math.max(14, (obsLines2.length * 3.5) + 8);
            checkPageBreak(obsHeight2);
            drawBlock("Del Representante Legal", `"${formData.obs_rep_legal}"`, margin, yPos, contentWidth, obsHeight2, colorSlate300, false);
            yPos += obsHeight2 + 3;
        }
    }


    // --- IX. CUESTIONAMIENTOS ---
    checkPageBreak(30);
    yPos = drawSectionHeader("Cuestionamientos");
    
    // Items con diseño: flex justify-between items-center text-xs py-2 border-b border-slate-300
    for (let i = 1; i <= 13; i++) {
        const question = getQuestionLabel(i);
        const answer = formData[`q${i}`] || '-';
        
        // Pregunta (text-slate-600 leading-tight)
        doc.setFontSize(7);
        doc.setTextColor(...colorSlate600);
        doc.setFont('helvetica', 'normal');
        
        const qLines = doc.splitTextToSize(`${i}. ${question}`, contentWidth - 20);
        doc.text(qLines, margin + 2, yPos);
        
        // Respuesta (font-bold text-blue-900 o text-red-500)
        doc.setFont('helvetica', 'bold');
        if (answer === 'No' || answer === 'NO') {
            doc.setTextColor(239, 68, 68); // red-500
        } else {
            doc.setTextColor(...colorBlue900);
        }
        doc.text(answer, pageWidth - margin - 2, yPos, { align: 'right' });
        
        // Línea divisora (border-b border-slate-300)
        const lineY = yPos + (qLines.length * 3) + 1;
        doc.setDrawColor(...colorSlate300);
        doc.setLineWidth(0.2);
        doc.line(margin, lineY, pageWidth - margin, lineY);
        
        yPos = lineY + 3;
        checkPageBreak(12);
    }
    
    yPos += 5;


    // --- X. CONCLUSIÓN ---
    checkPageBreak(60);
    yPos = drawSectionHeader("Conclusión");

    // Bloque de conclusión (bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300)
    const concLines = doc.splitTextToSize(`"${formData.conclusion || 'Sin conclusión definida.'}"`, contentWidth - 10).length;
    const concHeight = Math.max(14, (concLines * 3.5) + 8);
    checkPageBreak(concHeight);
    
    drawBlock("Conclusión", `"${formData.conclusion || 'Sin conclusión definida.'}"`, margin, yPos, contentWidth, concHeight, colorSlate300, false);
    
    yPos += concHeight + 15;


    // --- FIRMA ---
    checkPageBreak(40);
    
    // Línea de firma centrada (pt-12 flex flex-col items-center)
    const signatureY = yPos + 10;
    doc.setDrawColor(...colorSlate400);
    doc.setLineWidth(0.3);
    doc.line(pageWidth/2 - 32, signatureY, pageWidth/2 + 32, signatureY);
    
    // Empresa (text-[10px] text-slate-500 uppercase tracking-widest)
    doc.setFontSize(6);
    doc.setTextColor(...colorSlate500);
    doc.setFont('helvetica', 'normal');
    doc.text("SOFIMAS CONSULTORES DEL NOROESTE S.A. DE C.V., SOFOM ENR", pageWidth/2, signatureY + 4, { align: 'center' });
    
    // Nombre firmante (text-sm font-bold text-slate-900)
    doc.setFontSize(9);
    doc.setTextColor(...colorSlate900);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.nombre_firmante || '', pageWidth/2, signatureY + 9, { align: 'center' });


    // --- FOOTER (Pages) ---
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer similar al diseño web (bg-slate-50 px-8 py-4 border-t border-slate-100)
        const footerY = doc.internal.pageSize.getHeight() - 12;
        
        doc.setFontSize(6);
        doc.setTextColor(...colorSlate400);
        doc.setFont('helvetica', 'normal');
        doc.text(FIXED_COMPANY, margin, footerY);
        
        doc.setFont('helvetica', 'normal');
        doc.text("Documento generado para fines de evaluación de crédito", pageWidth/2, footerY, { align: 'center' });
        
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    }

    doc.save(`Dictamen_SOFIMAS_${formData.denominacion.substring(0,15)}.pdf`);
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
        if (newLists.reps.length === 0) newLists.reps = [{ ...initialRep, id: 1, _docPersonId: 1 }];
        if (newLists.deeds.length === 0) newLists.deeds = [initialDeed];
        
        // Vincular representantes con docPersons automáticamente
        // Generar docPersons a partir de los representantes importados
        let maxDocPersonId = newLists.docPersons.length > 0 
            ? Math.max(...newLists.docPersons.map(p => p.id || 0)) 
            : 0;
        
        const repsWithLinks = newLists.reps.map((rep, idx) => {
            const docPersonId = maxDocPersonId + idx + 1;
            return { ...rep, _docPersonId: docPersonId };
        });
        
        // Crear entradas de docPersons para cada representante
        const docPersonsFromReps = repsWithLinks.map(rep => ({
            ...initialDocPerson,
            id: rep._docPersonId,
            _repId: rep.id,
            name: rep.name || '',
            sujeto: 'Representante Legal',
            identificacion: rep.id_oficial || '',
            curp: rep.curp || '',
            rfc: rep.rfc || ''
        }));
        
        // Combinar docPersons existentes (si vienen en CSV) con los generados de representantes
        // Filtrar los que ya podrían estar vinculados para evitar duplicados
        const existingDocPersons = newLists.docPersons.filter(p => !p._repId);
        const finalDocPersons = [...existingDocPersons, ...docPersonsFromReps];
        
        if (finalDocPersons.length === 0) {
            finalDocPersons.push({ ...initialDocPerson, id: 1, _repId: 1, sujeto: 'Representante Legal' });
        }
        
        setFormData(newFormData);
        setShareholders(newLists.shareholders);
        setReps(repsWithLinks);
        setDocPersons(finalDocPersons);
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

  const handlePrint = () => {
    // Robust image loading strategy
    fetch(logo)
      .then(res => {
         if (!res.ok) throw new Error("Fetch failed");
         return res.blob();
      })
      .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
              const img = new Image();
              img.src = reader.result;
              img.onload = () => generarPDF(img);
          };
          reader.readAsDataURL(blob);
      })
      .catch(e => {
         console.warn("Fetch failed, trying direct Image load", e);
         const img = new Image();
         img.crossOrigin = 'Anonymous';
         img.src = logo;
         img.onload = () => generarPDF(img);
         img.onerror = () => generarPDF(null);
      });
  };

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

  // --- NUEVO DISEÑO CON SIDEBAR ---
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
        
        {/* SIDEBAR EDITABLE */}
        <div className="w-[400px] bg-white border-r border-slate-200 flex flex-col h-full print:hidden z-20 shadow-xl shrink-0">
             {/* Header Sidebar */}
             <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="text-[#1a4580] font-bold text-sm uppercase">Editar Datos</h2>
                    <p className="text-[10px] text-slate-500">Llene la información requerida.</p>
                </div>
                <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-slate-600">
                    <ArrowLeft size={16} />
                </button>
             </div>
             
             {/* Scrollable Form Content */}
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                {/* I. Denominación */}
                <SectionToggle title="I. Denominación" isOpen={sections.denominacion} onToggle={() => toggleSection('denominacion')} isInvalid={sectionInvalid.denominacion}>
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Fecha Documento</label>
                        <input type="date" name="fechaDocumento" value={formData.fechaDocumento} onChange={handleInputChange} className={getInputClass(formData.fechaDocumento)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Denominación</label>
                        <textarea className={getTextareaClass(formData.denominacion)} name="denominacion" value={formData.denominacion} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* II. Objetivo */}
                <SectionToggle title="II. Objetivo" isOpen={sections.objetivo} onToggle={() => toggleSection('objetivo')} isInvalid={sectionInvalid.objetivo}>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Objetivo</label>
                        <textarea className={getTextareaClass(formData.objetivo) + " h-24"} name="objetivo" value={formData.objetivo} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* III. Antecedentes */}
                <SectionToggle title="III. Antecedentes" isOpen={sections.antecedentes} onToggle={() => toggleSection('antecedentes')} isInvalid={sectionInvalid.antecedentes}>
                    <div className="grid grid-cols-2 gap-2">
                        <input className={getInputClass(formData.ant_escritura)} placeholder="Escritura" name="ant_escritura" value={formData.ant_escritura} onChange={handleInputChange} />
                        <input className={getInputClass(formData.ant_volumen)} placeholder="Volumen" name="ant_volumen" value={formData.ant_volumen} onChange={handleInputChange} />
                    </div>
                    <input className={getInputClass(formData.ant_fecha)} type="date" placeholder="Fecha Escritura" name="ant_fecha" value={formData.ant_fecha} onChange={handleInputChange} />
                    <input className={getInputClass(formData.ant_fedatario)} placeholder="Fedatario" name="ant_fedatario" value={formData.ant_fedatario} onChange={handleInputChange} />
                    <input className={getInputClass(formData.ant_num_fedatario)} placeholder="No. Fedatario" name="ant_num_fedatario" value={formData.ant_num_fedatario} onChange={handleInputChange} />
                    <input className={getInputClass(formData.ant_circunscripcion)} placeholder="Circunscripción" name="ant_circunscripcion" value={formData.ant_circunscripcion} onChange={handleInputChange} />
                    <input className={getInputClass(formData.ant_registro)} placeholder="Registro Público" name="ant_registro" value={formData.ant_registro} onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-2">
                        <input className={getInputClass(formData.ant_fecha_reg)} type="date" placeholder="Fecha Reg." name="ant_fecha_reg" value={formData.ant_fecha_reg} onChange={handleInputChange} />
                        <input className={getInputClass(formData.ant_lugar_reg)} placeholder="Lugar Reg." name="ant_lugar_reg" value={formData.ant_lugar_reg} onChange={handleInputChange} />
                    </div>
                    <input className={getInputClass(formData.ant_domicilio)} placeholder="Domicilio" name="ant_domicilio" value={formData.ant_domicilio} onChange={handleInputChange} />
                </SectionToggle>

                {/* III. Cuadro Accionario */}
                <SectionToggle title="III. Cuadro Accionario" isOpen={sections.accionistas} onToggle={() => toggleSection('accionistas')} isInvalid={sectionInvalid.accionistas}>
                     {shareholders.map((person, index) => (
                         <div key={person.id} className="bg-white p-3 border border-slate-200 rounded mb-2 relative">
                             <button className="absolute top-2 right-2 text-red-400 hover:text-red-600" onClick={() => removeItem(setShareholders, shareholders, person.id)}><Trash2 size={12}/></button>
                             <input className={getInputClass(person.name) + " mb-2 font-bold"} placeholder="Nombre Accionista" value={person.name} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'name', e.target.value)} />
                             <div className="grid grid-cols-3 gap-2">
                                 <input className={getInputClass(person.acciones)} placeholder="Acciones" value={person.acciones} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'acciones', e.target.value)} />
                                 <input className={getInputClass(person.valor)} placeholder="Valor ($)" value={person.valor} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'valor', e.target.value)} />
                                 <input className={getInputClass(person.porcentaje)} placeholder="%" type="number" value={person.porcentaje} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'porcentaje', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100" onClick={() => addItem(setShareholders, shareholders, initialShareholder)}>+ Agregar Accionista</button>
                     <div className={`mt-2 text-center text-xs p-1 rounded ${Math.abs(totalPercentage - 100) < 0.1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        Total: {totalPercentage}%
                     </div>
                </SectionToggle>

                 {/* III. Objeto Social y SAT */}
                 <SectionToggle title="III. Objeto Social y SAT" isOpen={sections.objeto} onToggle={() => toggleSection('objeto')} isInvalid={sectionInvalid.objeto}>
                    <div className="space-y-1">
                        <input className={getInputClass(formData.obj_titulos)} placeholder="Fac. Títulos" name="obj_titulos" value={formData.obj_titulos} onChange={handleInputChange} />
                        <input className={getInputClass(formData.obj_arrendamiento)} placeholder="Fac. Arrendamiento" name="obj_arrendamiento" value={formData.obj_arrendamiento} onChange={handleInputChange} />
                        <input className={getInputClass(formData.obj_factoraje)} placeholder="Fac. Factoraje" name="obj_factoraje" value={formData.obj_factoraje} onChange={handleInputChange} />
                        <textarea className={getTextareaClass(formData.obj_descripcion) + " h-20"} placeholder="Descripción Objeto" name="obj_descripcion" value={formData.obj_descripcion} onChange={handleInputChange} />
                    </div>
                    <div className="border-t border-slate-200 my-1 pt-1 space-y-1">
                        <input className={getInputClass(formData.sat_rfc)} placeholder="SAT RFC" name="sat_rfc" value={formData.sat_rfc} onChange={handleInputChange} />
                        <textarea className={getTextareaClass(formData.sat_domicilio)} placeholder="SAT Domicilio" name="sat_domicilio" value={formData.sat_domicilio} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* IV. Representación Legal */}
                <SectionToggle title="IV. Representación Legal" isOpen={sections.representacion} onToggle={() => toggleSection('representacion')} isInvalid={sectionInvalid.representacion}>
                     {reps.map((rep) => (
                         <div key={rep.id} className="bg-white p-3 border border-slate-200 rounded mb-2 relative">
                             <div className="font-bold text-[10px] text-blue-800 mb-1">REPRESENTANTE #{rep.id}</div>
                             <button className="absolute top-2 right-2 text-red-400" onClick={() => removeRepresentante(rep.id)}><Trash2 size={12}/></button>
                             
                             <div className="grid grid-cols-2 gap-2 mb-2">
                                <input className={getInputClass(rep.name)} placeholder="Nombre" value={rep.name} onChange={(e) => updateRepresentante(rep.id, 'name', e.target.value)} />
                                <input className={getInputClass(rep.cargo)} placeholder="Cargo" value={rep.cargo} onChange={(e) => updateRepresentante(rep.id, 'cargo', e.target.value)} />
                             </div>
                             <div className="grid grid-cols-2 gap-2 mb-2">
                                <input className={getInputClass(rep.rfc)} placeholder="RFC" value={rep.rfc} onChange={(e) => updateRepresentante(rep.id, 'rfc', e.target.value)} />
                                <input className={getInputClass(rep.id_oficial)} placeholder="ID Oficial" value={rep.id_oficial} onChange={(e) => updateRepresentante(rep.id, 'id_oficial', e.target.value)} />
                             </div>
                             <div className="grid grid-cols-1 gap-2 mb-2">
                                <input className={getInputClass(rep.curp)} placeholder="CURP" value={rep.curp} onChange={(e) => updateRepresentante(rep.id, 'curp', e.target.value)} />
                             </div>
                             <input className={getInputClass(rep.domicilio) + " mb-2"} placeholder="Domicilio" value={rep.domicilio} onChange={(e) => updateRepresentante(rep.id, 'domicilio', e.target.value)} />
                             
                             <div className="bg-slate-50 p-2 rounded text-xs space-y-2">
                                <label className="font-bold text-slate-400 block">Poderes y Escritura</label>
                                
                                <textarea className={getTextareaClass(rep.tipo_poderes)} placeholder="Tipo de Poderes" value={rep.tipo_poderes} onChange={(e) => updateRepresentante(rep.id, 'tipo_poderes', e.target.value)} />
                                
                                <input className={getInputClass(rep.tipo_escritura)} placeholder="Tipo de Escritura (Ej. Acta Constitutiva / Poder Notarial)" value={rep.tipo_escritura} onChange={(e) => updateRepresentante(rep.id, 'tipo_escritura', e.target.value)} />

                                <div className="grid grid-cols-2 gap-2">
                                    <input className={getInputClass(rep.escritura)} placeholder="Num. Escritura" value={rep.escritura} onChange={(e) => updateRepresentante(rep.id, 'escritura', e.target.value)} />
                                    <input className={getInputClass(rep.volumen)} placeholder="Volumen" value={rep.volumen} onChange={(e) => updateRepresentante(rep.id, 'volumen', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                     <input className={getInputClass(rep.fecha)} type="date" placeholder="Fecha Escritura" value={rep.fecha} onChange={(e) => updateRepresentante(rep.id, 'fecha', e.target.value)} />
                                     <input className={getInputClass(rep.fecha_registro)} type="date" placeholder="Fecha Registro" value={rep.fecha_registro} onChange={(e) => updateRepresentante(rep.id, 'fecha_registro', e.target.value)} />
                                </div>
                                <input className={getInputClass(rep.fedatario)} placeholder="Fedatario" value={rep.fedatario} onChange={(e) => updateRepresentante(rep.id, 'fedatario', e.target.value)} />
                                <input className={getInputClass(rep.registro)} placeholder="Datos Registro Público" value={rep.registro} onChange={(e) => updateRepresentante(rep.id, 'registro', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100" onClick={addRepresentante}>+ Agregar Representante</button>
                </SectionToggle>

                {/* V. Administración */}
                <SectionToggle title="V. Administración" isOpen={sections.administracion} onToggle={() => toggleSection('administracion')} isInvalid={sectionInvalid.administracion}>
                     {admins.map((admin) => (
                         <div key={admin.id} className="bg-white p-3 border border-slate-200 rounded mb-2 relative">
                             <button className="absolute top-2 right-2 text-red-400" onClick={() => removeItem(setAdmins, admins, admin.id)}><Trash2 size={12}/></button>
                             <input className={getInputClass(admin.name) + " mb-2 font-bold"} placeholder="Nombre Administrador" value={admin.name} onChange={(e) => updateItem(setAdmins, admins, admin.id, 'name', e.target.value)} />
                             <div className="grid grid-cols-2 gap-2">
                                 <input className={getInputClass(admin.cargo)} placeholder="Cargo" value={admin.cargo} onChange={(e) => updateItem(setAdmins, admins, admin.id, 'cargo', e.target.value)} />
                                 <div className="flex gap-2">
                                     <div className="flex flex-col flex-1">
                                        <label className="text-[10px] text-slate-500">¿Es Socio?</label>
                                        <select className={getSmallSelectClass(admin.es_socio) + " w-full"} value={admin.es_socio} onChange={(e) => updateItem(setAdmins, admins, admin.id, 'es_socio', e.target.value)}>
                                            <option value="si">SI</option><option value="no">NO</option>
                                        </select>
                                     </div>
                                     {admin.es_socio === 'si' && (
                                         <div className="flex flex-col w-20">
                                            <label className="text-[10px] text-slate-500">% Acc.</label>
                                            <input className={getSmallSelectClass(admin.porcentaje)} placeholder="%" value={admin.porcentaje} onChange={(e) => updateItem(setAdmins, admins, admin.id, 'porcentaje', e.target.value)} />
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                     ))}
                     <button className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100" onClick={() => addItem(setAdmins, admins, initialAdmin)}>+ Agregar Administrador</button>
                </SectionToggle>

                {/* V. Observaciones */}
                <SectionToggle title="V. Observaciones" isOpen={sections.observaciones} onToggle={() => toggleSection('observaciones')} isInvalid={sectionInvalid.observaciones}>
                    <div className="space-y-2">
                        <textarea className={getTextareaClass(formData.obs_sociedad) + " h-20"} placeholder="Obs. Sociedad" name="obs_sociedad" value={formData.obs_sociedad} onChange={handleInputChange} />
                        <textarea className={getTextareaClass(formData.obs_rep_legal) + " h-20"} placeholder="Obs. Rep. Legal" name="obs_rep_legal" value={formData.obs_rep_legal} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* VI. Cuestionamientos */}
                <SectionToggle title="VI. Cuestionamientos" isOpen={sections.cuestionamientos} onToggle={() => toggleSection('cuestionamientos')} isInvalid={sectionInvalid.cuestionamientos}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => (
                        <div key={n} className="flex justify-between items-center mb-1 text-xs border-b border-slate-50 py-1">
                           <span className="text-slate-600 w-3/4 leading-tight">
                             {n}. {getQuestionLabel(n)}
                           </span>
                           <select className={getSmallSelectClass(formData[`q${n}`]) + " w-16"} name={`q${n}`} value={formData[`q${n}`]} onChange={handleInputChange}>
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
                                    <label className="text-[10px] text-slate-500">{label}</label>
                                    <select className={getSmallSelectClass(formData[keys[idx]])} name={keys[idx]} value={formData[keys[idx]]} onChange={handleInputChange}>
                                        <option value=""></option><option>SI</option><option>NO</option><option>N/A</option>
                                    </select>
                                </div>
                             )
                        })}
                     </div>
                     
                     <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase border-t border-slate-200 pt-2">Personas Identificadas</div>
                     {docPersons.map((p) => (
                         <div key={p.id} className="bg-white p-2 border border-slate-200 rounded mb-2 relative">
                             <button className="absolute top-1 right-1 text-slate-400 hover:text-red-500" onClick={() => removeItem(setDocPersons, docPersons, p.id)}><Trash2 size={12}/></button>
                             <input className={getInputClass(p.name) + " mb-1 text-xs"} placeholder="Nombre" value={p.name} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'name', e.target.value)} />
                             <div className="flex gap-1">
                                 <input className={getInputClass(p.identificacion) + " text-xs flex-1"} placeholder="ID" value={p.identificacion} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'identificacion', e.target.value)} />
                                 <select className={getSelectClass(p.comp_dom) + " w-16 text-xs"} value={p.comp_dom || ''} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'comp_dom', e.target.value)}>
                                     <option value="">Dom</option><option value="SI">SI</option><option value="NO">NO</option>
                                 </select>
                             </div>
                         </div>
                     ))}
                     <button className="w-full py-1 bg-slate-100 text-slate-600 text-xs rounded hover:bg-slate-200" onClick={() => addItem(setDocPersons, docPersons, initialDocPerson)}>+ Persona</button>
                </SectionToggle>

                {/* IX. Escrituras */}
                 <SectionToggle title="IX. Escrituras Dict." isOpen={sections.escrituras} onToggle={() => toggleSection('escrituras')} isInvalid={sectionInvalid.escrituras}>
                     {deeds.map((deed) => (
                         <div key={deed.id} className="bg-white p-2 border border-slate-200 rounded mb-2 relative text-xs">
                             <button className="absolute top-1 right-1 text-slate-400 hover:text-red-500" onClick={() => removeItem(setDeeds, deeds, deed.id)}><Trash2 size={12}/></button>
                             <div className="space-y-1">
                                 <select className={getSelectClass(deed.tipo) + " w-full"} value={deed.tipo || ''} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'tipo', e.target.value)}>
                                     <option value="">Tipo Escritura...</option><option>Acta Constitutiva</option><option>Acta de Asamblea</option><option>Poderes</option>
                                 </select>
                                 <input className={getInputClass(deed.numero)} placeholder="Numero" value={deed.numero} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'numero', e.target.value)} />
                                 <input className={getInputClass(deed.fecha)} type="date" placeholder="Fecha" value={deed.fecha} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'fecha', e.target.value)} />
                                 <input className={getInputClass(deed.fedatario)} placeholder="Fedatario" value={deed.fedatario} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'fedatario', e.target.value)} />
                                 <input className={getInputClass(deed.lugar)} placeholder="Lugar" value={deed.lugar} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'lugar', e.target.value)} />
                                 <input className={getInputClass(deed.registro)} placeholder="Datos Registro Público" value={deed.registro} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'registro', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="w-full py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100" onClick={() => addItem(setDeeds, deeds, initialDeed)}>+ Escritura</button>
                </SectionToggle>

                {/* X. Conclusión */}
                <SectionToggle title="X. Conclusión y Firma" isOpen={sections.conclusion} onToggle={() => toggleSection('conclusion')} isInvalid={sectionInvalid.conclusion}>
                    <div className="space-y-2">
                        <textarea className={getInputClass(formData.conclusion)} placeholder="Conclusión" name="conclusion" value={formData.conclusion} onChange={handleInputChange} />
                        <label className="text-xs text-slate-500 block">Lugar y Fecha: Hermosillo, Sonora a {formatLongDate(formData.fechaDocumento)}</label>
                        <select className={getSelectClass(formData.nombre_firmante)} name="nombre_firmante" value={formData.nombre_firmante} onChange={handleInputChange}>
                             <option value="">Firmante...</option>
                             {AVAILABLE_SIGNERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </SectionToggle>
            </div>
        </div>

        {/* CONTENIDO DERECHO (Reporte / Preview) */}
        <div className="flex-1 overflow-y-auto bg-gray-100 relative w-full">
             
             {/* Toolbar Flotante */}
             <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 p-4 flex justify-between items-center shadow-sm print:hidden">
                 <div className="flex gap-2">
                    <button onClick={resetForm} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-xs" title="Reiniciar">
                        <RefreshCw size={14} /> Reiniciar
                    </button>
                    <label className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer text-xs" title="Cargar CSV">
                        <Upload size={14} /> Importar
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
                    </label>
                </div>
                 <div className="flex gap-2">
                    <button onClick={handleFileExport} className="py-1 px-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded shadow-sm text-xs font-medium flex items-center gap-2">
                        <Download size={14} /> CSV
                    </button>
                    <button onClick={handlePrint} className="py-1 px-3 bg-blue-900 text-white rounded shadow-sm hover:bg-blue-800 transition-colors text-xs font-bold flex items-center gap-2">
                        <Printer size={14} /> PDF
                    </button>
                 </div>
             </div>

            {/* DOCUMENTO VISUAL (Read-Onlyish styling but still connected to state for updates) */}
             <div className="p-8 print:p-0 max-w-5xl mx-auto">
                <div className="bg-white shadow-xl rounded-sm overflow-hidden border-t-8 border-blue-900 min-h-[1100px]">
                    
                    {/* HEADER */}
                    <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center">
                        <img src={logo} alt="SOFIMAS Logo" className="h-20 w-auto object-contain" />
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <h2 className="text-2xl font-bold text-[#1a3a5c] uppercase tracking-tight">Dictamen Jurídico</h2>
                        <p className="text-sm text-[#1a4580] font-medium">{FIXED_COMPANY}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatLongDate(formData.fechaDocumento)}</p>
                    </div>
                    </div>
                    <div className="border-b border-gray-300 mx-8 mt-4"></div>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="p-8 space-y-4">
                    
                    {/* SECCIÓN I: IDENTIFICACIÓN */}
                    <div className="space-y-3">
                        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-900">
                            <p className="text-[10px] uppercase font-bold text-blue-900 mb-1">Denominación de la Sociedad</p>
                            <div className="text-xl font-bold text-slate-900">{formData.denominacion || <span className="text-gray-300 italic">Sin denominación</span>}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Objetivo del Dictamen</p>
                            <p className="text-sm leading-relaxed italic text-slate-600">"{formData.objetivo || '...'}"</p>
                        </div>
                    </div>

                    {/* SECCIÓN II: ANTECEDENTES */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <Briefcase className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Antecedentes del Hecho</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                            {[
                                { label: "Escritura", val: formatNumber(formData.ant_escritura) },
                                { label: "Volumen", val: formatNumber(formData.ant_volumen) },
                                { label: "Fecha Pública", val: formatLongDate(formData.ant_fecha) },
                                { label: "Fedatario", val: `${formData.ant_fedatario} (${formData.ant_num_fedatario || ''})` },
                                { label: "Registro Público", val: formData.ant_registro },
                                { label: "Fecha Registro", val: formatLongDate(formData.ant_fecha_reg) },
                                { label: "Lugar Registro", val: formData.ant_lugar_reg },
                                { label: "Circunscripción", val: formData.ant_circunscripcion },
                                { label: "Duración Soc.", val: formData.ant_duracion },
                                { label: "Vigencia", val: formData.ant_vigencia },
                                { label: "Domicilio Social", val: formData.ant_domicilio }
                            ].map((item, i) => (
                                <div key={i} className="border-b border-gray-100 pb-2">
                                <p className="text-[10px] uppercase font-bold text-gray-400">{item.label}</p>
                                <p className="text-sm font-semibold text-slate-700 min-h-[20px]">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECCIÓN III: ESTRUCTURA ACCIONARIA */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <User className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Cuadro Accionario Actual</h4>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Nombre / Razón Social</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                                <th className="px-4 py-3 text-right">Cantidad</th>
                                <th className="px-4 py-3 text-right">Porcentaje</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {shareholders.map((acc, i) => (
                                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2 font-medium">{acc.name}</td>
                                <td className="px-4 py-2 text-center">{formatNumber(acc.acciones)}</td>
                                <td className="px-4 py-2 text-right">{formatNumber(acc.valor)}</td>
                                <td className="px-4 py-2 text-right font-bold text-blue-900">{acc.porcentaje}%</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50 font-bold">
                                <td className="px-4 py-3">TOTAL</td>
                                <td className="px-4 py-3 text-center">{totalShares.toLocaleString('en-US')}</td>
                                <td className="px-4 py-3 text-right">${totalAmount.toLocaleString('en-US')}</td>
                                <td className="px-4 py-3 text-right text-blue-900">{totalPercentage}%</td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                    </section>
                    
                    {/* SECCIÓN: OBJETO SOCIAL */}
                    {(formData.obj_descripcion || formData.obj_titulos) && (
                    <section>
                         <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                             <FileText className="text-blue-900" size={20} />
                             <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Objeto Social</h4>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {[
                                { l: "Facultad para Títulos de Crédito", v: formData.obj_titulos },
                                { l: "Facultad para Arrendamiento", v: formData.obj_arrendamiento },
                                { l: "Facultad para Factoraje", v: formData.obj_factoraje },
                                { l: "Otros Objetos Sociales", v: formData.obj_otros }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50 p-3 rounded border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 relative z-10">{item.l}</p>
                                    <p className="text-xs font-semibold text-slate-700 relative z-10 leading-relaxed">{item.v || <span className="text-slate-300 italic">No especificado</span>}</p>
                                </div>
                            ))}
                         </div>

                         {formData.obj_descripcion && (
                            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300 mt-3">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Objeto Social Principal</p>
                                <p className="text-sm leading-relaxed italic text-slate-600">"{formData.obj_descripcion}"</p>
                            </div>
                         )}
                    </section>
                    )}
                    
                    {/* SECCIÓN: DATOS SAT */}
                    {(formData.sat_rfc || formData.sat_domicilio) && (
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <FileText className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Datos Inscritos ante el SAT</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">RFC</p>
                                <p className="text-sm font-bold text-slate-900">{formData.sat_rfc || '-'}</p>
                            </div>
                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Domicilio Fiscal</p>
                                <p className="text-sm text-slate-800">{formData.sat_domicilio || '-'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Actividad Económica</p>
                                <p className="text-sm font-medium text-slate-700">{formData.sat_actividad || '-'}</p>
                            </div>
                        </div>
                    </section>
                    )}

                    {/* SECCIÓN IV: REPRESENTACIÓN LEGAL */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <ClipboardCheck className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Representación Legal</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reps.map((rep, i) => (
                            <div key={rep.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 bg-blue-900 text-white text-[10px] font-bold rounded-bl-lg">
                                    {rep.cargo || 'SIN CARGO'}
                                </div>
                                <p className="text-lg font-bold text-blue-900 mb-2">{rep.name}</p>
                                <div className="space-y-1">
                                    <p className="text-xs"><strong>RFC:</strong> {rep.rfc}</p>
                                    <p className="text-xs"><strong>ID Oficial:</strong> {rep.id_oficial}</p>
                                    <p className="text-xs"><strong>CURP:</strong> {rep.curp}</p>
                                    <p className="text-xs flex items-start gap-1">
                                    <MapPin size={12} className="mt-0.5 shrink-0" />
                                    <span>{rep.domicilio}</span>
                                    </p>

                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Poderes</p>
                                        {rep.tipo_poderes && <p className="text-xs text-slate-800 italic mb-2">{rep.tipo_poderes}</p>}
                                        <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-2 gap-y-1">
                                            {rep.tipo_escritura && <p className="col-span-2"><span className="font-semibold text-blue-900">Tipo:</span> {rep.tipo_escritura}</p>}
                                            <p><span className="font-semibold text-blue-900">Escritura:</span> {formatNumber(rep.escritura)}</p>
                                            <p><span className="font-semibold text-blue-900">Volumen:</span> {formatNumber(rep.volumen)}</p>
                                            <p><span className="font-semibold text-blue-900">Fecha:</span> {formatLongDate(rep.fecha)}</p>
                                            <p><span className="font-semibold text-blue-900">Fecha Reg:</span> {formatLongDate(rep.fecha_registro)}</p>
                                            <p className="col-span-2"><span className="font-semibold text-blue-900">Fedatario:</span> {rep.fedatario}</p>
                                            <p className="col-span-2"><span className="font-semibold text-blue-900">Registro:</span> {rep.registro}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </section>
                    
                    {/* SECCIÓN: ADMINISTRACIÓN */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <Briefcase className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Identificación de la Administración</h4>
                        </div>
                        <div className="overflow-x-auto border border-slate-100 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                                    <tr>
                                        <th className="p-3">Nombre</th>
                                        <th className="p-3">Cargo</th>
                                        <th className="p-3 text-center">Accionista</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {admins.map((admin, i) => (
                                        <tr key={admin.id} className="hover:bg-slate-50/50">
                                            <td className="p-3 font-medium text-slate-900">{admin.name}</td>
                                            <td className="p-3 text-slate-600">{admin.cargo}</td>
                                            <td className="p-3 text-center text-slate-600">
                                                {admin.es_socio === 'si' 
                                                    ? (admin.porcentaje && admin.porcentaje !== 'N/A' ? `SÍ (${admin.porcentaje}%)` : 'SÍ') 
                                                    : 'NO'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECCIÓN: ESCRITURAS */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <FileText className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Escrituras Dictaminadas</h4>
                        </div>
                        <div className="space-y-3">
                            {deeds.map((deed, i) => (
                                <div key={deed.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-xs font-bold text-blue-900 uppercase mb-1">{deed.tipo || 'Escritura'}</p>
                                    <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                                        <p><span className="text-slate-500 text-xs">Número:</span> {formatNumber(deed.numero)}</p>
                                        <p><span className="text-slate-500 text-xs">Fecha:</span> {formatLongDate(deed.fecha)}</p>
                                        <p className="md:col-span-2"><span className="text-slate-500 text-xs">Fedatario:</span> {deed.fedatario}</p>
                                        <p><span className="text-slate-500 text-xs">Registro:</span> {deed.registro}</p>
                                        <p><span className="text-slate-500 text-xs">Lugar:</span> {deed.lugar}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECCIÓN: DOCUMENTACIÓN */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                            <ClipboardCheck className="text-blue-900" size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Documentación Dictaminada</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                            {[
                                { l: "Comp. Domicilio", v: formData.doc_comp_dom },
                                { l: "Acta Constitutiva", v: formData.doc_acta_const },
                                { l: "RPP Acta", v: formData.doc_rpp_acta },
                                { l: "RFC Constancia", v: formData.doc_rfc_const },
                                { l: "Otras Escrituras", v: formData.doc_otras_esc },
                                { l: "RPP Otras", v: formData.doc_rpp_otras }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center text-center">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">{item.l}</span>
                                    <span className={`text-sm font-bold ${item.v && item.v.toUpperCase() === 'SI' ? 'text-green-600' : 'text-slate-400'}`}>{item.v || '-'}</span>
                                </div>
                            ))}
                        </div>
                        
                        {docPersons.length > 0 && (
                            <div className="overflow-x-auto border border-slate-100 rounded-lg mt-2">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                                        <tr>
                                            <th className="p-2">Persona</th>
                                            <th className="p-2">Identificación</th>
                                            <th className="p-2">CURP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {docPersons.map((p, i) => (
                                            <tr key={p.id} className="hover:bg-slate-50/50">
                                                <td className="p-2">{p.name}</td>
                                                <td className="p-2 text-xs text-slate-500">{p.identificacion}</td>
                                                <td className="p-2 text-xs text-slate-500">{p.curp}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* SECCIÓN: OBSERVACIONES */}
                    {(formData.obs_sociedad || formData.obs_rep_legal) && (
                        <section>
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                                <Info className="text-blue-900" size={20} />
                                <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Observaciones</h4>
                            </div>
                            <div className="space-y-2">
                                {formData.obs_sociedad && (
                                    <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">De la Sociedad</p>
                                        <p className="text-sm leading-relaxed italic text-slate-600">"{formData.obs_sociedad}"</p>
                                    </div>
                                )}
                                {formData.obs_rep_legal && (
                                    <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Del Representante Legal</p>
                                        <p className="text-sm leading-relaxed italic text-slate-600">"{formData.obs_rep_legal}"</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* SECCIÓN V: CUESTIONAMIENTOS */}
                    <section>
                         <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                             <CheckCircle className="text-blue-900" size={20} />
                             <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Cuestionamientos</h4>
                         </div>
                        <div className="grid grid-cols-1 gap-y-1">
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => (
                            <div key={n} className="flex justify-between items-center text-xs py-2 border-b border-slate-300 last:border-none">
                            <span className="text-slate-600 leading-tight pr-4">{n}. {getQuestionLabel(n)}</span>
                            <span className={`font-bold ${formData[`q${n}`] === 'No' ? 'text-red-500' : 'text-blue-900'}`}>
                                {formData[`q${n}`] || '-'}
                            </span>
                            </div>
                        ))}
                        </div>
                    </section>

                    {/* SECCIÓN VI: CONCLUSIÓN */}
                    <section className="space-y-2">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <Info className="text-blue-900" size={20} />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">Conclusión</h4>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300">
                             <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Conclusión</p>
                             <p className="text-sm leading-relaxed italic text-slate-600">
                                "{formData.conclusion || 'Sin conclusión definida.'}"
                             </p>
                        </div>
                    </section>

                    {/* FIRMA */}
                    <div className="pt-12 flex flex-col items-center">
                        <div className="w-64 border-t border-slate-400 mb-2"></div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">SOFIMAS Consulores del Noroeste S.A. de C.V., SOFOM ENR</p>
                        <p className="text-sm font-bold text-slate-900">{formData.nombre_firmante}</p>
                    </div>

                    </div>
                    
                    {/* FOOTER */}
                    <div className="bg-slate-50 px-8 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 border-t border-slate-100">
                    <p>{FIXED_COMPANY}</p>
                    <p className="mt-1 md:mt-0 font-medium">Documento generado para fines de evaluación de crédito</p>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
}

// Helper Components
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

function SectionToggle({ title, isOpen, onToggle, isInvalid, children }) {
    return (
        <div className="border-b border-slate-200">
            <button 
                onClick={onToggle}
                className={`w-full text-left px-4 py-3 flex justify-between items-center text-xs font-bold uppercase transition-colors ${
                    isOpen ? 'bg-slate-50 text-blue-900' : 'bg-white text-slate-600 hover:bg-slate-50'
                } ${isInvalid ? 'text-red-600' : ''}`}
            >
                {title}
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-sm space-y-3 animate-slideDown">
                    {children}
                </div>
            )}
        </div>
    );
}
