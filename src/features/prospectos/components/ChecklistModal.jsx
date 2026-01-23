import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, CheckCircle, Download, AlertCircle, Save } from 'lucide-react';

// --- CONSTANTES Y DATOS (Lógica de Negocio) ---

const checklistItemsData = [
  {
    id: 'nombre',
    label: 'Nombre del Prospecto',
    type: 'text',
    placeholder: 'Nombre completo o Razón Social',
    required: true,
    colSpan: true
  },
  {
    id: 'telefono',
    label: 'Teléfono',
    type: 'tel',
    placeholder: '10 dígitos',
    required: true
  },
  {
    id: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    placeholder: 'ejemplo@correo.com',
    required: true
  },
  {
    id: 'producto',
    label: 'Producto',
    type: 'select',
    options: [
      { value: '', text: 'Seleccione una opción', disabled: true },
      { value: 'credito_pyme', text: 'Crédito PYME' },
      { value: 'credito_simple', text: 'Crédito Simple' },
    ],
    required: true
  },
  {
    id: 'personalidad',
    label: 'Personalidad (Cliente)',
    type: 'select',
    options: [
      { value: '', text: 'Seleccione una opción', disabled: true },
      { value: 'pfae', text: 'PFAE' },
      { value: 'pm', text: 'PM' }
    ],
    required: true
  },
  {
    id: 'aval',
    label: 'Obligado Solidario y Aval',
    type: 'select',
    options: [
      { value: '', text: 'Seleccione una opción', disabled: true },
      { value: 'aval_pfae', text: 'Aval PFAE' },
      { value: 'aval_pm', text: 'Aval PM' },
    ],
    required: true
  },
  {
    id: 'garantia',
    label: 'Garantía',
    type: 'select',
    options: [
      { value: '', text: 'Seleccione una opción', disabled: true },
      { value: 'hipotecaria', text: 'Hipotecaria' },
      { value: 'no_aplica', text: 'No Aplica / Solo Aval' },
    ],
    required: true
  },
  {
    id: 'dueno_garantia',
    label: 'Dueño de Garantía',
    type: 'select',
    options: [
      { value: '', text: 'Seleccione una opción', disabled: true },
      { value: 'cliente', text: 'Cliente' },
      { value: 'aval_pfae', text: 'Aval PFAE' },
      { value: 'aval_pm', text: 'Aval PM' },
      { value: 'tercero_garante_pfae', text: 'Tercero Garante PFAE' },
      { value: 'tercero_garante_pf', text: 'Tercero Garante PF' },
      { value: 'tercero_garante_pm', text: 'Tercero Garante PM' }
    ],
    required: true,
  }
];

const LINK_MAP = {
  'Solicitud de crédito PM': 'https://netorgft2218293-my.sharepoint.com/:x:/g/personal/valdemar_marrufo_sofimas_com/ER5NjNFc5Q9Lo_pM8GZD7g4BExQfpsYUiYoqxS8C9RW2mg?e=eTuWgX&wdLOR=c4324EB9C-718D-E140-8CAD-24316FAC5AA3',
  'Solicitud de crédito PFAE': 'https://netorgft2218293-my.sharepoint.com/:x:/g/personal/valdemar_marrufo_sofimas_com/EYpBLHe21P9DnkLAPArtoDEBXK0t3KQEAgyaYEESDJucfw?e=tU4t6P&wdLOR=cF847D597-2619-5946-ADB1-487AC64D8A50',
  'Autorización para consulta de historial crediticio PM': 'https://netorgft2218293-my.sharepoint.com/:w:/g/personal/valdemar_marrufo_sofimas_com/IQD0eY44iyWrR6GKwXoI7q_IARutx0A2fto-PspZd6W6h9Q?e=zVZazb',
  'Autorización para consulta de historial crediticio PFAE': '',
  'Aviso de privacidad': 'https://netorgft2218293-my.sharepoint.com/personal/valdemar_marrufo_sofimas_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fvaldemar%5Fmarrufo%5Fsofimas%5Fcom%2FDocuments%2F00%2E%2D%20Formatos%20Prospectos%2FAviso%20de%20Privacidad%2Epdf&parent=%2Fpersonal%2Fvaldemar%5Fmarrufo%5Fsofimas%5Fcom%2FDocuments%2F00%2E%2D%20Formatos%20Prospectos&ga=1',
  'Formato de integración accionaria': 'https://netorgft2218293-my.sharepoint.com/:x:/g/personal/valdemar_marrufo_sofimas_com/ES24sHvMAcRPhCk2TnnsnM8BqfI5U7J7IiLvdhtYUCajcA?e=7FhjmZ&wdLOR=c8D832E9C-F83A-554A-AB3B-139F8397044A',
  'Ingreso de clave CIEC en portal de Análisis de Crédito': 'https://dashboard.ekatena.com/open_url/reports/2efee038-f103-41f5-b2c7-ed0f25dbf66f/new',
  'CURP': 'https://www.gob.mx/curp/',
};

