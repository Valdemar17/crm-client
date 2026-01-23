
/* eslint-disable no-unused-vars */

export const checklistItemsData = [
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

export const LINK_MAP = {
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
export function convertirADescargaDirecta(urlOriginal, docName = '') {
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

const getDuenoGarantiaText = (duenoValue) => {
    const duenoItem = checklistItemsData.find(i => i.id === 'dueno_garantia');
    return duenoItem.options.find(o => o.value === duenoValue)?.text || '';
};

export const getGeneratedDocuments = (formData) => {
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
};