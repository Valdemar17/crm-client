import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Plus, Trash2, ChevronDown, ChevronRight, RefreshCw, Save, Search, Filter, MoreVertical, FileText } from 'lucide-react';
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

// Initial State Helpers
const initialShareholder = { id: 1, name: '', acciones: '', valor: '', porcentaje: '' };
const initialRep = { id: 1, name: 'Fernando Calles Sánchez', cargo: 'SECRETARIO', rfc: '', id_oficial: '', curp: '', domicilio: '', escritura: '', fecha: '', volumen: '', fedatario: '', registro: '', fecha_registro: '' };
const initialDocPerson = { id: 1, name: '', sujeto: '', identificacion: '', curp: '', rfc: '', comp_dom: 'SI', acta_mat: 'NO' };
const initialAdmin = { id: 1, name: '', cargo: '', es_socio: 'no', porcentaje: 'N/A' };
const initialDeed = { id: 1, tipo: 'Acta Constitutiva', numero: '', fecha: '', fedatario: '', lugar: '', registro: '' };

export default function DictamenJuridico({ onBack }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  
  // State for collapsible sections
  const [sections, setSections] = useState({
    denominacion: false,
    antecedentes: false,
    accionistas: false,
    objeto: false,
    representacion: false,
    observaciones: false,
    cuestionamientos: false,
    documentacion: false,
    administracion: false,
    escrituras: false,
    conclusion: false
  });

  const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Form Data State
  const [formData, setFormData] = useState({
    fechaDocumento: new Date().toLocaleDateString('es-MX'),
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

    // Cuestionamientos (1-10)
    q1: 'Si', q2: 'Si', q3: 'Si', q4: 'Si', q5: 'Si', 
    q6: 'Si', q7: 'Si', q8: 'Si', q9: 'Si', q10: 'Si',

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

        // --- Header ---
        try {
            const logoWidth = 40;
            const logoHeight = (img.height * logoWidth) / img.width;
            doc.addImage(img, 'PNG', margin, yPos, logoWidth, logoHeight);
        } catch (e) { console.error("Logo error", e); }

        // Title Info Block (Right Aligned)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10); // Match CSS .h-info size
        doc.setFont(undefined, 'bold');
        doc.text('Dictamen Jurídico', pageWidth - margin, yPos + 5, { align: 'right' });
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        // Multi-line address block
        const addressLines = [
            'SOFIMAS Consultores del Noroeste S.A. de C.V. SOFOM E.N.R.',
            'Paseo Río Sonora Sur #205 Piso 4 Proyecto Río Sonora 83270',
            'Hermosillo Sonora; www.sofimas.com'
        ];
        doc.text(addressLines, pageWidth - margin, yPos + 10, { align: 'right', lineHeightFactor: 1.3 });

        // Date
        doc.setFont(undefined, 'bold');
        doc.text(`Fecha: ${formData.fechaDocumento}`, pageWidth - margin, yPos + 24, { align: 'right' });

        yPos += 30;

        // Helper: Section Title (Matches .sec-h CSS: Blue bg, White text, Centered)
        const addSectionTitle = (title, y) => {
            doc.setFillColor(...primaryColor);
            doc.rect(margin, y, contentWidth, 7, 'F'); // Blue bar
            doc.setDrawColor(0, 0, 0);
            doc.rect(margin, y, contentWidth, 7, 'S'); // Black border
            
            doc.setTextColor(...whiteText);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(title, pageWidth / 2, y + 5, { align: 'center' });
            return y + 7; // No padding below, just like CSS margin-top: -1px
        };

        const addTextContent = (text, y, isHighEmphasis = false) => {
            doc.setDrawColor(0, 0, 0); // Border color
            
            // Calculate height
            doc.setFontSize(isHighEmphasis ? 11 : 9);
            doc.setFont(undefined, isHighEmphasis ? 'bold' : 'normal');
            
            const splitText = doc.splitTextToSize(text || '', contentWidth - 4);
            const blockHeight = Math.max(7, (splitText.length * 4) + 4);
            
            // Draw Box
            doc.setFillColor(isHighEmphasis ? 255 : 255); // Could use cream if needed
            doc.rect(margin, y, contentWidth, blockHeight, 'S'); // Border only
            
            // Text
            doc.setTextColor(0, 0, 0);
            doc.text(splitText, margin + 2, y + 4);
            
            return y + blockHeight - 0.2; // Slight overlap for borders
        };

        // I. Denominación
        yPos = addSectionTitle('I.- Denominación de la Sociedad', yPos);
        yPos = addTextContent(formData.denominacion, yPos, true); // High emphasis

        // II. Objetivo
        yPos = addSectionTitle('II.- Objetivo', yPos);
        yPos = addTextContent(formData.objetivo, yPos);
        yPos += 5; // Spacing after section II

        // III. Antecedentes
        yPos = addSectionTitle('III.- Antecedentes del Hecho', yPos);
        
        // Tabla Antecedentes: Mimic the layout with bold first col
        doc.autoTable({
            startY: yPos,
            head: [], // No header, part of the layout
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
            styles: { 
                fontSize: 8, 
                lineColor: [0, 0, 0], // Black borders
                lineWidth: 0.1,
                textColor: [0, 0, 0]
            },
            columnStyles: { 
                0: { cellWidth: 35 }, // Key side (White bg in CSS)
                1: { cellWidth: 45, fontStyle: 'bold', fillColor: [255, 255, 255] }, // Label (Cream in CSS, but let's keep white/clean)
                2: { cellWidth: 'auto' } 
            },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY - 0.2; // Connect tables

        // Cuadro Accionario (Inside Antecedentes logically)
        // We just draw it right after
        doc.autoTable({
            startY: yPos,
            head: [[{ content: 'Cuadro Accionario Actual:', colSpan: 4, styles: { halign: 'left', fontStyle: 'bold' } }]],
            body: [
                ['Nombre', 'Acciones', 'Cantidad', 'Porcentaje'],
                ...shareholders.map(s => [s.name, s.acciones, s.valor, s.porcentaje + '%']),
                ['TOTAL', totalShares, `$${totalAmount.toLocaleString()}`, `${totalPercentage}%`]
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 2 },
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] }, // No blue header here in CSS
            columnStyles: { 0: { cellWidth: 60 } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY - 0.2;
        
        // Objeto Social Section (Part of Antecedentes table in CSS)
        doc.autoTable({
            startY: yPos,
            body: [
                [{ content: 'Objeto Social:', rowSpan: 5, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center' } }, 'Facultad Títulos Crédito:', formData.obj_titulos],
                ['Facultad Arrendamiento:', formData.obj_arrendamiento],
                ['Facultad Factoraje:', formData.obj_factoraje],
                ['Otros objetos:', formData.obj_otros],
                [{ content: formData.obj_descripcion, colSpan: 2, styles: { halign: 'justify' } }], // Full width desc
                
                // SAT (Part of same table in CSS)
                [{ content: 'Datos Inscritos SAT:', rowSpan: 3, styles: { fontStyle: 'bold', valign: 'middle', halign: 'center' } }, 'RFC:', formData.sat_rfc],
                ['Domicilio Fiscal:', formData.sat_domicilio],
                ['Actividad Económica:', formData.sat_actividad],
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
            columnStyles: { 
                0: { cellWidth: 35 }, 
                1: { cellWidth: 45, fontStyle: 'bold' },
                2: { cellWidth: 'auto' }
            },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY + 5;

        // IV. Representación Legal
        yPos = addSectionTitle('IV.- Representación Legal', yPos);
        
        reps.forEach(rep => {
            if (yPos > 240) { doc.addPage(); yPos = 20; yPos = addSectionTitle('IV.- Representación Legal (Cont.)', yPos); }
            
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
                styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 2 },
                columnStyles: { 1: { fontStyle: 'bold', cellWidth: 25 }, 3: { fontStyle: 'bold', cellWidth: 25 } },
                margin: { left: margin, right: margin },
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.1
            });
            yPos = doc.lastAutoTable.finalY + -0.2; // Merge if multiple? No, spaced is better, but CSS has them merged.
        });
        yPos += 5;

        // V. Observaciones
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        yPos = addSectionTitle('V.- Observaciones', yPos);
        
        doc.autoTable({
            startY: yPos,
            body: [
                ['Observaciones de la Sociedad:', formData.obs_sociedad],
                ['Observaciones del Representante Legal:', formData.obs_rep_legal]
            ],
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold', valign: 'middle' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY + 5;

        // VI. Cuestionamientos
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        yPos = addSectionTitle('VI.- Cuestionamientos', yPos);

        const questions = [
            '1. ¿La sociedad está debidamente constituida conforme a leyes mexicanas?',
            '2. ¿La sociedad se encuentra debidamente registrada en el Registro Público de Comercio?',
            '3. ¿Tiene la sociedad capacidad jurídica para ser accionista de otras sociedades?',
            '4. ¿Se encuentra inscrita en el SAT?',
            '5. ¿Su actividad económica coincide con su objeto social?',
            '6. ¿Cuenta con facultades para suscribir Títulos de Crédito?',
            '7. ¿Cuenta con facultades para celebrar contratos de Arrendamiento y Factoraje?',
            '8. ¿El poder del representante legal se encuentra debidamente registrado?',
            '9. ¿Puede obligarse como Obligado Solidario?',
            '10. ¿Puede otorgar garantías (Prendaria/Hipotecaria)?'
        ];

        doc.autoTable({
            startY: yPos,
            body: questions.map((q, i) => [q, formData[`q${i+1}`] || '']),
            theme: 'plain',
            styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], cellPadding: 1 },
            columnStyles: { 0: { cellWidth: 150 }, 1: { fontStyle: 'bold', halign: 'center' } },
            margin: { left: margin, right: margin },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });
        yPos = doc.lastAutoTable.finalY + 5;

        // VII. Documentación
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        yPos = addSectionTitle('VII.- Documentación Dictaminada', yPos);

        // Subheader like CSS (Gray/Blue box "Lista de Documentos...")
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]); // #cfdceb
        doc.rect(margin, yPos, contentWidth, 6, 'FD'); // Fill and Border
        doc.setFontSize(8); doc.setTextColor(0,0,0); doc.setFont(undefined, 'bold');
        doc.text("Lista de Documentos Dictaminados.-", pageWidth/2, yPos + 4, { align: 'center' });
        yPos += 6;

        doc.autoTable({
            startY: yPos,
            head: [['Denominación Social', 'Comprobante domicilio', 'Acta Constitutiva', 'RPP Acta Constitutiva', 'Otras Escrituras', 'RPP otras Escrituras', 'RFC/Constancia']],
            body: [[
                formData.denominacion, 
                formData.doc_comp_dom, formData.doc_acta_const, formData.doc_rpp_acta,
                formData.doc_otras_esc, formData.doc_rpp_otras, formData.doc_rfc_const
            ]],
            theme: 'plain',
            headStyles: { fillColor: secondaryColor, textColor: [0,0,0], fontSize: 7, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1 },
            styles: { fontSize: 7, cellPadding: 2, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1, textColor: [0,0,0] },
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
                headStyles: { fillColor: secondaryColor, textColor: [0,0,0], fontSize: 7, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1 },
                styles: { fontSize: 7, cellPadding: 2, halign: 'center', lineColor: [0,0,0], lineWidth: 0.1, textColor: [0,0,0] },
                columnStyles: { 0: { cellWidth: 35, halign: 'left', fontStyle: 'bold' } },
                margin: { left: margin, right: margin },
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.1
            });
            yPos = doc.lastAutoTable.finalY + 5;
        }

        // IX. Escrituras
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        if (deeds.length > 0) {
             yPos = addSectionTitle('IX.- Escrituras Dictaminadas', yPos);
             doc.autoTable({
                startY: yPos,
                head: [['Tipo de Escritura', 'Numero de Escritura', 'Fecha', 'Nombre Fedatario', 'Lugar', 'Datos Registro']],
                body: deeds.map(d => [d.tipo, d.numero, d.fecha, d.fedatario, d.lugar, d.registro]),
                theme: 'plain',
                headStyles: { fillColor: [220, 230, 241], textColor: [0,0,0], fontSize: 8, lineColor: [0,0,0], lineWidth: 0.1 }, // #dce6f1
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0,0,0], lineWidth: 0.1, textColor: [0,0,0] },
                margin: { left: margin, right: margin },
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.1
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }

        // X. Conclusión y Firma
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        yPos = addSectionTitle('X.- Conclusión', yPos);
        
        doc.setDrawColor(0,0,0);
        doc.rect(margin, yPos, contentWidth, 15, 'S'); // Box for conclusion
        doc.setFontSize(11);
        doc.setTextColor(0,0,0);
        doc.setFont(undefined, 'bold');
        doc.text(formData.conclusion, pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 25;

        // Firma
        yPos = addSectionTitle('XI.- Fecha y Firma', yPos);
        yPos += 5;
        
        // Box for signature area
        doc.rect(margin, yPos, contentWidth, 50, 'S');
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(formData.lugar_fecha_firma, pageWidth / 2, yPos + 10, { align: 'center' });
        
        yPos += 30;
        doc.setLineWidth(0.5);
        doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
        yPos += 5;

        doc.setFont(undefined, 'bold');
        doc.text(formData.empresa_firma, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
        doc.setFont(undefined, 'normal');
        doc.text(formData.nombre_firmante, pageWidth / 2, yPos, { align: 'center' });

        // Save
        doc.save(`Dictamen_${formData.denominacion.substring(0,20).replace(/\s+/g, '_')}.pdf`);
    };
  };

  const handlePrint = () => generarPDF();

  const resetForm = () => {
    if(window.confirm('¿Estás seguro de reiniciar todo el formulario?')) {
       // Reset logic here (could set back to initial states)
       // Or simpler:
       // setFormData(initialFormData); // If we extracted initial state
       window.location.reload(); 
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
          <button onClick={() => setViewMode('form')} className="bg-[#1a4580] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 transition-colors font-medium">
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
                {/* 0. Fecha */}
                <div className="dictamen-group">
                    <label className="dictamen-label">Fecha Documento</label>
                    <input type="text" name="fechaDocumento" value={formData.fechaDocumento} onChange={handleInputChange} className="dictamen-input" />
                </div>

                {/* I & II. Denominación y Objetivo */}
                <SectionToggle title="I. Denominación y II. Objetivo" isOpen={sections.denominacion} onToggle={() => toggleSection('denominacion')}>
                    <div className="dictamen-group"><label className="dictamen-label">I. Denominación</label><input className="dictamen-input" name="denominacion" value={formData.denominacion} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">II. Objetivo</label><textarea className="dictamen-textarea" name="objetivo" value={formData.objetivo} onChange={handleInputChange} /></div>
                </SectionToggle>

                {/* III. Antecedentes */}
                <SectionToggle title="III. Antecedentes - Constitución" isOpen={sections.antecedentes} onToggle={() => toggleSection('antecedentes')}>
                    <div className="dictamen-row-inputs">
                        <input className="dictamen-input" placeholder="Escritura" name="ant_escritura" value={formData.ant_escritura} onChange={handleInputChange} />
                        <input className="dictamen-input" placeholder="Volumen" name="ant_volumen" value={formData.ant_volumen} onChange={handleInputChange} />
                    </div>
                    <div className="dictamen-group"><label className="dictamen-label">Fecha</label><input className="dictamen-input" name="ant_fecha" value={formData.ant_fecha} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Fedatario</label><input className="dictamen-input" name="ant_fedatario" value={formData.ant_fedatario} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">No. Fedatario</label><input className="dictamen-input" name="ant_num_fedatario" value={formData.ant_num_fedatario} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Circunscripción</label><input className="dictamen-input" name="ant_circunscripcion" value={formData.ant_circunscripcion} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Registro Público</label><input className="dictamen-input" name="ant_registro" value={formData.ant_registro} onChange={handleInputChange} /></div>
                    <div className="dictamen-row-inputs">
                        <input className="dictamen-input" placeholder="Fecha Reg." name="ant_fecha_reg" value={formData.ant_fecha_reg} onChange={handleInputChange} />
                        <input className="dictamen-input" placeholder="Lugar Reg." name="ant_lugar_reg" value={formData.ant_lugar_reg} onChange={handleInputChange} />
                    </div>
                </SectionToggle>

                {/* III. Cuadro Accionario */}
                <SectionToggle title="III. Cuadro Accionario" isOpen={sections.accionistas} onToggle={() => toggleSection('accionistas')}>
                     {shareholders.map((person, index) => (
                         <div key={person.id} className="card-dynamic">
                             <button className="btn-del" onClick={() => removeItem(setShareholders, shareholders, person.id)}>X</button>
                             <input className="dictamen-input mb-2" placeholder="Nombre Accionista" value={person.name} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'name', e.target.value)} />
                             <div className="dictamen-row-inputs">
                                 <input className="dictamen-input" placeholder="Acciones" value={person.acciones} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'acciones', e.target.value)} />
                                 <input className="dictamen-input" placeholder="Valor ($)" value={person.valor} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'valor', e.target.value)} />
                                 <input className="dictamen-input" placeholder="%" type="number" value={person.porcentaje} onChange={(e) => updateItem(setShareholders, shareholders, person.id, 'porcentaje', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="btn-add" onClick={() => addItem(setShareholders, shareholders, initialShareholder)}>+ Agregar Accionista</button>
                     <div className={`text-center font-bold text-xs p-2 rounded ${Math.abs(totalPercentage - 100) < 0.1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Total: {totalPercentage}% {Math.abs(totalPercentage - 100) > 0.1 && '(Debe sumar 100%)'}
                     </div>
                </SectionToggle>

                 {/* III. Objeto Social y SAT */}
                 <SectionToggle title="III. Objeto Social y SAT" isOpen={sections.objeto} onToggle={() => toggleSection('objeto')}>
                    <div className="dictamen-group"><label className="dictamen-label">Facultad Títulos</label><input className="dictamen-input" name="obj_titulos" value={formData.obj_titulos} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Facultad Arrendamiento</label><input className="dictamen-input" name="obj_arrendamiento" value={formData.obj_arrendamiento} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Facultad Factoraje</label><input className="dictamen-input" name="obj_factoraje" value={formData.obj_factoraje} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Descripción</label><textarea className="dictamen-textarea h-24" name="obj_descripcion" value={formData.obj_descripcion} onChange={handleInputChange} /></div>
                    <div className="border-t border-slate-200 my-2 pt-2">
                        <div className="dictamen-group"><label className="dictamen-label">SAT RFC</label><input className="dictamen-input" name="sat_rfc" value={formData.sat_rfc} onChange={handleInputChange} /></div>
                        <div className="dictamen-group"><label className="dictamen-label">SAT Domicilio</label><textarea className="dictamen-textarea" name="sat_domicilio" value={formData.sat_domicilio} onChange={handleInputChange} /></div>
                    </div>
                </SectionToggle>

                {/* IV. Representación Legal */}
                <SectionToggle title="IV. Representación Legal" isOpen={sections.representacion} onToggle={() => toggleSection('representacion')}>
                     {reps.map((rep) => (
                         <div key={rep.id} className="card-dynamic">
                             <div className="font-bold text-[10px] text-blue-800 mb-1">REPRESENTANTE #{rep.id}</div>
                             <button className="btn-del" onClick={() => removeItem(setReps, reps, rep.id)}>X</button>
                             
                             <div className="dictamen-row-inputs">
                                <input className="dictamen-input" placeholder="Nombre" value={rep.name} onChange={(e) => updateItem(setReps, reps, rep.id, 'name', e.target.value)} />
                                <input className="dictamen-input" placeholder="Cargo" value={rep.cargo} onChange={(e) => updateItem(setReps, reps, rep.id, 'cargo', e.target.value)} />
                             </div>
                             <div className="dictamen-row-inputs">
                                <input className="dictamen-input" placeholder="RFC" value={rep.rfc} onChange={(e) => updateItem(setReps, reps, rep.id, 'rfc', e.target.value)} />
                                <input className="dictamen-input" placeholder="ID Oficial" value={rep.id_oficial} onChange={(e) => updateItem(setReps, reps, rep.id, 'id_oficial', e.target.value)} />
                             </div>
                             <input className="dictamen-input mb-2" placeholder="Domicilio" value={rep.domicilio} onChange={(e) => updateItem(setReps, reps, rep.id, 'domicilio', e.target.value)} />
                             
                             <label className="dictamen-label mt-2">Escritura Poder</label>
                             <div className="dictamen-row-inputs">
                                <input className="dictamen-input" placeholder="Num" value={rep.escritura} onChange={(e) => updateItem(setReps, reps, rep.id, 'escritura', e.target.value)} />
                                <input className="dictamen-input" placeholder="Fecha" value={rep.fecha} onChange={(e) => updateItem(setReps, reps, rep.id, 'fecha', e.target.value)} />
                             </div>
                             <input className="dictamen-input mb-1" placeholder="Fedatario" value={rep.fedatario} onChange={(e) => updateItem(setReps, reps, rep.id, 'fedatario', e.target.value)} />
                         </div>
                     ))}
                     <button className="btn-add bg-cyan-600" onClick={() => addItem(setReps, reps, initialRep)}>+ Agregar Representante</button>
                </SectionToggle>

                {/* V. Observaciones */}
                <SectionToggle title="V. Observaciones" isOpen={sections.observaciones} onToggle={() => toggleSection('observaciones')}>
                    <div className="dictamen-group"><label className="dictamen-label">Obs. Sociedad</label><textarea className="dictamen-textarea h-20" name="obs_sociedad" value={formData.obs_sociedad} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Obs. Rep. Legal</label><textarea className="dictamen-textarea h-20" name="obs_rep_legal" value={formData.obs_rep_legal} onChange={handleInputChange} /></div>
                </SectionToggle>

                {/* VI. Cuestionamientos */}
                <SectionToggle title="VI. Cuestionamientos" isOpen={sections.cuestionamientos} onToggle={() => toggleSection('cuestionamientos')}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <div key={n} className="flex justify-between items-center mb-1 text-xs">
                           <span className="text-slate-600 w-3/4 truncate">
                             {n}. {getQuestionLabel(n)}
                           </span>
                           <select className="border border-slate-300 rounded text-xs p-1" name={`q${n}`} value={formData[`q${n}`]} onChange={handleInputChange}>
                               <option>Si</option><option>No</option><option>N/A</option>
                           </select>
                        </div>
                    ))}
                </SectionToggle>

                {/* VII. Documentacion */}
                <SectionToggle title="VII. Documentación" isOpen={sections.documentacion} onToggle={() => toggleSection('documentacion')}>
                     <div className="grid grid-cols-2 gap-2 mb-4">
                        {['Comp. Dom', 'Acta Const', 'RPP Acta', 'Otras Esc', 'RPP Otras', 'RFC/Const'].map((label, idx) => {
                             const keys = ['doc_comp_dom', 'doc_acta_const', 'doc_rpp_acta', 'doc_otras_esc', 'doc_rpp_otras', 'doc_rfc_const'];
                             return (
                                <div key={label} className="flex flex-col">
                                    <label className="text-[10px] lowercase text-slate-500">{label}</label>
                                    <select className="border border-slate-300 rounded text-xs p-1" name={keys[idx]} value={formData[keys[idx]]} onChange={handleInputChange}>
                                        <option>SI</option><option>NO</option><option>N/A</option>
                                    </select>
                                </div>
                             )
                        })}
                     </div>
                     
                     <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Personas Identificadas</div>
                     {docPersons.map((p) => (
                         <div key={p.id} className="card-dynamic">
                             <button className="btn-del" onClick={() => removeItem(setDocPersons, docPersons, p.id)}>X</button>
                             <input className="dictamen-input mb-1" placeholder="Nombre" value={p.name} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'name', e.target.value)} />
                             <div className="dictamen-row-inputs">
                                 <input className="dictamen-input" placeholder="ID (INE/Pasaporte)" value={p.identificacion} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'identificacion', e.target.value)} />
                                 <select className="dictamen-select w-20" value={p.comp_dom} onChange={(e) => updateItem(setDocPersons, docPersons, p.id, 'comp_dom', e.target.value)}>
                                     <option value="SI">Dom: SI</option><option value="NO">NO</option>
                                 </select>
                             </div>
                         </div>
                     ))}
                     <button className="btn-add bg-slate-500" onClick={() => addItem(setDocPersons, docPersons, initialDocPerson)}>+ Persona</button>
                </SectionToggle>

                {/* IX. Escrituras */}
                 <SectionToggle title="IX. Escrituras Dictaminadas" isOpen={sections.escrituras} onToggle={() => toggleSection('escrituras')}>
                     {deeds.map((deed) => (
                         <div key={deed.id} className="card-dynamic">
                             <button className="btn-del" onClick={() => removeItem(setDeeds, deeds, deed.id)}>X</button>
                             <div className="dictamen-row-inputs">
                                 <select className="dictamen-select w-1/2" value={deed.tipo} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'tipo', e.target.value)}>
                                     <option>Acta Constitutiva</option><option>Acta de Asamblea</option><option>Poderes</option>
                                 </select>
                                 <input className="dictamen-input w-1/2" placeholder="Numero" value={deed.numero} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'numero', e.target.value)} />
                             </div>
                             <div className="dictamen-row-inputs">
                                 <input className="dictamen-input" placeholder="Fecha" value={deed.fecha} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'fecha', e.target.value)} />
                                 <input className="dictamen-input" placeholder="Fedatario" value={deed.fedatario} onChange={(e) => updateItem(setDeeds, deeds, deed.id, 'fedatario', e.target.value)} />
                             </div>
                         </div>
                     ))}
                     <button className="btn-add bg-indigo-400" onClick={() => addItem(setDeeds, deeds, initialDeed)}>+ Escritura</button>
                </SectionToggle>

                {/* X. Conclusión */}
                <SectionToggle title="X. Conclusión y Firma" isOpen={sections.conclusion} onToggle={() => toggleSection('conclusion')}>
                    <div className="dictamen-group"><label className="dictamen-label">Conclusión</label><input className="dictamen-input" name="conclusion" value={formData.conclusion} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Lugar y Fecha</label><input className="dictamen-input" name="lugar_fecha_firma" value={formData.lugar_fecha_firma} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Nombre Firmante</label><input className="dictamen-input" name="nombre_firmante" value={formData.nombre_firmante} onChange={handleInputChange} /></div>
                    <div className="dictamen-group"><label className="dictamen-label">Empresa</label><input className="dictamen-input" name="empresa_firma" value={formData.empresa_firma} onChange={handleInputChange} /></div>
                </SectionToggle>
            </div>
        </div>

        {/* PREVIEW AREA (The Sheet) */}
        <div className="dictamen-preview bg-slate-700">
            <div className="sheet">
                
                {/* Header */}
                <div className="header">
                    <div className="logo">SOFIMAS</div>
                    <div className="h-info">
                        <strong>Dictamen Jurídico</strong><br/>
                        SOFIMAS Consultores del noroeste S.A. de C.V. SOFOM E.N.R.<br/>
                        Paseo Río Sonora Sur #205 Piso 4 Proyecto Río Sonora 83270<br/>
                        Hermosillo Sonora; www.sofimas.com
                    </div>
                    <div className="h-date">Fecha:<br/><span>{formData.fechaDocumento}</span></div>
                </div>

                {/* Sections */}
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

                <div className="sec-h">X.- Conclusión</div><div className="sec-c" style={{textAlign: 'center', fontWeight: 'bold', fontSize:'14px', padding:'10px'}}>{formData.conclusion}</div>
                
                <div className="sec-h">XI.- Fecha y Firma</div>
                <div className="sec-c" style={{padding: '20px'}}>
                    <div style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '40px', fontSize: '12px'}}>
                         {formData.lugar_fecha_firma}
                    </div>
                    <div className="flex flex-col items-center">
                         <div className="w-64 border-t border-black mb-2"></div>
                         <div style={{fontWeight: 'bold', mb: '4px'}}>{formData.empresa_firma}</div>
                         <div>{formData.nombre_firmante}</div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SectionToggle({ title, isOpen, onToggle, children }) {
    return (
        <div>
            <div className={`cat-h ${!isOpen ? 'collapsed' : ''}`} onClick={onToggle}>
                {title} <span className="arrow">▼</span>
            </div>
            {isOpen && <div className="bg-white p-3 border border-slate-200 border-t-0 mb-3">{children}</div>}
        </div>
    );
}

function getQuestionLabel(n) {
    const labels = [
        "¿Constituida legalmente?",
        "¿Registrada en RPP?",
        "¿Capacidad ser accionista?",
        "¿Inscrita SAT?",
        "¿Actividad coincide Objeto?",
        "¿Títulos de Crédito?",
        "¿Arrendamiento/Factoraje?",
        "¿Poder Registrado?",
        "¿Obligado Solidario?",
        "¿Garante Prendario?"
    ];
    return labels[n-1] || "";
}