// Utils
function convertirADescargaDirecta(urlOriginal, docName = '') {
  if (!urlOriginal || !urlOriginal.startsWith('https')) return urlOriginal;
  const linksExcluidos = ['Ingreso de clave CIEC en portal de Análisis de Crédito', 'CURP'];
  if (linksExcluidos.includes(docName)) return urlOriginal;
  return urlOriginal.split('?')[0] + '?download=1';
}

// Arrays de Documentos
const DOCS_PF_COMUNES_ID_NEGOCIO = [
  'Identificación oficial vigente (INE y/o pasaporte)',
  'Acta de matrimonio y capitulaciones (en caso de aplicar)',
  'CURP',
  'Comprobante de domicilio (antigüedad no mayor a tres meses)',
  'Constancia de Situación Fiscal (antigüedad no mayor a tres meses)',
  'Ingreso de clave CIEC en portal de Análisis de Crédito',
  'Comprobante de domicilio del negocio (antigüedad no mayor a tres meses)',
  'Estados de cuenta bancarios de los últimos seis meses (carátulas)',
  'Estados financieros de los últimos dos años y parcial más reciente (incluir analíticas y cédula del contador), firmados en original',
  'Acuse de registro como Actividad Vulnerable (cuando aplique)',
  'Comprobante de generación del Certificado Digital de Firma Electrónica'
];

const DOCS_PM_COMUNES_LEGAL_NEGOCIO = [
  'Acta constitutiva (con datos en el RPPC)',
  'Actas de asamblea (con datos en el RPPC)',
  'Poder del representante legal (con datos en el RPPC)',
  'Comprobante de domicilio (antigüedad no mayor a tres meses)',
  'Ingreso de clave CIEC en portal de Análisis de Crédito',
  'Comprobante de domicilio del negocio (antigüedad no mayor a tres meses)',
  'Estados de cuenta bancarios de los últimos seis meses (carátulas)',
  'Estados financieros de los últimos dos años y parcial más reciente (incluir analíticas y cédula del contador), firmados en original',
  'Acuse de registro como Actividad Vulnerable (cuando aplique)',
  'Comprobante de generación del Certificado Digital de Firma Electrónica',
];

const DOCS_REPR_LEGAL = [
  'Identificación oficial vigente (INE y/o pasaporte)',
  'Comprobante de domicilio particular (antigüedad no mayor a tres meses)',
  'Aviso de privacidad',
  'Constancia de Situación Fiscal (antigüedad no mayor a tres meses)',
  'CURP',
  'Acta de matrimonio y capitulaciones (en caso de aplicar)',
];

const DOCS_TERCERO_GARANTE_PF = [
  'Identificación oficial vigente (INE y/o pasaporte)',
  'Acta de matrimonio y capitulaciones (en caso de aplicar)',
  'CURP',
  'Comprobante de domicilio (antigüedad no mayor a tres meses)',
  'Constancia de Situación Fiscal (antigüedad no mayor a tres meses)',
  'Estados de cuenta bancarios de los últimos seis meses (carátulas)',
  'Relación patrimonial',
  'Autorización para consulta de historial crediticio PFAE',
  'Aviso de privacidad'
];

