import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, CheckCircle, Download, AlertCircle, Save } from 'lucide-react';
import { checklistItemsData, getGeneratedDocuments, LINK_MAP } from '../../../utils/checklistUtils';
import { generateChecklistPDF } from '../../../utils/checklistPDF';

export default function ChecklistModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Script injection for PDF generation is handled in generateChecklistPDF now, but we need it locally?
  // Actually, generateChecklistPDF handles the loading.
  
  // Cargar estado inicial
  useEffect(() => {
    try {
      if (initialData) {
        setFormData(initialData);
      } else {
        const savedState = sessionStorage.getItem('prospectChecklistState');
        if (savedState) {
          setFormData(JSON.parse(savedState));
        } else {
          const initial = {};
          checklistItemsData.forEach(item => initial[item.id] = '');
          setFormData(initial);
        }
      }
    } catch (e) {
      console.error("Error loading state", e);
    } finally {
      setIsLoaded(true);
    }
  }, [initialData]);

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

  // Generación de lista de documentos
  const generatedDocuments = useMemo(() => {
    return getGeneratedDocuments(formData);
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
    if (!isFormCompleted) return;
    await generateChecklistPDF(formData);
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
