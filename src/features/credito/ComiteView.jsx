import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Calendar, 
  Menu, 
  Bell, 
  ChevronRight,
  Plus,
  Save,
  ArrowLeft,
  Trash2,
  Briefcase,
  Download,
  Printer,
  Presentation
} from 'lucide-react';
import jsPDF from 'jspdf';
import logo from '../../assets/sofimas-logo.png';

// --- Datos Iniciales ---
const INITIAL_MINUTES = [
  {
    id: "CCC-0725-081",
    type: "Extraordinaria",
    date: "2025-07-11",
    time: "12:00",
    location: "Virtual / Sala de Juntas Oficinas Centrales, Hermosillo, Sonora",
    address: "Av. Dr Fernando Aguilar 11, Colonia Centenario",
    status: "Finalizada",
    attendees: [
      { name: "Gustavo Mazón Escalante", role: "Presidente", type: "Voz y Voto" },
      { name: "Jesús Oscar Peraza Inda", role: "Vocal", type: "Voz y Voto" },
      { name: "Diego Mazón Escalante", role: "Vocal", type: "Voz y Voto" },
      { name: "José Santiago Peraza Chávez", role: "Vocal", type: "Voz y Voto" },
      { name: "Eduardo Salas G.", role: "Secretario", type: "Voz" },
      { name: "Daniel Vega López", role: "Invitado", type: "Voz" },
    ],
    requests: [
      {
        id: "REQ-001",
        client: "GC Grupo Cimarrón S.A de C.V",
        commercialDev: "Eduardo Salas G",
        amount: 1000000.00,
        rate: "28.00% anual",
        moratoriumRate: "2 veces la ordinaria",
        term: "7 meses",
        modality: "Crédito quirografario",
        disposition: "Hasta 215 días",
        commission: "1.00% + IVA",
        amortization: "Intereses mensual y capital al vencimiento",
        destination: "Capital de Trabajo",
        guarantor: "Corporativo Operador De Empresas S.C",
        notes: "Solicitud de capital de trabajo por 1 mdp tipo bullet.",
        status: "Aprobado"
      },
      {
        id: "REQ-002",
        client: "GC Grupo Cimarrón S.A de C.V",
        commercialDev: "Eduardo Salas G",
        amount: 700000.00,
        rate: "28.00% anual",
        moratoriumRate: "2 veces la ordinaria",
        term: "7 meses",
        modality: "Crédito quirografario",
        disposition: "Hasta 215 días",
        commission: "1.00% + IVA",
        amortization: "Intereses mensual y capital al vencimiento",
        destination: "Capital de Trabajo",
        guarantor: "Corporativo Operador De Empresas S.C",
        notes: "Liquidación programada para el 14 de febrero de 2026.",
        status: "Aprobado"
      }
    ]
  }
];

// --- Componentes Auxiliares ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const InputGroup = ({ label, type = "text", value, onChange, placeholder, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
    />
  </div>
);