const DOCUMENT_MAP = {
  personalidad_pm: {
    title: 'CLIENTE (Persona Moral)',
    sections: [
      { name: 'Documentos de Llenado', docs: ['Solicitud de crédito PM', 'Autorización para consulta de historial crediticio PM', 'Aviso de privacidad', 'Formato de integración accionaria'] },
      { name: 'Documentación Legal y de Identificación', docs: DOCS_PM_COMUNES_LEGAL_NEGOCIO.slice(0, 3) },
      { name: 'Información del Negocio', docs: DOCS_PM_COMUNES_LEGAL_NEGOCIO.slice(4) },
      { name: 'Información del Representante Legal', docs: DOCS_REPR_LEGAL }
    ]
  },
  personalidad_pfae: {
    title: 'CLIENTE (Persona Fisica con Actividad Empresarial)',
    sections: [
      { name: 'Documentos de Llenado', docs: ['Solicitud de crédito PFAE', 'Autorización para consulta de historial crediticio PFAE', 'Aviso de privacidad'] },
      { name: 'Documentación de Identificación', docs: DOCS_PF_COMUNES_ID_NEGOCIO.slice(0, 4) },
      { name: 'Información del Negocio', docs: DOCS_PF_COMUNES_ID_NEGOCIO.slice(5) }
    ]
  },
  aval_aval_pfae: {
    title: 'OBLIGADO SOLIDARIO y AVAL (Persona Fisica con Actividad Empresarial)',
    sections: [
      { name: 'Documentos de Llenado', docs: ['Autorización para consulta de historial crediticio PFAE', 'Aviso de privacidad', 'Relación patrimonial'] },
      { name: 'Documentación de Identificación', docs: DOCS_PF_COMUNES_ID_NEGOCIO.slice(0, 4) },
      { name: 'Información del Negocio', docs: DOCS_PF_COMUNES_ID_NEGOCIO.slice(5) }
    ]
  },
  aval_aval_pm: {
    title: 'OBLIGADO SOLIDARIO y AVAL (Persona Moral)',
    sections: [
      { name: 'Documentos de Llenado', docs: ['Autorización para consulta de historial crediticio PM', 'Aviso de privacidad', 'Formato de integración accionaria'] },
      { name: 'Documentación Legal y de Identificación', docs: DOCS_PM_COMUNES_LEGAL_NEGOCIO.slice(0, 3) },
      { name: 'Información del Negocio', docs: DOCS_PM_COMUNES_LEGAL_NEGOCIO.slice(4) },
      { name: 'Información del Representante Legal', docs: DOCS_REPR_LEGAL }
    ]
  },
  tercero_garante_pfae: {
    title: 'TERCERO GARANTE (Persona Física con Actividad Empresarial)',
    sections: [
      { name: 'Documentos de Llenado', docs: ['Aviso de privacidad', 'Relación patrimonial'] },
      { name: 'Documentación de Identificación', docs: DOCS_PF_COMUNES_ID_NEGOCIO.slice(0, 5) },
      { name: 'Información del Negocio', docs: DOCS_PF_COMUNES_ID_NEGOCIO.slice(5) }
    ]
  },
  tercero_garante_pf: {
    title: 'TERCERO GARANTE (Persona Física)',
    sections: [
      { name: 'Documentos de Llenado y Identificación', docs: DOCS_TERCERO_GARANTE_PF }
    ]
  },
  tercero_garante_pm: {
    title: 'TERCERO GARANTE (Persona Moral)',
    sections: [
      { name: 'Documentos de Llenado', docs: ['Aviso de privacidad', 'Formato de integración accionaria'] },
      { name: 'Documentación Legal y de Identificación', docs: DOCS_PM_COMUNES_LEGAL_NEGOCIO.slice(0, 3) },
      { name: 'Información del Negocio', docs: DOCS_PM_COMUNES_LEGAL_NEGOCIO.slice(4) },
      { name: 'Información del Representante Legal', docs: DOCS_REPR_LEGAL }
    ]
  },
  garantia_hipotecaria: {
    title: 'DOCUMENTACIÓN DE GARANTÍA HIPOTECARIA',
    sections: [
      {
        name: 'Documentación de la Propiedad',
        docs: [
          'Escrituras que acrediten la titularidad de la propiedad con su RPPyC',
          'Estado de cuenta predial y comprobantes de pago',
          'Recibo de agua',
          'Avalúo reciente (no mayor a doce meses); en caso de no contar con él, preguntar a ejecutivo SOFIMAS',
          'Certificado de libertad de gravamen',
        ]
      }
    ]
  },
};

