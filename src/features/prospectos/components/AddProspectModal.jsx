import React, { useState } from 'react';
import { User, Building2, X, CheckCircle } from 'lucide-react';

export default function AddProspectModal({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState(null); 
  const [formData, setFormData] = useState({
    direccion: {
      calle: '',
      numeroExt: '',
      numeroInt: '',
      colonia: '',
      cp: '',
      municipio: '',
      estado: '',
      pais: 'México'
    }
  });

  const handleTypeSelect = (type) => {
    setClientType(type);
    setStep(2);
  };

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
    const displayName = clientType === 'Física' 
      ? `${formData.nombre || ''} ${formData.apellidoPaterno || ''}` 
      : formData.razonSocial;
    
    onSave({
      name: displayName,
      type: clientType,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] modal-animate">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
              {step === 1 ? 'Seleccionar Tipo de Prospecto' : `Nuevo Prospecto (${clientType})`}
            </h2>
            <p className="text-sm text-slate-500">Paso {step} de 2</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <button 
                onClick={() => handleTypeSelect('Física')}
                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <User size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">Persona Física</h3>
                  <p className="text-sm text-slate-500">Individuo que realiza actividades empresariales con derechos y obligaciones.</p>
                </div>
              </button>

              <button 
                onClick={() => handleTypeSelect('Moral')}
                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Building2 size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">Persona Moral</h3>
                  <p className="text-sm text-slate-500">Conjunto de personas físicas que se unen para formar una sociedad o empresa.</p>
                </div>
              </button>
            </div>
          ) : (
            <form id="prospectForm" onSubmit={handleSubmit} className="space-y-8">
              {/* Datos Generales */}
              <div>
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Datos Generales</h3>
                {clientType === 'Física' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Nombre(s)</label>
                      <input required name="nombre" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Apellido Paterno</label>
                      <input required name="apellidoPaterno" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Apellido Materno</label>
                      <input name="apellidoMaterno" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">RFC</label>
                      <input required name="rfc" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" placeholder="XAXX010101000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">CURP</label>
                      <input required name="curp" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Correo Electrónico</label>
                      <input required type="email" name="email" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Teléfono Móvil</label>
                      <input required type="tel" name="telefono" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Razón Social</label>
                      <input required name="razonSocial" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">RFC Empresa</label>
                      <input required name="rfc" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" placeholder="XXX010101000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Fecha Constitución</label>
                      <input type="date" name="fechaConstitucion" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Representante Legal</label>
                      <input required name="representante" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Correo Empresarial</label>
                      <input required type="email" name="email" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#0d121b] dark:text-white">Teléfono Oficina</label>
                      <input required type="tel" name="telefono" onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
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
                    <input required name="calle" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">C.P.</label>
                    <input required name="cp" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">No. Exterior</label>
                    <input required name="numeroExt" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">No. Interior</label>
                    <input name="numeroInt" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Colonia</label>
                    <input required name="colonia" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Municipio / Alcaldía</label>
                    <input required name="municipio" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">Estado</label>
                    <input required name="estado" onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0d121b] dark:text-white">País</label>
                    <input required name="pais" value={formData.direccion.pais} onChange={handleAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white outline-none focus:ring-2 focus:ring-[#135bec]/20" />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
          {step === 2 ? (
            <button 
              onClick={() => setStep(1)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-white font-medium px-4 py-2"
            >
              Atrás
            </button>
          ) : (
            <div></div> // Spacer
          )}
          
          {step === 2 && (
            <button 
              type="submit" 
              form="prospectForm"
              className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} /> Guardar Prospecto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
