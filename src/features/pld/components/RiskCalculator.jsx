import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { ShieldCheck, AlertTriangle, AlertOctagon, Search } from 'lucide-react';

const RiskCalculator = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        rfc: '',
        tipoPersona: 'Fisica',
        actividad: '',
        monto: ''
    });

    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateRisk = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Nota: En una integración real, esto llamaría a la API.
            // Aquí simulamos la llamada con axios o fetch al backend.
            // const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/pld/evaluate`, formData);

            // Simulación temporal para demostración UI antes de integración completa
            // Se reemplazará con llamada real una vez que Auth esté 100% configurado en frontend
            const token = localStorage.getItem('token'); // Asumiendo que guardamos token

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pld/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("No autorizado. Inicia sesión.");
                throw new Error("Error al calcular riesgo");
            }

            const data = await response.json();
            setResult(data);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Ocurrió un error al calcular el riesgo');
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskBadge = (nivel) => {
        switch (nivel) {
            case 'Bajo':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><ShieldCheck className="w-4 h-4 mr-1" /> Riesgo Bajo</span>;
            case 'Medio':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-4 h-4 mr-1" /> Riesgo Medio</span>;
            case 'Alto':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><AlertOctagon className="w-4 h-4 mr-1" /> Riesgo Alto</span>;
            default:
                return null;
        }
    };

    return (
        <Card title="Calculadora de Riesgo PLD" subtitle="Evalúa el perfil de riesgo de un prospecto">
            <form onSubmit={calculateRisk} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nombre o Razón Social"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Juan Pérez"
                    />
                    <Input
                        label="RFC"
                        name="rfc"
                        value={formData.rfc}
                        onChange={handleChange}
                        required
                        placeholder="RFC con Homoclave"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Persona</label>
                        <select
                            name="tipoPersona"
                            value={formData.tipoPersona}
                            onChange={handleChange}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="Fisica">Persona Física</option>
                            <option value="Moral">Persona Moral</option>
                        </select>
                    </div>
                    <Input
                        label="Actividad Económica"
                        name="actividad"
                        value={formData.actividad}
                        onChange={handleChange}
                        placeholder="Ej. Restaurante, Inmobiliaria..."
                    />
                    <Input
                        label="Monto Estimado de Operación"
                        name="monto"
                        type="number"
                        value={formData.monto}
                        onChange={handleChange}
                        placeholder="0.00"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" isLoading={isLoading} icon={Search}>
                        Calcular Riesgo
                    </Button>
                </div>
            </form>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                >
                    {error}
                </motion.div>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 border rounded-lg bg-slate-50"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-semibold text-lg text-slate-800">Resultado de Evaluación</h4>
                            <p className="text-sm text-slate-500">Score calculado: {result.evaluation.score}/100</p>
                        </div>
                        {getRiskBadge(result.evaluation.nivelRiesgo)}
                    </div>

                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-slate-700">Factores Detectados:</h5>
                        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                            {result.evaluation.factores.map((factor, index) => (
                                <li key={index}>{factor}</li>
                            ))}
                        </ul>
                    </div>

                    {result.blacklistCheck.match && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-800 text-sm font-bold flex items-center">
                            <AlertOctagon className="w-5 h-5 mr-2" />
                            ALERTA: Coincidencia en Lista Negra ({result.blacklistCheck.fuente})
                        </div>
                    )}
                </motion.div>
            )}
        </Card>
    );
};

export default RiskCalculator;