export default function ChecklistModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Script injection for PDF generation
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  // Cargar estado inicial
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('prospectChecklistState');
      if (savedState) {
        setFormData(JSON.parse(savedState));
      } else {
        const initial = {};
        checklistItemsData.forEach(item => initial[item.id] = '');
        setFormData(initial);
      }
    } catch (e) {
      console.error("Error loading state", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar estado al cambiar
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem('prospectChecklistState', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  // Manejador de cambios
  const handleSelectChange = (id, value) => {
    let newState = { ...formData, [id]: value };

    // Lógica especial: Si cambiamos el producto a crédito simple y teníamos garantía hipotecaria
    if (id === 'producto' && value === 'credito_simple') {
      if (newState.garantia === 'hipotecaria') {
        newState.garantia = ''; // Resetear
      }
    }

    setFormData(newState);
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar las selecciones?')) {
      const initial = {};
      checklistItemsData.forEach(item => initial[item.id] = '');
      setFormData(initial);
    }
  };

  // Lógica de "Dueño de Garantía" Texto
  const getDuenoGarantiaText = (duenoValue) => {
    const duenoItem = checklistItemsData.find(i => i.id === 'dueno_garantia');
    return duenoItem.options.find(o => o.value === duenoValue)?.text || '';
  };

  // Generación de lista de documentos
  const generatedDocuments = useMemo(() => {
    const documents = [];
    if (!formData.personalidad) return documents;

    // 1. Cliente
    const clienteKey = 'personalidad_' + formData.personalidad;
    if (DOCUMENT_MAP[clienteKey]) {
      documents.push(JSON.parse(JSON.stringify(DOCUMENT_MAP[clienteKey])));
    }

    const duenoEsCliente = formData.dueno_garantia === 'cliente';
    const duenoEsAval = formData.dueno_garantia && formData.dueno_garantia.startsWith('aval_');
    const duenoEsTercero = formData.dueno_garantia && formData.dueno_garantia.startsWith('tercero_garante_');

    // Lógica de jerarquía
    const addGarantia = () => {
      const garantiaKey = 'garantia_' + formData.garantia;
      const duenoText = getDuenoGarantiaText(formData.dueno_garantia);
      if (DOCUMENT_MAP[garantiaKey]) {
        const doc = JSON.parse(JSON.stringify(DOCUMENT_MAP[garantiaKey]));
        doc.title = `${doc.title} - ${duenoText.toUpperCase()}`;
        documents.push(doc);
      }
    };

    const addAval = () => {
      if (formData.aval !== 'no_aplica' && formData.aval) {
        const avalKey = 'aval_' + formData.aval;
        if (DOCUMENT_MAP[avalKey]) documents.push(JSON.parse(JSON.stringify(DOCUMENT_MAP[avalKey])));
      }
    };

    if (formData.garantia === 'no_aplica') {
      addAval();
    } else {
      if (duenoEsCliente) {
        addGarantia();
        addAval();
      } else if (duenoEsAval) {
        addAval();
        addGarantia();
      } else if (duenoEsTercero) {
        addAval();
        const terceroKey = formData.dueno_garantia;
        if (DOCUMENT_MAP[terceroKey]) documents.push(JSON.parse(JSON.stringify(DOCUMENT_MAP[terceroKey])));
        addGarantia();
      }
    }

    return documents;
  }, [formData]);

  // Validación de completado
  const isFormCompleted = useMemo(() => {
    for (const item of checklistItemsData) {
      const value = formData[item.id];
      // Generic check for required fields, plus specific checks
      if (item.required && !value) return false;

      if (item.id === 'dueno_garantia') {
        if (formData.garantia !== 'no_aplica' && !value) return false;
      }
    }
    return true;
  }, [formData]);


  // Generación de PDF
  const downloadPDF = async () => {
    if (!window.jspdf) {
      alert("La librería PDF aún se está cargando, intente en unos segundos.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Funciones Helper para el PDF
    const addLogo = () => {
       try {
         doc.setFont('Times', 'Bold');
         doc.setTextColor(39, 89, 150);
         doc.text("SOFIMAS", pageWidth - 40, 20);
       } catch(e) {}
    };

    const addFooter = (pageNumber, totalPages) => {
        doc.setPage(pageNumber);

        let footerY = pageHeight - 45;

        doc.setDrawColor(39, 89, 150);
        doc.setLineWidth(0.5);
        doc.line(15, footerY, pageWidth - 15, footerY);
        footerY += 5;

        doc.setFont('Times', 'Roman');
        doc.setFontSize(8);
        doc.setTextColor(52, 58, 64);

        const note1 = '*Este documento es de carácter informativo, por lo que no implica obligación ni compromiso por parte de **SOFIMAS Consultores del Noroeste, S.A. de C.V., SOFOM E.N.R.**';
        const note1Lines = doc.splitTextToSize(note1, pageWidth - 30);
        doc.text(note1Lines, 15, footerY);
        footerY += (note1Lines.length * 3);

        const note2 = '*SOFIMAS Consultores del Noroeste S.A de C.V., SOFOM E.N.R. podrá solicitar mayor información para completar el expediente de crédito.';
        const note2Lines = doc.splitTextToSize(note2, pageWidth - 30);
        doc.text(note2Lines, 15, footerY);
        footerY += (note2Lines.length * 3) + 3;

        doc.setDrawColor(200, 200, 200);
        doc.setLineDash([1, 1]);
        doc.line(15, footerY, pageWidth - 15, footerY);
        doc.setLineDash([]);
        footerY += 4;

        const leftColumnX = 15;
        const rightColumnX = pageWidth / 2 + 10;

        doc.setFont('Times', 'Bold');
        doc.setFontSize(8);
        doc.text('Redes Sociales:', leftColumnX, footerY);

        doc.setFont('Times', 'Roman');
        doc.setFontSize(7);
        doc.setTextColor(39, 89, 150);
        doc.textWithLink('www.facebook.com/sofimasmx', leftColumnX, footerY + 3, { url: 'https://www.facebook.com/sofimasmx' });
        doc.textWithLink('www.instagram.com/sofimasmx', leftColumnX, footerY + 6, { url: 'https://www.instagram.com/sofimasmx' });
        doc.text('LinkedIn - Sofimas', leftColumnX, footerY + 9);

        doc.setTextColor(52, 58, 64);
        doc.text('Sofimas Consultores del Noroeste S.A de C.V., SOFOM E.N.R', rightColumnX, footerY);
        doc.text('Blvd. Paseo Río Sonora Sur No. 205, Col. Proyecto Río', rightColumnX, footerY + 3);
        doc.text('Sonora', rightColumnX, footerY + 6);
        doc.text('C.P 83270, Hermosillo, Sonora.', rightColumnX, footerY + 9);
        doc.text('662-2102480', rightColumnX, footerY + 12);

        doc.setTextColor(39, 89, 150);
        doc.textWithLink('www.sofimas.com', rightColumnX, footerY + 15, { url: 'https://www.sofimas.com' });
        doc.textWithLink('contacto@sofimas.com', rightColumnX, footerY + 18, { url: 'mailto:contacto@sofimas.com' });

        doc.setFont('Times', 'Roman');
        doc.setFontSize(9);
        doc.setTextColor(52, 58, 64);
        doc.text(`${pageNumber} de ${totalPages}`, pageWidth - 25, pageHeight - 10);
    };

    addLogo();
    let y = 30;

    doc.setFont('Times', 'Bold');
    doc.setFontSize(16);
    doc.setTextColor(39, 89, 150);
    doc.text('CHECK LIST PROSPECTOS - SOFIMAS', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Tabla de Selecciones
    doc.setFont('Times', 'Roman');
    doc.setFontSize(10);
    doc.setTextColor(52, 58, 64);

    checklistItemsData.forEach(item => {
      // Handle Selects
      if (item.type === 'select') {
        const selectedOption = item.options.find(o => o.value === formData[item.id]);
        if (selectedOption) {
          if (y > 220) { doc.addPage(); addLogo(); y = 30; }
          doc.setFont('Times', 'Roman');
          doc.text(`• ${item.label}: `, 15, y);
          doc.setFont('Times', 'Bold');
          doc.text(selectedOption.text, 15 + doc.getTextWidth(`• ${item.label}: `), y);
          doc.setFont('Times', 'Roman');
          y += 5;
        }
      } 
      // Handle Inputs (Text, Email, Tel)
      else if (['text', 'tel', 'email'].includes(item.type)) {
        const value = formData[item.id];
        if (value) {
           if (y > 220) { doc.addPage(); addLogo(); y = 30; }
           doc.setFont('Times', 'Roman');
           doc.text(`• ${item.label}: `, 15, y);
           doc.setFont('Times', 'Bold');
           doc.text(value, 15 + doc.getTextWidth(`• ${item.label}: `), y);
           doc.setFont('Times', 'Roman');
           y += 5;
        }
      }
    });
    y += 5;

    // Documentos
    const drawCheckbox = (x, y) => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.rect(x, y - 3 + 0.5, 3, 3);
    };

    doc.setFontSize(12);
    generatedDocuments.forEach(party => {
        if (y > 220) { doc.addPage(); addLogo(); y = 30; }
        
        y += 5;
        doc.setFont('Times', 'Bold');
        doc.setFontSize(12);
        doc.setTextColor(39, 89, 150);
        const titleLines = doc.splitTextToSize(party.title, pageWidth - 30);
        doc.text(titleLines, 15, y);
        y += (titleLines.length * 5);

        party.sections.forEach(section => {
             if (y > 220) { doc.addPage(); addLogo(); y = 30; }
             
             y += 3;
             doc.setFont('Times', 'Bold');
             doc.setFontSize(11);
             doc.setTextColor(52, 58, 64);
             doc.text(section.name, 20, y);
             y += 6;

             doc.setFont('Times', 'Roman');
             doc.setFontSize(10);

             section.docs.forEach((docItem, index) => {
                 if (y > 220) { doc.addPage(); addLogo(); y = 30; }
                 
                 const linkSource = LINK_MAP[docItem] || '';
                 const isExcluded = ['Ingreso de clave CIEC en portal de Análisis de Crédito', 'CURP'].includes(docItem);
                 let linkDisplay = '';
                 let url = null;

                 if (linkSource.startsWith('http')) {
                     linkDisplay = isExcluded ? ' (Link)' : ' (Descargar)';
                     url = isExcluded ? linkSource : linkSource.split('?')[0] + '?download=1';
                 } else if (linkSource) {
                     linkDisplay = ` (${linkSource})`;
                 }

                 const docText = `${index + 1}. ${docItem}${linkDisplay}`;
                 const lines = doc.splitTextToSize(docText, 165);
                 
                 drawCheckbox(25, y);
                 doc.setTextColor(52, 58, 64);
                 doc.text(lines, 32, y);

                 if (url) {
                     doc.link(32, y - 3.5, 165, lines.length * 4, { url });
                     doc.setTextColor(39, 89, 150);
                 }

                 y += (lines.length * 4);
             });
             y += 2;
        });
    });

    // Final Footer Loop
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        addFooter(i, totalPages);
    }
    
    doc.save(`Check List - Sofimas - ${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] modal-animate">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
              <FileText className="text-[#135bec]" />
              Check List Prospectos Sofimas
            </h2>
            <p className="text-sm text-slate-500">Genera la lista de documentos requeridos</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Formulario de Selección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              {checklistItemsData.map((item) => {
                if (item.id === 'dueno_garantia' && formData.garantia === 'no_aplica') {
                  return (
                    <div key={item.id} className="md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-center gap-2">
                      <AlertCircle className="text-amber-500" size={18} />
                      <p className="text-amber-700 dark:text-amber-400 text-sm">No aplica dueño de garantía si no hay garantía seleccionada.</p>
                    </div>
                  );
                }

                // Render Input or Select
                const isCompleted = formData[item.id] !== '' && formData[item.id] !== undefined;
                
                let inputElement;

                if (item.type === 'select') {
                    const renderOptions = item.options.map(opt => {
                        let disabled = opt.disabled;
                        // Cross-validation
                        if (item.id === 'dueno_garantia' && opt.value === 'aval_pfae' && formData.aval === 'aval_pm') disabled = true;
                        if (item.id === 'aval' && opt.value === 'aval_pm' && formData.dueno_garantia === 'aval_pfae') disabled = true;
                        if (item.id === 'dueno_garantia' && opt.value === 'aval_pm' && formData.aval === 'aval_pfae') disabled = true;
                        if (item.id === 'aval' && opt.value === 'aval_pfae' && formData.dueno_garantia === 'aval_pm') disabled = true;
                        if (item.id === 'garantia' && opt.value === 'hipotecaria' && formData.producto === 'credito_simple') disabled = true;
      
                        return (
                          <option key={opt.value} value={opt.value} disabled={disabled}>
                            {opt.text}
                          </option>
                        );
                      });

                    inputElement = (
                        <select
                            value={formData[item.id] || ''}
                            onChange={(e) => handleSelectChange(item.id, e.target.value)}
                            className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all ${
                                isCompleted 
                                ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' 
                                : 'border-slate-300 dark:border-slate-600 focus:border-[#135bec] focus:ring-[#135bec]/20'
                            }`}
                          >
                            {renderOptions}
                          </select>
                    );
                } else {
                    // Input text, email, tel
                    inputElement = (
                        <input
                            type={item.type}
                            placeholder={item.placeholder}
                            value={formData[item.id] || ''}
                            onChange={(e) => handleSelectChange(item.id, e.target.value)}
                            className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all ${
                                isCompleted 
                                ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' 
                                : 'border-slate-300 dark:border-slate-600 focus:border-[#135bec] focus:ring-[#135bec]/20'
                            }`}
                        />
                    );
                }


                return (
                  <div key={item.id} className={`space-y-2 ${item.colSpan || item.id === 'producto' || item.id === 'dueno_garantia' ? 'md:col-span-2' : ''}`}>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                      {item.label}
                    </label>
                    <div className="relative">
                      {inputElement}
                      {isCompleted && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <CheckCircle size={16} className="text-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
                onClick={handleReset}
                className="text-red-500 hover:text-red-600 text-sm font-medium underline underline-offset-4"
            >
                Reiniciar Selecciones
            </button>

            {/* Resultados */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                    <FileText size={20} className="text-[#135bec]" />
                    Documentos Requeridos
                </h3>
              
                {!isFormCompleted ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                        <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                        <p>Complete todas las selecciones para generar la lista.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                        {generatedDocuments.map((party, pIdx) => (
                          <div key={pIdx} className="space-y-4">
                            <h4 className="text-md font-bold text-[#135bec] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg inline-block">
                              {party.title}
                            </h4>
                            <div className="grid gap-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                {party.sections.map((section, sIdx) => (
                                  <div key={sIdx}>
                                    <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                      {section.name}
                                    </h5>
                                    <ul className="space-y-2">
                                      {section.docs.map((doc, dIdx) => {
                                        const linkSource = LINK_MAP[doc] || '';
                                        const isExcluded = ['Ingreso de clave CIEC en portal de Análisis de Crédito', 'CURP'].includes(doc);
                                        const hasLink = linkSource && linkSource.startsWith('http');
                                        
                                        return (
                                          <li key={dIdx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                            <span>
                                              {doc}
                                              {hasLink && (
                                                <a 
                                                  href={isExcluded ? linkSource : linkSource.split('?')[0] + '?download=1'} 
                                                  target="_blank" 
                                                  rel="noreferrer"
                                                  className="ml-1.5 text-[#135bec] hover:underline font-medium inline-flex items-center gap-0.5"
                                                >
                                                  {isExcluded ? '(Link)' : '(Descargar)'}
                                                </a>
                                              )}
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          
          {onSave && (
            <button 
                onClick={() => onSave({
                    ...formData,
                    name: formData.nombre,
                    email: formData.email,
                    phone: formData.telefono
                })}
                disabled={!isFormCompleted}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-md transition-all ${
                    !isFormCompleted 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]'
                }`}
            >
                <Save size={18} />
                Guardar Prospecto
            </button>
          )}

          <button 
            onClick={downloadPDF}
            disabled={!isFormCompleted}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-md transition-all ${
                !isFormCompleted 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                : 'bg-[#135bec] hover:bg-[#135bec]/90 text-white hover:scale-[1.02]'
            }`}
          >
            <Download size={18} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
