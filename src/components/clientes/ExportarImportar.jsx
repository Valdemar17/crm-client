import React, { useRef } from 'react';
import { Download, Upload, FileSpreadsheet } from "lucide-react";

// Inline Button (reused from project style if not using shadcn/ui fully yet)
function Button({ children, variant = "primary", size = "md", className = "", onClick, ...props }) {
    const baseStyle = "flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
    
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button 
            className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}

// Simple Toast mock since we don't have 'sonner' installed
const toast = {
    success: (msg) => alert(`✅ ${msg}`),
    error: (msg) => alert(`❌ ${msg}`)
};

export default function ExportarImportar({ documentos, cliente, onImportar }) {
    const inputRef = useRef(null);

    const exportarCSV = () => {
        if (!documentos || documentos.length === 0) {
            toast.error('No hay documentos para exportar');
            return;
        }

        const headers = ['Documento', 'Categoría', 'Estatus', 'Comentarios'];
        const rows = documentos.map(doc => [
            doc.nombre,
            doc.categoria || 'General',
            doc.estatus,
            doc.comentarios || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `documentos_${cliente?.nombre || 'cliente'}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success('Archivo exportado correctamente');
    };

    const handleImportar = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    toast.error('El archivo está vacío o no tiene el formato correcto');
                    return;
                }

                const datosImportados = [];
                // Simple CSV parser for demo purposes (robust handling of csv is complex)
                for (let i = 1; i < lines.length; i++) {
                    // This regex tries to handle basic CSV with quotes, but is not full-spec compliant
                    const valores = lines[i].match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, index) => index % 2 === 0) || []; // Filter is dummy here, match returns matches+empty
                    
                    // Simple split fallback if regex fails or for simple CSV
                    const simpleValores = lines[i].split(','); 

                    const limpiar = (val) => val?.replace(/^"|"$/g, '').replace(/""/g, '"').trim() || '';
                    
                    // Use simple split for now if complicated parsing isn't needed
                    // Improve this if your CSVs have commas inside values
                    datosImportados.push({
                        nombre: limpiar(simpleValores[0]),
                        categoria: limpiar(simpleValores[1]),
                        estatus: limpiar(simpleValores[2]) || 'Pendiente',
                        comentarios: limpiar(simpleValores[3])
                    });
                }

                onImportar(datosImportados);
                toast.success(`${datosImportados.length} registros importados`);
            } catch (error) {
                console.error(error);
                toast.error('Error al leer el archivo');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportarCSV} className="border-slate-200">
                <Download className="w-4 h-4 mr-1.5" />
                Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="border-slate-200">
                <Upload className="w-4 h-4 mr-1.5" />
                Importar
            </Button>
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleImportar}
                className="hidden"
            />
        </div>
    );
}
