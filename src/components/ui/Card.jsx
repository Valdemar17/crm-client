import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Componente de Tarjeta (Card) para contenedores de Dashboard.
 * 
 * @param {string} title - Título principal de la tarjeta.
 * @param {string} subtitle - Subtítulo o descripción breve.
 * @param {ReactNode} action - Elemento de acción en la cabecera (ej. botón).
 * @param {boolean} noPadding - Si es true, elimina el padding del cuerpo.
 * @param {ReactNode} footer - Contenido opcional para el pie de la tarjeta.
 */
const Card = ({
    children,
    title,
    subtitle,
    action,
    className,
    noPadding = false,
    footer
}) => {
    return (
        <div
            className={twMerge(
                clsx(
                    'bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden',
                    className
                )
            )}
        >
            {/* Cabecera: Se renderiza solo si hay título o acción */}
            {(title || action) && (
                <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-secondary-900 leading-6">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="mt-1 text-sm text-secondary-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {/* Área de acción a la derecha */}
                    {action && (
                        <div className="ml-4 flex-shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}

            {/* Cuerpo de la tarjeta */}
            <div className={clsx(!noPadding && 'px-6 py-5')}>
                {children}
            </div>

            {/* Pie de página con fondo gris claro */}
            {footer && (
                <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
