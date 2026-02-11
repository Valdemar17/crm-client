import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Componente de Botón Reutilizable.
 * Soporta variantes, tamaños, estados de carga e iconos.
 * 
 * @param {string} variant - Estilo visual: 'primary', 'secondary', 'outline', 'danger', 'ghost'.
 * @param {string} size - Tamaño del botón: 'sm', 'md', 'lg'.
 * @param {boolean} isLoading - Muestra un spinner de carga y deshabilita el botón.
 * @param {boolean} isDisabled - Deshabilita la interacción.
 * @param {LucideIcon} icon - Componente de icono opcional (Lucide React).
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    icon: Icon,
    className,
    ...props
}) => {
    // Estilos base comunes para todos los botones
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    // Definición de variantes de color
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
        outline: 'border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500',
    };

    // Definición de tamaños
    const sizes = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
    };

    return (
        <button
            className={twMerge(
                clsx(baseStyles, variants[variant], sizes[size], className)
            )}
            disabled={isDisabled || isLoading}
            {...props}
        >
            {/* Icono de carga condicional */}
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {/* Icono opcional si no está cargando */}
            {!isLoading && Icon && <Icon className="mr-2 h-4 w-4" />}

            {children}
        </button>
    );
};

export default Button;
