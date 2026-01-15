import React, { useState } from 'react';
import { Wand2, X, AlertCircle, Copy, Check } from 'lucide-react';
import { generateGeminiContent } from '../../../services/api';

export default function AIEmailModal({ client, onClose }) {
  const [emailTopic, setEmailTopic] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!emailTopic) return;
    setLoading(true);
    setError(null);
    setGeneratedEmail('');

    try {
      const prompt = `
        Redacta un correo electrónico profesional y personalizado para un cliente con los siguientes datos:
        Nombre: ${client.name}
        Tipo de Persona: ${client.type}
        Email: ${client.email}
        Tema del correo: ${emailTopic}

        El tono debe ser cordial, ejecutivo y persuasivo.
        Estructura del correo: Asunto atractivo, Saludo personalizado, Cuerpo del mensaje claro y conciso, Llamada a la acción, Despedida formal.
        No incluyas marcadores de posición [Nomber], usa los datos reales proporcionados.
      `;
      
      const content = await generateGeminiContent(prompt);
      setGeneratedEmail(content);
    } catch (err) {
      setError('Error al generar el correo. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] modal-animate">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900">
          <div>
            <h2 className="text-xl font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
              <Wand2 className="text-indigo-600 dark:text-indigo-400" size={24} /> 
              Redactor IA Assistant
            </h2>
            <p className="text-sm text-slate-500">Generando correo para: <span className="font-semibold">{client.name}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              ¿Sobre qué tema quieres escribirle al cliente?
            </label>
            <textarea
              value={emailTopic}
              onChange={(e) => setEmailTopic(e.target.value)}
              placeholder="Ej: Recordatorio de renovación de póliza, Ofrecimiento de nuevos servicios, Felicitación por cumpleaños..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] bg-slate-50 dark:bg-slate-800 dark:border-slate-700 min-h-[100px] transition-all"
            />
          </div>

          {!loading && !generatedEmail && (
             <div className="text-center py-8 text-slate-400">
               <Wand2 size={48} className="mx-auto mb-3 opacity-20" />
               <p>Describe el tema y la IA redactará el correo por ti.</p>
             </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium animate-pulse">Redactando correo inteligente...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {generatedEmail && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-2"
                  title="Copiar al portapapeles"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  <span className="text-xs font-medium">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Borrador Sugerido</p>
              </div>
              <div className="p-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                {generatedEmail}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            disabled={!emailTopic || loading}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-md transition-all
              ${!emailTopic || loading 
                ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/25 active:scale-95'}`}
          >
            <Wand2 size={18} />
            {generatedEmail ? 'Regenerar Correo' : 'Generar con IA'}
          </button>
        </div>
      </div>
    </div>
  );
}
