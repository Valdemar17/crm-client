import React, { useState } from 'react';
import { UserPlus, Search, Filter, User, Building2, Phone, Mail, MapPin, Calendar, MoreVertical, Edit, UserCheck, FileText } from 'lucide-react';
import ChecklistModal from './components/ChecklistModal';
import AddClientModal from '../clients/components/AddClientModal';
import { generateChecklistPDF } from '../../utils/checklistPDF';

const ProspectosView = () => {
  const [prospects, setProspects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [convertingProspect, setConvertingProspect] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const handleAddProspect = (newProspect) => {
    setProspects([...prospects, { 
        ...newProspect, 
        id: Date.now(), 
        status: "Nuevo",
        createdAt: new Date().toISOString()
    }]);
    setShowAddModal(false);
  };

  const handleUpdateProspect = (updatedData) => {
    setProspects(prospects.map(p => p.id === editingProspect.id ? { ...p, ...updatedData } : p));
    setEditingProspect(null);
  };

  const handleConvertToClient = (prospect) => {
    setActiveMenu(null);
    setConvertingProspect(prospect);
  };

  const handleClientConversionSuccess = (clientData) => {
      // Remove prospect from list
      setProspects(prospects.filter(p => p.id !== convertingProspect.id));
      setConvertingProspect(null);
      
      // Feedback user
      alert("¡Prospecto convertido exitosamente! El cliente ha sido guardado y transferido al módulo de Clientes.");
      // Note: In a real app with backend, here we would post to /clients endpoint
      console.log("Client created:", clientData);
  };

  const handleDownloadChecklist = async (prospect) => {
    setActiveMenu(null);
    await generateChecklistPDF(prospect);
  };

  const filteredProspects = prospects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Prospectos</h2>
          <p className="text-slate-500">Gestión y seguimiento de clientes potenciales</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} />
          <span>Nuevo Prospecto</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar prospectos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
          <Filter size={20} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Content */}
      {filteredProspects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
          <UserPlus size={48} className="mb-4 opacity-50" />
          <p>No hay prospectos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProspects.map(prospect => (
            <div key={prospect.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    prospect.type === 'Moral' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {prospect.type === 'Moral' ? <Building2 size={20} /> : <User size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{prospect.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{prospect.type}</span>
                        {prospect.createdAt && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(prospect.createdAt).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prospect.status === 'Cliente' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {prospect.status}
                    </span>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setActiveMenu(activeMenu === prospect.id ? null : prospect.id)}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                        >
                            <MoreVertical size={16} />
                        </button>
                        
                        {activeMenu === prospect.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-10 py-1">
                                <button 
                                    onClick={() => {
                                        setEditingProspect(prospect);
                                        setActiveMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Edit size={14} /> Editar
                                </button>
                                <button 
                                    onClick={() => handleDownloadChecklist(prospect)}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <FileText size={14} /> Descargar Checklist
                                </button>
                                <button 
                                    onClick={() => handleConvertToClient(prospect)}
                                    className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                    <UserCheck size={14} /> Convertir a Cliente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  <span>{prospect.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  <span>{prospect.telefono}</span>
                </div>
                {prospect.direccion?.municipio && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{prospect.direccion.municipio}, {prospect.direccion.estado}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add */}
      {showAddModal && (
        <ChecklistModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddProspect}
        />
      )}

      {/* Modal Edit */}
      {editingProspect && (
        <ChecklistModal
          initialData={editingProspect}
          onClose={() => setEditingProspect(null)}
          onSave={handleUpdateProspect}
        />
      )}

      {/* Modal Convert to Client */}
      {convertingProspect && (
         <AddClientModal
            initialData={convertingProspect}
            onClose={() => setConvertingProspect(null)}
            onSave={handleClientConversionSuccess}
         />
      )}
    </div>
  );
};

export default ProspectosView;
