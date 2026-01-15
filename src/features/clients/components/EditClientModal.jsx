import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function EditClientModal({ client, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...client });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      direccion: {
        ...formData.direccion,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const displayName = formData.type === 'Física' 
      ? `${formData.nombre || ''} ${formData.apellidoPaterno || ''}` 
      : formData.razonSocial;
    
    onSave({
      ...formData,
      name: displayName
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] modal-animate">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
              Editar Cliente ({client.type})
            </h2>
            <p className="text-sm text-slate-500">Modifica la información del cliente.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="editClientForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Datos Generales */}
            <div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Datos Generales</h3>
              {client.type === 'Física' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Nombre(s)</label>
                    <input required name="nombre" value={formData.nombre || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Apellido Paterno</label>
                    <input required name="apellidoPaterno" value={formData.apellidoPaterno || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Apellido Materno</label>
                    <input name="apellidoMaterno" value={formData.apellidoMaterno || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">RFC</label>
                    <input required name="rfc" value={formData.rfc || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">CURP</label>
                    <input required name="curp" value={formData.curp || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Correo Electrónico</label>
                    <input required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Teléfono Móvil</label>
                    <input required type="tel" name="telefono" value={formData.telefono || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Razón Social</label>
                    <input required name="razonSocial" value={formData.razonSocial || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">RFC Empresa</label>
                    <input required name="rfc" value={formData.rfc || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Fecha Constitución</label>
                    <input type="date" name="fechaConstitucion" value={formData.fechaConstitucion || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Representante Legal</label>
                    <input required name="representante" value={formData.representante || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Correo Empresarial</label>
                    <input required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Teléfono Oficina</label>
                    <input required type="tel" name="telefono" value={formData.telefono || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                </div>
              )}
            </div>

            {/* Dirección Desglosada */}
            <div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">Calle</label>
                  <input required name="calle" value={formData.direccion?.calle || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">C.P.</label>
                  <input required name="cp" value={formData.direccion?.cp || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">No. Exterior</label>
                  <input required name="numeroExt" value={formData.direccion?.numeroExt || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">No. Interior</label>
                  <input name="numeroInt" value={formData.direccion?.numeroInt || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" placeholder="Opcional" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">Colonia</label>
                  <input required name="colonia" value={formData.direccion?.colonia || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">Municipio / Alcaldía</label>
                  <input required name="municipio" value={formData.direccion?.municipio || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">Estado</label>
                  <input required name="estado" value={formData.direccion?.estado || ''} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">País</label>
                  <input required name="pais" value={formData.direccion?.pais || 'México'} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-white font-medium px-4 py-2 border border-transparent hover:border-slate-300 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="editClientForm"
            className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <CheckCircle size={18} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
