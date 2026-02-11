import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Mail, Lock, Plus, Trash, Save } from 'lucide-react';

const DesignSystem = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="p-8 space-y-8 bg-secondary-50 min-h-screen">
            <header>
                <h1 className="text-3xl font-display font-bold text-secondary-900">Sistema de Diseño</h1>
                <p className="text-secondary-500">Verificación de Componentes UI Core</p>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-primary-700 border-b border-primary-200 pb-2">Botones (Buttons)</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button variant="primary">Primario</Button>
                    <Button variant="secondary">Secundario</Button>
                    <Button variant="outline">Borde (Outline)</Button>
                    <Button variant="danger">Peligro</Button>
                    <Button variant="ghost">Fantasma (Ghost)</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button size="sm">Pequeño</Button>
                    <Button size="md">Mediano</Button>
                    <Button size="lg">Grande</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button isLoading>Cargando</Button>
                    <Button icon={Save}>Con Icono</Button>
                    <Button variant="primary" icon={Plus} size="sm">Agregar Nuevo</Button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-primary-700 border-b border-primary-200 pb-2">Inputs (Campos de Texto)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <Input label="Input Estándar" placeholder="Escribe algo..." />
                    <Input label="Con Icono" icon={Mail} placeholder="correo@ejemplo.com" />
                    <Input label="Con Error" error="Este campo es obligatorio" placeholder="Estado de error" />
                    <Input
                        label="Contraseña"
                        type="password"
                        icon={Lock}
                        placeholder="••••••••"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-primary-700 border-b border-primary-200 pb-2">Tarjetas (Cards)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Tarjeta Simple">
                        <p className="text-secondary-600">Este es el contenido básico de una tarjeta.</p>
                    </Card>
                    <Card
                        title="Tarjeta con Acción"
                        subtitle="Subtítulo descriptivo aquí"
                        action={<Button size="sm" variant="outline">Editar</Button>}
                        footer={<span className="text-xs text-secondary-400">Actualizado hace 5 min</span>}
                    >
                        <p className="text-secondary-600">Contenido de tarjeta con botón de acción en cabecera y pie de página.</p>
                    </Card>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-primary-700 border-b border-primary-200 pb-2">Modales</h2>
                <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Modal de Verificación"
                    footer={
                        <>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirmar</Button>
                        </>
                    }
                >
                    <p className="text-secondary-600">
                        Este es un componente modal reutilizable con desenfoque de fondo y animaciones.
                        Maneja el foco y el contexto de apilamiento automáticamente.
                    </p>
                </Modal>
            </section>
        </div>
    );
};

export default DesignSystem;
