import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
    success: {
        icon: CheckCircle,
        className: 'bg-white border-l-4 border-green-500',
        iconClass: 'text-green-500'
    },
    error: {
        icon: AlertCircle,
        className: 'bg-white border-l-4 border-red-500',
        iconClass: 'text-red-500'
    },
    info: {
        icon: Info,
        className: 'bg-white border-l-4 border-blue-500',
        iconClass: 'text-blue-500'
    }
};

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const VariantIcon = variants[type]?.icon || Info;
    const variantStyles = variants[type] || variants.info;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-6 right-6 z-[60] flex items-start gap-3 p-4 rounded-lg shadow-xl min-w-[300px] max-w-sm"
            >
                <div className={twMerge(clsx("absolute inset-0 rounded-lg shadow-lg", variantStyles.className))} />

                <div className="relative z-10 flex gap-3 w-full">
                    <VariantIcon className={clsx("w-6 h-6 mt-0.5 shrink-0", variantStyles.iconClass)} />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default Toast;
