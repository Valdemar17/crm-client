import React from 'react';
import { User, X, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { InfoRow, AddressField } from '../../../components/ui/InfoDisplay';

export default function ViewClientModal({ client, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] modal-animate">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
              <User className="text-[#135bec]" size={24} /> Detalles del Cliente
            </h2>
            <p className="text-sm text-slate-500">Visualizando información de {client.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            
            {/* Header Badge */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${client.type === 'Física' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-purple-500 shadow-purple-500/30'}`}>
                {client.type === 'Física' ? <User size={32} /> : <Building2 size={32} />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">{client.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${client.type === 'Física' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {client.type}
                  </span>
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{client.rfc}</span>
                </div>
              </div>
            </div>

            {/* Datos Generales Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Información de Contacto</h3>
                <div className="space-y-3">
                  <InfoRow label="Email" value={client.email} icon={<Mail size={16} />} />
                  <InfoRow label="Teléfono" value={client.telefono} icon={<Phone size={16} />} />
                  {client.type === 'Moral' && (
                    <InfoRow label="Representante" value={client.representante} icon={<User size={16} />} />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Información Fiscal</h3>
                <div className="space-y-3">
                  <InfoRow label="RFC" value={client.rfc} />
                  {client.type === 'Física' && <InfoRow label="CURP" value={client.curp} />}
                  {client.type === 'Moral' && <InfoRow label="Fecha Constitución" value={client.fechaConstitucion} />}
                </div>
              </div>
            </div>

            {/* Dirección Block */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#135bec]" /> Dirección Registrada
              </h3>
              {client.direccion ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AddressField label="Calle" value={client.direccion.calle} />
                  <AddressField label="No. Ext" value={client.direccion.numeroExt} />
                  <AddressField label="No. Int" value={client.direccion.numeroInt || 'N/A'} />
                  <AddressField label="Colonia" value={client.direccion.colonia} />
                  <AddressField label="Municipio" value={client.direccion.municipio} />
                  <AddressField label="C.P." value={client.direccion.cp} />
                  <AddressField label="Estado" value={client.direccion.estado} />
                  <AddressField label="País" value={client.direccion.pais} />
                </div>
              ) : (
                <p className="text-slate-500 italic">No hay dirección registrada.</p>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