const SelectGroup = ({ label, value, onChange, options, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
    <select 
      value={value} 
      onChange={onChange}
      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const SectionTitle = ({ title, icon: Icon, action }) => (
  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4 mt-6">
    <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center">
      {Icon && <Icon size={16} className="mr-2 text-blue-600" />}
      {title}
    </h3>
    {action}
  </div>
);

const handleGenerateSlide = (req) => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'letter' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Colors
    const primaryBlue = [26, 69, 128]; 
    const secondaryBlue = [19, 91, 236];
    const lightBg = [245, 247, 250];

    // Background Layout
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');
    
    // Header Bar
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, width, 25, 'F');
    
    // Logo (Simulated or Loaded)
    const img = new Image();
    img.src = logo;
    
    const renderContent = () => {
         // Title Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("Presentación de Caso - Comité de Crédito", width - margin, 17, { align: 'right' });
        
        // Client Title Card
        doc.setFillColor(...lightBg);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(margin, 35, width - (margin * 2), 25, 3, 3, 'FD');
        
        doc.setTextColor(...primaryBlue);
        doc.setFontSize(16);
        doc.text((req.client || 'Cliente Sin Nombre').toUpperCase(), margin + 10, 52);
        
        // Stats badges inside Title Card
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        const amountStr = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(req.amount || 0);
        doc.text(`Monto: ${amountStr}`, width - margin - 10, 52, { align: 'right' });

        // Main Grid
        const col1X = margin;
        const col1W = (width - (margin * 3)) * 0.4;
        const col2X = col1X + col1W + margin;
        const col2W = (width - (margin * 3)) * 0.6;
        const startY = 70;
        
        // Function to draw a field box
        const drawField = (label, value, x, y, w) => {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(label.toUpperCase(), x, y);
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            
            const splitVal = doc.splitTextToSize(String(value || 'N/A'), w);
            doc.text(splitVal, x, y + 6);
            
            return y + 15 + (splitVal.length * 4);
        };

        // --- Left Column: Financials ---
        let currentY = startY;
        
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(col1X - 5, currentY - 10, col1W + 10, 120, 3, 3, 'F'); // Background box
        
        doc.setFontSize(12); doc.setTextColor(...secondaryBlue); doc.text("Condiciones Financieras", col1X, currentY);
        currentY += 15;

        currentY = drawField("Producto / Modalidad", req.modality, col1X, currentY, col1W);
        currentY = drawField("Plazo Solicitado", req.term, col1X, currentY, col1W);
        currentY = drawField("Tasa Ordinaria", req.rate, col1X, currentY, col1W);
        currentY = drawField("Comisión", req.commission, col1X, currentY, col1W);
        currentY = drawField("Amortización", req.amortization, col1X, currentY, col1W);
        
        // --- Right Column: Qualitative ---
        currentY = startY;
        
        doc.setFontSize(12); doc.setTextColor(...secondaryBlue); doc.text("Análisis y Destino", col2X, currentY);
        currentY += 15;
        
        currentY = drawField("Destino de los Recursos", req.destination, col2X, currentY, col2W);
        currentY = drawField("Garantías / Avales", req.guarantor, col2X, currentY, col2W);
        currentY = drawField("Notas del Analista / Observaciones", req.notes, col2X, currentY, col2W);
        
        // Resolution Stamp (if exists)
        if (req.status) {
            const stampColor = req.status === 'Aprobado' ? [34, 197, 94] : [234, 179, 8];
            doc.setDrawColor(...stampColor);
            doc.setLineWidth(1);
            doc.rect(width - margin - 50, height - margin - 30, 40, 15, 'S');
            
            doc.setTextColor(...stampColor);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(req.status.toUpperCase(), width - margin - 30, height - margin - 21, { align: 'center' });
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("SOFIMAS - Documento Confidencial de Uso Interno", width / 2, height - 10, { align: 'center' });
        
        doc.save(`Presentacion_${req.client.replace(/\s+/g, '_')}.pdf`);
    };

    img.onload = () => {
         try {
            const logoW = 40;
            const logoH = (img.height * logoW) / img.width;
            doc.addImage(img, 'PNG', margin, (25 - logoH) / 2, logoW, logoH);
         } catch(e) {}
         renderContent();
    };
    
    // Fallback if image fails or takes too long (optional, but good practice)
    if (!img.complete) {
        setTimeout(() => { if(!doc.output('datauristring')) renderContent(); }, 1000);
    } else {
        renderContent();
    }
};

const handlePrint = (minute) => {
  try {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes para generar el PDF');
      return;
    }
    
    // Helpers - Manejo seguro de fechas
    let longDate = 'FECHA NO DEFINIDA';
    if (minute.date) {
        try {
            const [year, month, day] = minute.date.split('-');
            const dateObj = new Date(year, month - 1, day);
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            longDate = dateObj.toLocaleDateString('es-ES', dateOptions).toUpperCase();
        } catch (e) {
            console.error("Error formateando fecha", e);
        }
    }

    const formatMoney = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);

    // Filtrado de asistentes para firmas (Fallback seguro)
    const attendeesRaw = minute.attendees || [];
    const president = attendeesRaw.find(a => a.role && a.role.toLowerCase().includes('presidente'));
    const secretary = attendeesRaw.find(a => a.role && a.role.toLowerCase().includes('secretario'));
    const vocals = attendeesRaw.filter(a => a.role && a.role.toLowerCase().includes('vocal'));
    
    // Organizar firmas en pares para la tabla
    const signatureList = [
      president,
      ...vocals,
      secretary
    ].filter(Boolean); // Filtrar undefined

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Acta ${minute.id || 'Borrador'}</title>
      <style>
        @page { 
          size: letter; 
          margin: 2.54cm; /* Margen estándar Word */
        }
        body {
          font-family: "Times New Roman", Times, serif;
          font-size: 12pt;
          line-height: 1.5; /* Interlineado 1.5 líneas */
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
        }
        .header-text {
          text-align: justify;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 18pt;
        }
        p {
          text-align: justify;
          margin-bottom: 12pt;
          margin-top: 0;
        }
        .section-header {
          font-weight: bold;
          margin-bottom: 6pt;
        }
        .attendee-line {
          margin-bottom: 0;
          margin-top: 0;
        }
        .order-list {
          margin-top: 6pt;
          margin-bottom: 12pt;
          padding-left: 36pt;
        }
        .order-list li {
          margin-bottom: 3pt;
        }
        .request-block {
          margin-top: 18pt;
          margin-bottom: 18pt;
          page-break-inside: avoid;
        }
        .kv-row {
          margin-bottom: 0;
        }
        .kv-label {
          font-weight: bold;
        }
        /* Tabla de firmas para alineación perfecta */
        .signatures-table {
          width: 100%;
          margin-top: 48pt;
          border-collapse: collapse;
          page-break-inside: avoid;
        }
        .signatures-table td {
          width: 50%;
          vertical-align: top;
          padding: 0 12pt 36pt 12pt; /* Espacio entre filas */
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 90%;
          margin: 0 auto 6pt auto;
        }
        .sig-name {
          font-weight: bold;
          display: block;
        }
        .sig-role {
          display: block;
        }
        .center-text {
          text-align: center;
        }
      </style>
    </head>
    <body>

      <div class="header-text">
        ACTA QUE SE LEVANTA DEBIDO A LA SESIÓN ${(minute.type || 'ORDINARIA').toUpperCase()} DE COMITÉ DE CRÉDITO CENTRAL DE SOFIMAS CONSULTORES DEL NOROESTE S.A. DE C.V., SOFOM E.N.R. CELEBRADA EL DÍA ${longDate} A LAS ${minute.time || '12:00'} HORAS, DE MANERA VIRTUAL, A TRAVÉS DE VIDEO CONFERENCIA VIA ZOOM, EN LA SALA DE JUNTAS DE LAS OFICINAS CENTRALES DE SOFIMAS, UBICADAS EN ${minute.address || 'AV. DR FERNANDO AGUILAR 11, COLONIA CENTENARIO'} EN HERMOSILLO, SONORA, CON LA ASISTENCIA DE LOS INTEGRANTES QUE SE MENCIONAN A CONTINUACIÓN:
      </div>

      <div class="section-header">Miembros del Comité de Crédito con Voz y Voto:</div>
      ${attendeesRaw.filter(m => m.type === 'Voz y Voto').map(m => `
        <div class="attendee-line">${m.role}: Sr. ${m.name}</div>
      `).join('')}

      <br/>
      <div class="section-header">Asisten también con Voz Funcionarios e invitados de SOFIMAS Consultores del Noroeste S.A. de C.V. SOFOM E.N.R.:</div>
      ${attendeesRaw.filter(m => m.type !== 'Voz y Voto').map(m => `
        <div class="attendee-line">${m.role}: ${m.name}</div>
      `).join('')}

      <p style="margin-top: 18pt;">
        Los Miembros del Comité asistentes, así como los invitados fueron convocados a la sesión mediante comunicación por medio electrónico; invitación hecha conforme a norma, con un mínimo de un día de anticipación a la celebración de la sesión ${(minute.type || 'ordinaria').toLowerCase()} de Comité de Crédito Central convocada.
      </p>

      <p>
        Se dio inicio a la sesión, en donde el Secretario del Comité de Crédito Central, presenta el Orden del Día de acuerdo con los siguientes puntos:
      </p>

      <div class="center-text section-header">ORDEN DEL DÍA</div>
      <ol class="order-list">
        <li>Declaración del quórum de asistencia.</li>
        <li>Información de Confidencialidad.</li>
        <li>Solicitud de Crédito</li>
      </ol>

      <p>
        En desahogo del primer punto del Orden del Día, el Secretario declara que se encuentran reunidos en esta sesión la mayoría de los integrantes del Comité de Crédito Central. Por lo que se declara legalmente constituida la sesión y válidas las resoluciones que en ella se tomen.
      </p>

      <p>
        Acto seguido se procedió al desahogo del segundo punto de la Orden del Día, en el que el Secretario informa a los Asistentes a la Sesión de Comité que toda información divulgada y acuerdos tomados son de estricta confidencialidad en conformidad con el Reglamento Interno del Comité de Crédito Central.
      </p>

      <p>
        Por último, se desahoga el tercer punto del orden del día y se presentan los siguientes casos a sancionar:
      </p>

      ${(minute.requests || []).map(req => `
        <div class="request-block">
          <div class="kv-row"><span class="kv-label">Solicitud:</span> ${req.client || ''}</div>
          <div class="kv-row"><span class="kv-label">Desarrollo Comercial:</span> ${req.commercialDev || 'P.A. Eduardo Salas G'}</div>
          <div class="kv-row"><span class="kv-label">Monto:</span> ${formatMoney(req.amount || 0)}</div>
          <div class="kv-row"><span class="kv-label">Tasa ordinaria:</span> ${req.rate || ''}</div>
          <div class="kv-row"><span class="kv-label">Tasa moratoria:</span> ${req.moratoriumRate || '2 veces la ordinaria'}</div>
          <div class="kv-row"><span class="kv-label">Plazo:</span> ${req.term || ''}</div>
          <div class="kv-row"><span class="kv-label">Modalidad:</span> ${req.modality || ''}</div>
          <div class="kv-row"><span class="kv-label">Disposiciones:</span> ${req.disposition || 'N/A'}</div>
          <div class="kv-row"><span class="kv-label">Comisión por disposición y/o renovación:</span> ${req.commission || ''}</div>
          <div class="kv-row"><span class="kv-label">Amortización:</span> ${req.amortization || 'Intereses mensual y capital al vencimiento'}</div>
          <div class="kv-row"><span class="kv-label">Destino:</span> ${req.destination || ''}</div>
          <div class="kv-row"><span class="kv-label">Aval y Obligado Solidario:</span> ${req.guarantor || 'N/A'}</div>
          <div class="kv-row"><span class="kv-label">Solicitud:</span> ${req.notes || ''}</div>
          <div class="kv-row" style="margin-top: 6pt;"><span class="kv-label">Resolución:</span> ${req.status || 'Pendiente'}.</div>
        </div>
      `).join('')}

      ${(!minute.requests || minute.requests.length === 0) ? '<p style="text-align:center; font-style:italic; margin: 24pt 0;">(Espacio reservado para inserción de casos)</p>' : ''}

      <br/>
      <div class="section-header">Miembros del Comité Central de Crédito:</div>

      <table class="signatures-table">
        ${Array.from({ length: Math.ceil(signatureList.length / 2) }).map((_, i) => {
          const m1 = signatureList[i * 2];
          const m2 = signatureList[i * 2 + 1];
          return `
            <tr>
              <td>
                ${m1 ? `
                  <div class="signature-line"></div>
                  <span class="sig-name">Sr. ${m1.name}</span>
                  <span class="sig-role">${m1.role}</span>
                ` : ''}
              </td>
              <td>
                ${m2 ? `
                  <div class="signature-line"></div>
                  <span class="sig-name">Sr. ${m2.name}</span>
                  <span class="sig-role">${m2.role}</span>
                ` : ''}
              </td>
            </tr>
          `;
        }).join('')}
        
        <!-- Sección fija para Invitados si es necesario separar -->
        ${attendeesRaw.some(a => a.role === 'Invitado') ? `
          <tr><td colspan="2" style="padding-top: 20pt;"><strong>Invitados del Comité Central de Crédito:</strong></td></tr>
          ${attendeesRaw.filter(a => a.role === 'Invitado').map(inv => `
             <tr>
               <td colspan="2">
                  <div class="signature-line" style="width: 50%;"></div>
                  <span class="sig-name">Sr. ${inv.name}</span>
               </td>
             </tr>
          `).join('')}
        ` : ''}
      </table>
      
      <script>
        // Imprimir automáticamente al cargar
        window.onload = function() {
             setTimeout(function() {
                 window.print();
             }, 500); 
        };
      </script>
    </body>
    </html>
  `;

  // Escribir y cerrar el documento
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Hubo un error al generar el documento. Verifica los datos de fecha y hora.");
  }
};

// --- Componente Principal ---

export default function ComiteView({ onBack }) {
  const [minutes, setMinutes] = useState(INITIAL_MINUTES);
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedMinute, setSelectedMinute] = useState(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    id: '',
    type: 'Ordinaria',
    date: '',
    time: '',
    location: '',
    address: 'Av. Dr Fernando Aguilar 11, Colonia Centenario',
    attendees: [],
    requests: []
  });

  const handleNewMinute = () => {
    // Cargar asistentes predeterminados desde configuración o usar defaults
    const savedMembers = localStorage.getItem('comiteMembers');
    const defaultAttendees = savedMembers ? JSON.parse(savedMembers) : [
      { name: "Gustavo Mazón Escalante", role: "Presidente", type: "Voz y Voto" },
      { name: "Jesús Oscar Peraza Inda", role: "Vocal", type: "Voz y Voto" },
      { name: "Diego Mazón Escalante", role: "Vocal", type: "Voz y Voto" },
      { name: "José Santiago Peraza Chávez", role: "Vocal", type: "Voz y Voto" },
      { name: "Eduardo Salas G.", role: "Secretario", type: "Voz" },
      { name: "Daniel Vega López", role: "Invitado", type: "Voz" }
    ];

    setFormData({
      id: `CCC-${new Date().getFullYear()}-${String(minutes.length + 1).padStart(3, '0')}`,
      type: 'Ordinaria',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      location: 'Sala de Juntas Oficinas Centrales',
      address: 'Av. Dr Fernando Aguilar 11, Colonia Centenario',
      attendees: defaultAttendees,
      requests: []
    });
    setView('form');
  };

  const handleSave = () => {
    const newMinute = { ...formData, status: 'Finalizada' };
    setMinutes([newMinute, ...minutes]);
    setView('list');
  };

  const addAttendee = () => {
    setFormData({
      ...formData,
      attendees: [...formData.attendees, { name: '', role: 'Vocal', type: 'Voz y Voto' }]
    });
  };

  const updateAttendee = (index, field, value) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index][field] = value;
    setFormData({ ...formData, attendees: newAttendees });
  };

  const removeAttendee = (index) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== index)
    });
  };

  const addRequest = () => {
    setFormData({
      ...formData,
      requests: [...formData.requests, {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        client: '',
        amount: 0,
        rate: '28.00% anual',
        term: '12 meses',
        modality: 'Crédito Simple',
        destination: 'Capital de Trabajo',
        status: 'Pendiente'
      }]
    });
  };

  const updateRequest = (index, field, value) => {
    const newRequests = [...formData.requests];
    newRequests[index][field] = value;
    setFormData({ ...formData, requests: newRequests });
  };

  const removeRequest = (index) => {
    setFormData({
      ...formData,
      requests: formData.requests.filter((_, i) => i !== index)
    });
  };

  // --- Vistas ---

  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
        {onBack && (
            <button 
                onClick={onBack}
                className="text-slate-500 hover:text-slate-800 flex items-center text-sm font-medium mb-4"
            >
                <ArrowLeft size={16} className="mr-1" /> Volver al Panel de Crédito
            </button>
        )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Actas de Comité</h1>
          <p className="text-slate-500 mt-1">Historial y gestión de sesiones</p>
        </div>
        <button 
          onClick={handleNewMinute}
          className="bg-[#135bec] hover:bg-[#135bec]/90 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-[#135bec]/25 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Nueva Acta
        </button>
      </div>

      <div className="grid gap-4">
        {minutes.map((minute) => (
          <Card key={minute.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div 
              className="p-6 flex flex-col md:flex-row md:items-center justify-between"
              onClick={() => { setSelectedMinute(minute); setView('detail'); }}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Acta {minute.id}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                    <span className="flex items-center"><Calendar size={14} className="mr-1"/> {minute.date}</span>
                    <span className="flex items-center"><Users size={14} className="mr-1"/> {minute.attendees.length} Asistentes</span>
                    <span className="flex items-center"><Briefcase size={14} className="mr-1"/> {minute.requests.length} Solicitudes</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  minute.status === 'Finalizada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {minute.status}
                </span>
                <ChevronRight size={20} className="text-slate-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="animate-fade-in max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setView('list')}
          className="text-slate-500 hover:text-slate-800 flex items-center text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" /> Cancelar
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Registrar Nueva Acta</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => handlePrint(formData)}
            className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-4 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all"
          >
            <Printer size={18} className="mr-2" />
            Imprimir Borrador
          </button>
          <button 
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all"
          >
            <Save size={18} className="mr-2" />
            Guardar Acta
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Datos Generales */}
        <Card className="p-6">
          <SectionTitle title="Datos de la Sesión" icon={Calendar} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup 
              label="Folio del Acta" 
              value={formData.id} 
              onChange={(e) => setFormData({...formData, id: e.target.value})}
            />
            <SelectGroup 
              label="Tipo de Sesión"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              options={['Ordinaria', 'Extraordinaria']}
            />
            <InputGroup 
              label="Fecha" 
              type="date"
              value={formData.date} 
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
            <InputGroup 
              label="Hora" 
              type="time"
              value={formData.time} 
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
            <InputGroup 
              label="Ubicación / Medio" 
              className="md:col-span-2"
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
             <InputGroup 
              label="Dirección Oficial" 
              className="md:col-span-2"
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </Card>

        {/* 2. Asistentes */}
        <Card className="p-6">
          <SectionTitle 
            title="Lista de Asistencia" 
            icon={Users}
            action={
              <button onClick={addAttendee} className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                <Plus size={14} className="mr-1"/> Agregar Asistente
              </button>
            } 
          />
          <div className="space-y-3">
            {formData.attendees.map((att, idx) => (
              <div key={idx} className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                <InputGroup 
                  label="Nombre Completo" 
                  className="flex-1"
                  placeholder="Nombre del asistente"
                  value={att.name}
                  onChange={(e) => updateAttendee(idx, 'name', e.target.value)}
                />
                <InputGroup 
                  label="Cargo" 
                  className="w-1/3"
                  placeholder="Ej. Presidente"
                  value={att.role}
                  onChange={(e) => updateAttendee(idx, 'role', e.target.value)}
                />
                <SelectGroup 
                  label="Tipo de Voto"
                  className="w-1/4"
                  value={att.type}
                  onChange={(e) => updateAttendee(idx, 'type', e.target.value)}
                  options={['Voz y Voto', 'Voz', 'Oyente']}
                />
                <button 
                  onClick={() => removeAttendee(idx)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mb-[1px]"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Solicitudes */}
        <Card className="p-6 border-l-4 border-l-blue-500">
          <SectionTitle 
            title="Solicitudes a Sancionar" 
            icon={Briefcase}
            action={
              <button onClick={addRequest} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-100 flex items-center transition-colors">
                <Plus size={14} className="mr-1"/> Agregar Solicitud
              </button>
            } 
          />
          
          {formData.requests.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              No hay solicitudes registradas para esta sesión.
            </div>
          )}

          <div className="space-y-6">
            {formData.requests.map((req, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleGenerateSlide(req)}
                    className="text-indigo-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded"
                    title="Descargar Presentación"
                  >
                    <Presentation size={18} />
                  </button>
                  <button 
                    onClick={() => removeRequest(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Solicitud #{idx + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <InputGroup 
                    label="Cliente / Solicitante" 
                    className="md:col-span-2"
                    value={req.client}
                    onChange={(e) => updateRequest(idx, 'client', e.target.value)}
                  />
                  <InputGroup 
                    label="Monto Solicitado" 
                    type="number"
                    value={req.amount}
                    onChange={(e) => updateRequest(idx, 'amount', parseFloat(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <InputGroup 
                    label="Tasa Ord." 
                    value={req.rate}
                    onChange={(e) => updateRequest(idx, 'rate', e.target.value)}
                  />
                  <InputGroup 
                    label="Plazo" 
                    value={req.term}
                    onChange={(e) => updateRequest(idx, 'term', e.target.value)}
                  />
                  <InputGroup 
                    label="Comisión" 
                    value={req.commission}
                    onChange={(e) => updateRequest(idx, 'commission', e.target.value)}
                  />
                  <SelectGroup 
                    label="Resolución"
                    value={req.status}
                    onChange={(e) => updateRequest(idx, 'status', e.target.value)}
                    options={['Pendiente', 'Aprobado', 'Rechazado', 'Condicionado']}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <InputGroup 
                    label="Destino" 
                    value={req.destination}
                    onChange={(e) => updateRequest(idx, 'destination', e.target.value)}
                  />
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Notas / Observaciones</label>
                    <textarea 
                      value={req.notes}
                      onChange={(e) => updateRequest(idx, 'notes', e.target.value)}
                      rows={2}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedMinute) return null;
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setView('list')}
            className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver a lista
          </button>
          
          <button 
            onClick={() => handlePrint(selectedMinute)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all"
          >
            <Download size={18} className="mr-2" />
            Descargar PDF / Imprimir
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Acta {selectedMinute.id}</h1>
            <p className="text-slate-500 mt-1 flex items-center">
              <Calendar size={16} className="mr-2" />
              {selectedMinute.date} • {selectedMinute.time} hrs
            </p>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
            {selectedMinute.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Resoluciones del Comité</h2>
             {selectedMinute.requests.map((req, idx) => (
               <Card key={idx} className="p-6 border-l-4 border-l-green-500">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{req.client}</h3>
                      <p className="text-sm text-slate-500">Desarrollo: {req.commercialDev || 'N/A'}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <p className="text-lg font-bold text-slate-800">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(req.amount)}
                       </p>
                       <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 mb-2">{req.modality}</span>
                       
                       <button 
                         onClick={() => handleGenerateSlide(req)}
                         className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
                         title="Generar PDF tipo diapositiva"
                       >
                         <Presentation size={14} /> Diapositiva
                       </button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><span className="text-slate-500 block text-xs">Tasa</span> {req.rate}</div>
                    <div><span className="text-slate-500 block text-xs">Plazo</span> {req.term}</div>
                    <div className="col-span-2"><span className="text-slate-500 block text-xs">Destino</span> {req.destination}</div>
                 </div>
                 <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 italic">
                   "{req.notes}"
                 </div>
               </Card>
             ))}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <Users size={18} className="mr-2 text-slate-500"/> Asistentes
              </h3>
              <div className="space-y-3">
                {selectedMinute.attendees.map((att, i) => (
                  <div key={i} className="text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                    <p className="font-medium text-slate-900">{att.name}</p>
                    <p className="text-xs text-slate-500">{att.role} ({att.type})</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-4">Detalles</h3>
              <div className="text-sm space-y-3">
                <div>
                  <span className="block text-xs text-slate-500 uppercase">Ubicación</span>
                  <p>{selectedMinute.location}</p>
                </div>
                 <div>
                  <span className="block text-xs text-slate-500 uppercase">Tipo</span>
                  <p>{selectedMinute.type}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8"> 
          {view === 'list' && renderList()}
          {view === 'form' && renderForm()}
          {view === 'detail' && renderDetail()}
      </div>
    </div>
  );
}
