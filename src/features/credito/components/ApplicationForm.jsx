import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Save } from 'lucide-react';

const ApplicationForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        montoSolicitado: '',
        plazo: 12,
        ingresosMensuales: '',
        destino: 'Capital de Trabajo'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Estructura de datos para el backend
            const payload = {
                solicitante: {
                    nombre: formData.nombre,
                    email: formData.email
                },
                montoSolicitado: Number(formData.montoSolicitado),
                plazo: Number(formData.plazo),
                ingresosMensuales: Number(formData.ingresosMensuales),
                destino: formData.destino
            };

            // Simulación de envío (Reemplazar con fetch real)
            // await api.post('/credit', payload);
            console.log('Enviando solicitud:', payload);

            // Simular DB delay
            await new Promise(r => setTimeout(r, 1000));

            // Mock de respuesta exitosa para actualizar UI localmente
            const mockNewApp = {
                _id: Date.now(),
                ...payload,
                estatus: 'Solicitud'
            };

            onSuccess(mockNewApp);
            onClose();
            setFormData({ nombre: '', email: '', montoSolicitado: '', plazo: 12, ingresosMensuales: '', destino: 'Capital de Trabajo' });

        } catch (error) {
            console.error(error);
            alert('Error al crear solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Solicitud de Crédito"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading} icon={Save}>Guardar Solicitud</Button>
                </div>
            }
        >
            <form id="credit-form" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Nombre del Cliente" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Monto Solicitado ($)" name="montoSolicitado" type="number" value={formData.montoSolicitado} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (Meses)</label>
                        <select name="plazo" value={formData.plazo} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                            <option value="6">6 Meses</option>
                            <option value="12">12 Meses</option>
                            <option value="24">24 Meses</option>
                            <option value="36">36 Meses</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Ingresos Mensuales ($)" name="ingresosMensuales" type="number" value={formData.ingresosMensuales} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destino del Crédito</label>
                        <select name="destino" value={formData.destino} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                            <option value="Capital de Trabajo">Capital de Trabajo</option>
                            <option value="Adquisicion de Activos">Adquisición de Activos</option>
                            <option value="Consolidacion de Deuda">Consolidación de Deuda</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ApplicationForm;
