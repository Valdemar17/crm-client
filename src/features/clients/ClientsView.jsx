import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, PenSquare, Trash2, Eye, Mail, Phone, Building2, User } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import AddClientModal from './components/AddClientModal';
import EditClientModal from './components/EditClientModal';
import ViewClientModal from './components/ViewClientModal';
import AIEmailModal from './components/AIEmailModal';

// Mock Data
const INITIAL_CLIENTS = [
  { id: 1, name: "Empresa ABC S.A. de C.V.", rfc: "ABC123456789", type: "Moral", email: "contacto@abc.com", telefono: "5512345678", status: "Activo", fechaConstitucion: "2010-05-20", representante: "Juan Pérez", direccion: { calle: "Av. Reforma", numeroExt: "123", colonia: "Juárez", municipio: "Cuauhtémoc", estado: "CDMX", cp: "06600", pais: "México" } },
  { id: 2, name: "Juan Pérez López", rfc: "PELJ800101XYZ", type: "Física", email: "juan.perez@email.com", telefono: "5587654321", status: "Prospecto", curp: "PELJ800101HDFRNS00", direccion: { calle: "Calle 10", numeroExt: "45", colonia: "Nápoles", municipio: "Benito Juárez", estado: "CDMX", cp: "03810", pais: "México" } },
  { id: 3, name: "Consultores XYZ S.C.", rfc: "XYZ987654321", type: "Moral", email: "info@xyz.com", telefono: "5511223344", status: "Inactivo", fechaConstitucion: "2015-08-15", representante: "Maria Gonzalez", direccion: { calle: "Insurgentes Sur", numeroExt: "600", colonia: "Del Valle", municipio: "Benito Juárez", estado: "CDMX", cp: "03100", pais: "México" } },
];

export default function ClientsView() {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [emailingClient, setEmailingClient] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Filter Logic safely
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      (client.name && client.name.toLowerCase().includes(term)) ||
      (client.rfc && client.rfc.toLowerCase().includes(term)) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
  });

  // Handlers
  const handleAddClient = (newClient) => {
    setClients([...clients, { ...newClient, id: Date.now(), status: "Activo" }]);
    setShowAddModal(false);
  };

  const handleEditClient = (updatedClient) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    setEditingClient(null);
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Cartera de Clientes</h1>
          <p className="text-slate-500 mt-1">Gestiona y monitorea la información de tus clientes</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#135bec] hover:bg-[#135bec]/90 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-[#135bec]/25 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {/* Search & Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter size={18} /> Filtrar
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Cliente</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Tipo</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Contacto</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Estado</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        client.type === 'Física' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}>
                        {client.type === 'Física' ? <User size={18} /> : <Building2 size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-[#0d121b] dark:text-slate-200">{client.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{client.rfc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      client.type === 'Física' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30' 
                        : 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30'
                    }`}>
                      {client.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail size={14} className="text-slate-400" /> {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone size={14} className="text-slate-400" /> {client.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="p-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       {/* Action Buttons */}
                       <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setViewingClient(client)}
                            className="p-2 text-slate-400 hover:text-[#135bec] hover:bg-[#135bec]/10 rounded-lg transition-colors"
                            title="Ver Detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => setEmailingClient(client)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Redactar Email con IA"
                          >
                            <Mail size={18} />
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {/* Dropdown Menu */}
                            {activeMenu === client.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 py-1">
                                <button 
                                  onClick={() => { setEditingClient(client); setActiveMenu(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <PenSquare size={16} /> Editar Información
                                </button>
                                <button 
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 size={16} /> Eliminar Cliente
                                </button>
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <Search className="text-slate-400 mb-4" size={32} />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No se encontraron clientes</h3>
                        <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Simple Placeholder) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center text-sm text-slate-500">
          <span>Mostrando {filteredClients.length} de {clients.length} registros</span>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50">Anterior</button>
            <button disabled className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modals Logic */}
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} onSave={handleAddClient} />}
      {editingClient && <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} onSave={handleEditClient} />}
      {viewingClient && <ViewClientModal client={viewingClient} onClose={() => setViewingClient(null)} />}
      {emailingClient && <AIEmailModal client={emailingClient} onClose={() => setEmailingClient(null)} />}

      {/* Overlay */}
      {activeMenu && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}
    </div>
  );
}
