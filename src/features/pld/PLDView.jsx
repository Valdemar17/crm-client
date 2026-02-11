import { motion } from 'framer-motion';
import RiskCalculator from './components/RiskCalculator';

const PLDView = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Prevención de Lavado de Dinero (PLD)</h1>
          <p className="text-slate-500">Gestión de riesgos y cumplimiento normativo.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculadora de Riesgo */}
        <section>
          <RiskCalculator />
        </section>

        {/* Panel Informativo / Historial (Placeholder) */}
        <section className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Normativa Vigente</h3>
            <p className="text-sm text-blue-800 mb-4">
              Recuerda que todas las operaciones superiores a $1,000,000 MXN requieren un expediente de identificación reforzado según el artículo 115.
            </p>
            <ul className="text-sm text-blue-700 list-disc pl-4 space-y-1">
              <li>Identificar al Beneficiario Final.</li>
              <li>Verificar geolocalización.</li>
              <li>Entrevista personal obligatoria.</li>
            </ul>
          </div>

          {/* Aquí iría el componente de Historial de Evaluaciones */}
        </section>
      </div>
    </div>
  );
};

export default PLDView;
