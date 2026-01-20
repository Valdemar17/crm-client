import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  FileText, CheckCircle, AlertCircle, XCircle, Filter, 
  Upload, Search, ChevronDown, ChevronUp, LayoutDashboard,
  FileBarChart, AlertTriangle, List, Briefcase, MessageSquare, ArrowLeft
} from 'lucide-react';

// --- COLORES ---
const COLORS = {
  cumple: '#10B981', // Emerald 500
  falta: '#EF4444', // Red 500
  noCumple: '#F59E0B', // Amber 500
  na: '#94A3B8',    // Slate 400
  conObservacion: '#8B5CF6' // Violet 500
};

// --- DATOS INICIALES COMPLETOS (Actualizado con Resumen.csv y Checklists individuales) ---
const INITIAL_RAW_DATA = [
  // HEADERS: Clientes extraídos de Resumen.csv (Indices alineados para simulación)
  { 
    id: 'header_clients', 
    values: [null, null, null, 
      'Concesionaria', 'Evolve', 'GROEN', 'CIMARRON-pq', 'EMCO', 'GROENact', 
      'PAGA-INMAE', 'INMAE Arrend', 'MEXIMIN2', 'PHN3', 'CIMARRON', 'PROVIDA', 
      'PHN', 'paga-inmae3m', 'MEXIMIN', 'APCO', 'LYP', 'GCM', 'Provida'
    ] 
  },
  { 
    id: 'header_type', 
    values: [null, null, 'Tipo', 
      'Arrendamiento', 'Arrendamiento', 'Arrendamiento', 'Simple', 'Simple', 'Revolvente', 
      'Simple', 'Arrendamiento', 'Quirografario', 'Simple', 'Simple', 'Simple', 
      'Simple', 'Simple', 'Quirografario', 'Simple', 'Arrendamiento', 'Quirografario', 'Simple'
    ] 
  },
  
  // --- SECCIÓN A: INFORMACIÓN GENERAL ---
  { id: 'A.1', name: 'Solicitud Institucional de Crédito', values: [null, null, null, 'Cumple', 'No Cumple', 'Falta', 'No Cumple', 'Cumple', 'Falta', 'Falta', 'Falta', 'Cumple', 'Cumple', 'Con Observación', 'Cumple', 'Actualizar', 'Falta', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple'] },
  { id: 'A.2', name: 'Autorización Buró de Crédito', values: [null, null, null, 'No Cumple', 'No Cumple', 'Con Observación', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Actualizar', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple'] },
  { id: 'A.3', name: 'Aviso de Privacidad', values: [null, null, null, 'Falta', 'No Cumple', 'Con Observación', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple'] },
  { id: 'A.4', name: 'Comprobante de Domicilio', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  { id: 'A.5', name: 'Acta Constitutiva RPPC', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  { id: 'A.6', name: 'Poderes y Facultades', values: [null, null, null, 'No Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  { id: 'A.7', name: 'Integración Accionaria (F-IA)', values: [null, null, null, 'Falta', 'No Cumple', 'Cumple', 'No Cumple', 'Cumple', 'No Cumple', 'Cumple', 'Falta', 'Cumple', 'No Cumple', 'No Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Falta', 'Falta', 'Cumple', 'Cumple'] },
  { id: 'A.8', name: 'Dictamen Jurídico', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'Falta', 'Falta', 'Falta', 'Cumple', 'Falta', 'Falta', 'Falta', 'No Cumple', 'Falta', 'No Cumple', 'Falta', 'Falta', 'Falta', 'Falta', 'Falta', 'Falta'] },
  { id: 'A.9', name: 'Identificación Oficial', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Si', 'N/A', 'N/A', 'N/A', 'N/A', 'Si', 'N/A', 'N/A', 'N/A'] },
  { id: 'A.10', name: 'Acta de Matrimonio', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Si', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },

  // --- SECCIÓN B: INFORMACIÓN DEL NEGOCIO ---
  { id: 'B.1', name: 'Constancia Situación Fiscal', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  { id: 'B.2', name: 'Comprobante de Ingresos', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },
  { id: 'B.3', name: 'Estados Financieros', values: [null, null, null, 'Falta', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple'] },
  { id: 'B.4', name: 'Analíticas de Ventas', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },
  { id: 'B.5', name: 'Acuse Actividad Vulnerable', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },

  // --- SECCIÓN C: INFORMACIÓN REPRESENTANTE ---
  { id: 'C.1', name: 'Identificación Oficial RL', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  { id: 'C.2', name: 'Comprobante Domicilio RL', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  { id: 'C.3', name: 'Aviso Privacidad RL', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Falta', 'Cumple', 'Cumple'] },
  { id: 'C.4', name: 'RFC RL', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },
  
  // --- SECCIÓN I: MODIFICACIÓN DEL CRÉDITO ---
  { id: 'I.1', name: 'Solicitud Reestructura', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },
  { id: 'I.3', name: 'Autorización Reestructura', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },

  // --- SECCIÓN J: EXPEDIENTE OPERATIVO ---
  { id: 'J.1', name: 'Contrato de Crédito', values: [null, null, null, 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si'] },
  { id: 'J.2', name: 'Convenio Modificatorio', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Cumple', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },
  { id: 'J.3', name: 'Información del RUG', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },
  { id: 'J.4', name: 'Pagarés Firmados', values: [null, null, null, 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si', 'Si'] },
  { id: 'J.5', name: 'Tablas de Amortización', values: [null, null, null, 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple', 'Cumple'] },

  // --- SECCIÓN FACTORAJE (J.8 - J.11) ---
  { id: 'J.8', name: 'Relación Proveedores (F-PR)', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },
  { id: 'J.11', name: 'Validación Facturas (F-VF)', values: [null, null, null, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] },

  // --- SECCIÓN ARRENDAMIENTO (J.12 - J.17) ---
  { id: 'J.12', name: 'Factura del Bien Arrendado', values: [null, null, null, 'Cumple', 'Falta', 'Cumple', 'N/A', 'N/A', 'N/A', 'N/A', 'Cumple', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A'] },
  { id: 'J.13', name: 'Pólizas de Seguro', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A'] },
  { id: 'J.14', name: 'Placas y Tarjetas Circulación', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A'] },
  { id: 'J.15', name: 'Acta Entrega (F-AEA)', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A'] },
  { id: 'J.16', name: 'Acta Recibido (F-ARA)', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A'] },
  { id: 'J.17', name: 'Carta Responsiva (F-CRA)', values: [null, null, null, 'Falta', 'Falta', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'Falta', 'N/A', 'N/A'] },
];

const MesaControlView = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parsedData, setParsedData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Pendientes');
  
  // State for Comments (Mocked initially with data from files)
  const [comments, setComments] = useState({
    'Concesionaria-A.2': 'Llenado incorrecto (Nombre de RL)',
    'Concesionaria-A.6': 'Actas más recientes en SIGER',
    'Evolve-A.1': 'Pendiente de firma',
    'Evolve-A.2': 'Pendiente de firma',
    'Evolve-A.3': 'Pendiente de firma',
    'Evolve-A.4': 'Pendiente contrato de arrendamiento',
    'GROENact-A.6': 'Falta que lo firmen',
    'GROENact-A.8': 'Si es PM no aplica',
    'GROENact-A.10': 'Si es PM no aplica',
    'CIMARRON-pq-A.1': 'Pendiente de Firma',
    'CIMARRON-pq-A.7': 'Pendiente de Firma',
    'EMCO-J.1': 'Firma digital',
    'EMCO-J.4': 'Firma digital'
  });

  const handleCommentChange = (clientName, docId, value) => {
    setComments(prev => ({
      ...prev,
      [`${clientName}-${docId}`]: value
    }));
  };

  // --- LOGIC: Parse Data ---
  const processData = (rawData) => {
    try {
      const clientRow = rawData.find(r => r.id === 'header_clients');
      const typeRow = rawData.find(r => r.id === 'header_type');
      
      if (!clientRow) return;

      const extractedClients = [];
      
      for (let i = 3; i < clientRow.values.length; i++) {
        if (clientRow.values[i]) {
          extractedClients.push({
            index: i,
            name: clientRow.values[i],
            type: typeRow ? typeRow.values[i] : 'Desconocido',
            amount: 0 // Placeholder as amount data is partial
          });
        }
      }

      setClients(extractedClients);

      const docs = rawData.filter(r => !r.id.startsWith('header_'));
      
      const mappedData = extractedClients.map(client => {
        const clientDocs = docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          status: doc.values[client.index] || 'N/A'
        }));

        const stats = {
          cumple: clientDocs.filter(d => d.status === 'Cumple' || d.status === 'Si').length,
          falta: clientDocs.filter(d => d.status === 'Falta').length,
          noCumple: clientDocs.filter(d => d.status === 'No Cumple').length,
          observacion: clientDocs.filter(d => d.status === 'Con Observación').length,
          na: clientDocs.filter(d => d.status === 'N/A' || d.status === '-' || d.status === '' || d.status === 'Actualizar').length,
          actualizar: clientDocs.filter(d => d.status === 'Actualizar').length,
          total: clientDocs.length
        };

        const applicable = stats.total - stats.na;
        const score = applicable > 0 ? Math.round((stats.cumple / applicable) * 100) : 0;

        return {
          ...client,
          docs: clientDocs,
          stats,
          score
        };
      });

      setParsedData(mappedData);

    } catch (error) {
      console.error("Error processing data:", error);
    }
  };

  useEffect(() => {
    processData(INITIAL_RAW_DATA);
  }, []);

  // --- FILTERS ---
  const filteredData = useMemo(() => {
    return parsedData.filter(client => {
      const typeMatch = selectedType === 'Todos' || client.type === selectedType;
      const clientMatch = selectedClient === 'Todos' || client.name === selectedClient;
      return typeMatch && clientMatch;
    });
  }, [parsedData, selectedType, selectedClient]);

  // --- AGGREGATE STATS ---
  const globalStats = useMemo(() => {
    const totalClients = filteredData.length;
    const totalDocs = filteredData.reduce((acc, curr) => acc + (curr.stats.total - curr.stats.na), 0);
    const totalCumple = filteredData.reduce((acc, curr) => acc + curr.stats.cumple, 0);
    const totalFalta = filteredData.reduce((acc, curr) => acc + curr.stats.falta, 0);
    const avgScore = totalClients > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + curr.score, 0) / totalClients) : 0;

    return { totalClients, totalDocs, totalCumple, totalFalta, avgScore };
  }, [filteredData]);

  // --- CHART DATA PREP ---
  const chartData = filteredData.map(c => ({
    name: c.name,
    Cumple: c.stats.cumple,
    Falta: c.stats.falta,
    'No Cumple': c.stats.noCumple,
    Observacion: c.stats.observacion
  }));

  const pieData = [
    { name: 'Cumple', value: globalStats.totalCumple, color: COLORS.cumple },
    { name: 'Falta', value: globalStats.totalFalta, color: COLORS.falta },
    { name: 'No Cumple', value: filteredData.reduce((acc, c) => acc + c.stats.noCumple, 0), color: COLORS.noCumple },
  ];

  const handleFileUpload = (event) => {
    alert("Funcionalidad de carga de CSV simulada para esta demo. En producción, esto procesaría el archivo subido.");
  };

  // --- FILTER DOCS HELPER ---
  const getFilteredDocs = (client) => {
    return client.docs.filter(doc => {
      if (selectedStatus === 'Todos') return true;
      if (selectedStatus === 'Pendientes') {
        return doc.status !== 'Cumple' && doc.status !== 'Si' && doc.status !== 'N/A' && doc.status !== '-' && doc.status !== '';
      }
      if (selectedStatus === 'Cumple') {
        return doc.status === 'Cumple' || doc.status === 'Si';
      }
      return doc.status === selectedStatus;
    });
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* HEADER */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
             >
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Mesa de Control</h1>
                <p className="text-slate-500 mt-1">Revisión y validación de expedientes de crédito.</p>
             </div>
         </div>
         
         <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
             <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'dashboard' 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
             >
                Dashboard
             </button>
             <button
                onClick={() => setActiveTab('detalle')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'detalle' 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
             >
                Detalle Documental
             </button>
         </div>
      </div>

      <main className="space-y-6">
        
        {/* FILTERS BAR */}
        {activeTab === 'dashboard' && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Type Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-48 appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 transition-colors"
                >
                  <option value="Todos">Tipo: Todos</option>
                  {[...new Set(clients.map(c => c.type))].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                     <ChevronDown className="h-4 w-4 text-slate-400"/>
                </div>
              </div>

              {/* Client Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <select 
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64 appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 transition-colors"
                >
                  <option value="Todos">Cliente: Todos</option>
                  {clients.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                 <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                     <ChevronDown className="h-4 w-4 text-slate-400"/>
                </div>
              </div>
            </div>

            <div className="flex items-center">
               <label className="flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium border border-indigo-200 dark:border-indigo-800">
                  <Upload className="h-4 w-4 mr-2" />
                  Actualizar Datos
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
               </label>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard 
                title="Cumplimiento Global" 
                value={`${globalStats.avgScore}%`} 
                icon={CheckCircle} 
                color="text-emerald-600 dark:text-emerald-400" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                sub="Promedio ponderado"
              />
              <KpiCard 
                title="Expedientes Activos" 
                value={globalStats.totalClients} 
                icon={FileText} 
                color="text-indigo-600 dark:text-indigo-400" 
                bg="bg-indigo-50 dark:bg-indigo-900/20"
                sub="Clientes filtrados"
              />
              <KpiCard 
                title="Documentos Faltantes" 
                value={globalStats.totalFalta} 
                icon={AlertCircle} 
                color="text-rose-600 dark:text-rose-400" 
                bg="bg-rose-50 dark:bg-rose-900/20"
                sub="Requieren atención"
              />
              <KpiCard 
                title="Con Observaciones" 
                value={filteredData.reduce((acc, c) => acc + c.stats.observacion, 0)} 
                icon={AlertTriangle} 
                color="text-amber-600 dark:text-amber-400" 
                bg="bg-amber-50 dark:bg-amber-900/20"
                sub="Revisión necesaria"
              />
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MAIN BAR CHART */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-6 flex items-center text-[#0d121b] dark:text-white">
                  <FileBarChart className="w-5 h-5 mr-2 text-slate-500" />
                  Estado por Cliente
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748B', fontSize: 11}} 
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        dy={5}
                        height={60}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        cursor={{fill: '#F1F5F9'}}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="Cumple" stackId="a" fill={COLORS.cumple} radius={[0, 0, 0, 0]} barSize={20} />
                      <Bar dataKey="Falta" stackId="a" fill={COLORS.falta} radius={[0, 0, 0, 0]} barSize={20} />
                      <Bar dataKey="No Cumple" stackId="a" fill={COLORS.noCumple} radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PIE CHART */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold mb-2 self-start w-full text-[#0d121b] dark:text-white">Distribución Total</h3>
                <div className="h-64 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{globalStats.avgScore}%</span>
                     <span className="text-xs text-slate-500 uppercase font-medium">Cumplimiento</span>
                  </div>
                </div>
                <div className="w-full mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>Cumple</div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{pieData[0].value}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>Falta</div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{pieData[1].value}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>No Cumple</div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{pieData[2].value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CLIENT SCORECARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredData.map(client => (
                 <ClientCard key={client.name} client={client} onClick={() => {
                    setSelectedClient(client.name);
                    setSelectedStatus('Pendientes'); // Default to showing issues
                    setActiveTab('detalle');
                 }} />
               ))}
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* DETAIL FILTER HEADER */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">Detalle de Documentación</h2>
                <div className="flex items-center mt-2 space-x-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Cliente:</label>
                  <div className="relative">
                    <select 
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1 text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Todos">Todos</option>
                      {clients.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-slate-400 pointer-events-none"/>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-400 whitespace-nowrap">Estado del Documento:</label>
                <div className="relative w-full md:w-64">
                   <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none w-full text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8"
                   >
                     <option value="Todos">Todos los estados</option>
                     <option value="Pendientes">Pendientes (Falta/No Cumple/Obs)</option>
                     <option value="Cumple">Cumple / Si</option>
                     <option value="Falta">Falta</option>
                     <option value="No Cumple">No Cumple</option>
                     <option value="Con Observación">Con Observación</option>
                     <option value="Actualizar">Actualizar</option>
                     <option value="N/A">N/A</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none"/>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID Doc</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Documento</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">Comentarios</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredData.flatMap(client => 
                    getFilteredDocs(client).map((doc, idx) => (
                        <tr key={`${client.name}-${doc.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{client.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{doc.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{doc.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <StatusBadge status={doc.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="relative rounded-md flex items-center">
                              <MessageSquare className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                              <input 
                                type="text" 
                                className="w-full text-sm border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 bg-transparent placeholder-slate-400"
                                placeholder="Eescribir observación..."
                                value={comments[`${client.name}-${doc.id}`] || ''}
                                onChange={(e) => handleCommentChange(client.name, doc.id, e.target.value)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                  {filteredData.flatMap(client => getFilteredDocs(client)).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        <CheckCircle className="mx-auto h-12 w-12 text-emerald-200 dark:text-emerald-900/40 mb-4" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">¡Todo en orden!</p>
                        <p className="text-sm">No se encontraron documentos con el criterio: <strong>{selectedStatus}</strong></p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const KpiCard = ({ title, value, icon: Icon, color, bg, sub }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-start transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
    <div className={`p-3 rounded-lg ${bg} mr-4`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">{value}</h3>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  </div>
);

const ClientCard = ({ client, onClick }) => (
  <div onClick={onClick} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
       <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-bold text-[#0d121b] dark:text-white truncate" title={client.name}>{client.name}</h4>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1 truncate max-w-full">
             {client.type}
          </span>
       </div>
       <div className={`text-xl font-bold shrink-0 ${client.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : client.score >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'}`}>
         {client.score}%
       </div>
    </div>
    
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
       <div 
         className={`h-2 rounded-full transition-all duration-1000 ${client.score >= 80 ? 'bg-emerald-500' : client.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
         style={{ width: `${client.score}%` }}
       ></div>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
       <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-1">
          <span className="block font-bold text-emerald-700 dark:text-emerald-400 text-sm">{client.stats.cumple}</span>
          Cumple
       </div>
       <div className="bg-rose-50 dark:bg-rose-900/20 rounded p-1">
          <span className="block font-bold text-rose-700 dark:text-rose-400 text-sm">{client.stats.falta}</span>
          Falta
       </div>
       <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-1">
          <span className="block font-bold text-amber-700 dark:text-amber-400 text-sm">{client.stats.noCumple}</span>
          No Cumple
       </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let styles = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  let icon = null;

  // Normalizando estatus para coincidencia más robusta
  const s = status ? status.toLowerCase() : '';

  if (s === 'cumple' || s === 'si') {
      styles = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      icon = <CheckCircle className="w-3 h-3 mr-1" />;
  } else if (s === 'falta') {
      styles = "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
      icon = <XCircle className="w-3 h-3 mr-1" />;
  } else if (s === 'no cumple' || s === 'no') {
      styles = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      icon = <AlertCircle className="w-3 h-3 mr-1" />;
  } else if (s.includes('observaci')) {
      styles = "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400";
      icon = <AlertTriangle className="w-3 h-3 mr-1" />;
  } else if (s === 'actualizar') {
      styles = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      icon = <List className="w-3 h-3 mr-1" />;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {icon}
      {status}
    </span>
  );
};

export default MesaControlView;
