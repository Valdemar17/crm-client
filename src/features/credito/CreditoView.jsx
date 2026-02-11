import { useState } from 'react';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import ApplicationForm from './components/ApplicationForm';
import LegalOpinionForm from './components/LegalOpinionForm';

const CreditoView = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLegalFormOpen, setIsLegalFormOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Mock Data inicial para visualización
    const [applications, setApplications] = useState([
        { _id: '1', solicitante: { nombre: 'Empresa Constructora SA' }, montoSolicitado: 500000, plazo: 24, destino: 'Adquisicion de Activos', estatus: 'Solicitud' },
        { _id: '2', solicitante: { nombre: 'Juan Perez' }, montoSolicitado: 50000, plazo: 12, destino: 'Capital de Trabajo', estatus: 'Analisis' },
        { _id: '3', solicitante: { nombre: 'Restaurante El Sabor' }, montoSolicitado: 150000, plazo: 18, destino: 'Capital de Trabajo', estatus: 'Aprobado' },
    ]);

    const handleNewApplication = (newApp) => {
        setApplications([newApp, ...applications]);
    };

    const handleCardClick = (app) => {
        if (app.estatus === 'Analisis') {
            setSelectedApplication(app);
            setIsLegalFormOpen(true);
        } else {
            console.log(`Detalles de ${app.solicitante.nombre}`);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Pipeline de Crédito</h1>
                    <p className="text-slate-500">Gestión visual del flujo de origination.</p>
                </div>
                <Button icon={Plus} onClick={() => setIsFormOpen(true)}>
                    Nueva Solicitud
                </Button>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-hidden">
                <KanbanBoard applications={applications} onCardClick={handleCardClick} />
            </div>

            <ApplicationForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleNewApplication}
            />

            {selectedApplication && (
                <LegalOpinionForm
                    isOpen={isLegalFormOpen}
                    onClose={() => setIsLegalFormOpen(false)}
                    applicationId={selectedApplication._id}
                    applicationName={selectedApplication.solicitante.nombre}
                />
            )}
        </div>
    );
};

export default CreditoView;
