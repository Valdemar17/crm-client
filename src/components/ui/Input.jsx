import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Componente de Input Reutilizable con soporte para ref.
 * Incluye etiquetas, manejo de errores e iconos.
 * 
 * @param {string} label - Etiqueta descriptiva del campo.
 * @param {string} error - Mensaje de error para mostrar validaciones.
 * @param {LucideIcon} icon - Icono decorativo a la izquierda.
 */
const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className,
    type = 'text',
    id,
    ...props
}, ref) => {
    // Asegura un ID único para accesibilidad (label 'for' attribute)
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {/* Renderizado condicional de la etiqueta */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-secondary-700 mb-1"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Renderizado condicional del icono */}
                {Icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Icon className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    id={inputId}
                    // Clases condicionales para padding si hay icono y bordes rojos si hay error
                    className={twMerge(
                        clsx(
                            'block w-full rounded-lg border border-secondary-300 bg-white py-2 px-3 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors',
                            Icon && 'pl-10',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                            className
                        )
                    )}
                    {...props}
                />
            </div>{/* Mensaje de error debajo del input */}
            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
