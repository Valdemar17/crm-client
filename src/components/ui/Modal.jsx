import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Componente Modal Accesible y Animado.
 * Utiliza React Portal para renderizarse en el nodo raíz del body.
 * 
 * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {string} title - Título del encabezado.
 * @param {ReactNode} footer - Contenido opcional para el pie del modal (acciones).
 * @param {string} size - Ancho del modal: 'sm', 'md', 'lg', 'xl', 'full'.
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    className
}) => {
    // Configuración de anchos máximos según el tamaño
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full m-4',
    };

    // Renderiza en el body usando Portal para evitar problemas de z-index
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Fondo oscuro (Backdrop) con desenfoque */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        aria-hidden="true" // Oculto para lectores de pantalla
                    />

                    {/* Panel del Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={twMerge(
                            clsx(
                                'relative w-full bg-white rounded-xl shadow-2xl ring-1 ring-black/5 flex flex-col',
                                sizes[size],
                                className
                            )
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        {/* Encabezado con título y botón de cerrar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
                            <h3
                                id="modal-title"
                                className="text-lg font-semibold text-secondary-900"
                            >
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-full p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-label="Cerrar modal"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Cuerpo del Modal con scroll automático si es muy largo */}
                        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                            {children}
                        </div>

                        {/* Pie del Modal (Opcional) */}
                        {footer && (
                            <div className="px-6 py-4 border-t border-secondary-100 bg-secondary-50 rounded-b-xl flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
