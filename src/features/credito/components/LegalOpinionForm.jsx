import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Save, CheckCircle, XCircle } from 'lucide-react';

const LegalOpinionForm = ({ isOpen, onClose, applicationId, applicationName }) => {
    const [formData, setFormData] = useState({
        datosNotariales: { escritura: '', volumen: '', fecha: '', notario: '', numero: '', ciudad: '' },
        registroPublico: { folio: '', fecha: '', lugar: '' },
        representante: { nombre: '', poderes: '' },
        cuestionario: {
            q1: true, q2: true, q3: true, q4: true, q5: true,
            q6: true, q7: true, q8: true, q9: true, q10: true
        },
        conlusion: 'Favorable',
        observaciones: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        console.log("Guardando dictamen para app:", applicationId, formData);
        await new Promise(r => setTimeout(r, 1500)); // Simular guardado
        setIsLoading(false);
        onClose();
        alert("Dictamen Jurídico guardado correctamente");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Dictamen Jurídico - ${applicationName}`}
            maxWidth="max-w-4xl" // Modal ancho
            footer={
                <div className="flex justify-between w-full">
                    <span className="text-sm text-gray-500 my-auto">* Todos los campos son obligatorios para Vo.Bo.</span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSubmit} isLoading={isLoading} icon={Save}>Guardar Dictamen</Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

                {/* 1. Datos Notariales */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Constitución Legal (Datos Notariales)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="No. Escritura" value={formData.datosNotariales.escritura} onChange={(e) => handleChange('datosNotariales', 'escritura', e.target.value)} />
                        <Input label="Volumen / Libro" value={formData.datosNotariales.volumen} onChange={(e) => handleChange('datosNotariales', 'volumen', e.target.value)} />
                        <Input label="Fecha Escritura" type="date" value={formData.datosNotariales.fecha} onChange={(e) => handleChange('datosNotariales', 'fecha', e.target.value)} />
                        <Input label="Licenciado / Notario" value={formData.datosNotariales.notario} onChange={(e) => handleChange('datosNotariales', 'notario', e.target.value)} />
                        <Input label="No. Notaría" value={formData.datosNotariales.numero} onChange={(e) => handleChange('datosNotariales', 'numero', e.target.value)} />
                        <Input label="Ciudad / Estado" value={formData.datosNotariales.ciudad} onChange={(e) => handleChange('datosNotariales', 'ciudad', e.target.value)} />
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 2. Registro Público */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Datos de Inscripción (RPPC)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Folio Mercantil / Electrónico" value={formData.registroPublico.folio} onChange={(e) => handleChange('registroPublico', 'folio', e.target.value)} />
                        <Input label="Fecha de Registro" type="date" value={formData.registroPublico.fecha} onChange={(e) => handleChange('registroPublico', 'fecha', e.target.value)} />
                        <Input label="Lugar de Registro" value={formData.registroPublico.lugar} onChange={(e) => handleChange('registroPublico', 'lugar', e.target.value)} />
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 3. Cuestionario de Validación */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                        Checklist Legal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {[
                            { id: 'q1', text: '¿Coincide la denominación social en todos los documentos?' },
                            { id: 'q2', text: '¿El objeto social permite la celebración del contrato?' },
                            { id: 'q3', text: '¿La duración de la sociedad cubre el plazo del crédito?' },
                            { id: 'q4', text: '¿El domicilio social corresponde a la jurisdicción?' },
                            { id: 'q5', text: '¿Cuenta con RFC y Cédula Fiscal vigente?' },
                            { id: 'q6', text: '¿Los poderes del representante están vigentes?' },
                            { id: 'q7', text: '¿El representante tiene facultades de dominio/crédito?' },
                            { id: 'q8', text: '¿Se validó la inexistencia de gravámenes previos?' },
                            { id: 'q9', text: '¿Se identificó al Beneficiario Controlador?' },
                            { id: 'q10', text: '¿Cumple con la normativa PLD interna?' },
                        ].map((q) => (
                            <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-700">{q.text}</span>
                                <input
                                    type="checkbox"
                                    checked={formData.cuestionario[q.id]}
                                    onChange={(e) => handleChange('cuestionario', q.id, e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 4. Conclusión */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                        Dictamen Final
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Conclusión del Abogado</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => handleChange(null, 'conlusion', 'Favorable')}
                                className={`flex-1 py-2 rounded-lg border font-medium flex justify-center items-center gap-2 ${formData.conlusion === 'Favorable' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-600'
                                    }`}
                            >
                                <CheckCircle size={18} /> FAVORABLE
                            </button>
                            <button
                                onClick={() => handleChange(null, 'conlusion', 'No Favorable')}
                                className={`flex-1 py-2 rounded-lg border font-medium flex justify-center items-center gap-2 ${formData.conlusion === 'No Favorable' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-600'
                                    }`}
                            >
                                <XCircle size={18} /> NO FAVORABLE
                            </button>
                        </div>
                        <Input label="Observaciones o Condicionantes" value={formData.observaciones} onChange={(e) => handleChange(null, 'observaciones', e.target.value)} />
                    </div>
                </section>

            </div>
        </Modal>
    );
};

export default LegalOpinionForm;
