import React, { useState } from 'react';
import { UserPlus, Search, Filter, User, Building2, Phone, Mail, MapPin } from 'lucide-react';
import ChecklistModal from './components/ChecklistModal';

const ProspectosView = () => {
  const [prospects, setProspects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddProspect = (newProspect) => {
    setProspects([...prospects, { ...newProspect, id: Date.now(), status: "Nuevo" }]);
    setShowAddModal(false);
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
                    <span className="text-xs text-slate-500">{prospect.type}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {prospect.status}
                </span>
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

      {/* Modal */}
      {showAddModal && (
        <ChecklistModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddProspect}
        />
      )}
    </div>
  );
};

export default ProspectosView;
