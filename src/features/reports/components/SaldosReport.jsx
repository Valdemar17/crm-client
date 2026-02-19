import React, { useState, useRef, useMemo } from 'react';
import { Download, Filter, Calendar, ChevronDown, Check, Trash2, DollarSign, Upload, FileText, Search } from 'lucide-react';

export default function SaldosReport({ onBack }) {
    const [selectedPortfolio, setSelectedPortfolio] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);

    // Initial empty state or default data
    const [reportData, setReportData] = useState([]);

    // Calculate totals dynamically based on reportData
    const totals = useMemo(() => {
        const initialTotals = {
            saldoBruto: 0, saldoNeto: 0, saldoTotal: 0,
            capitalVigente: 0, capitalImpago: 0, capitalVencidoExigible: 0, capitalVencidoNoExigible: 0,
            interesOrdVigente: 0, interesOrdImpago: 0, interesOrdVencidoExigible: 0, interesOrdVencidoNoExigible: 0,
            interesRefVigente: 0, interesRefImpago: 0, interesRefVencidoExigible: 0, interesRefVencidoNoExigible: 0,
            moratorioCalculado: 0, moratorioProvisionado: 0, saldosFega: 0, saldosCastigos: 0, cuentasOrden: 0,
            vigenteTotal: 0, vencidoTotal: 0
        };

        if (reportData.length === 0) return initialTotals;

        return reportData.reduce((acc, row) => {
            // Filter logic could go here if we wanted to calculate based on filters, 
            // but typically dashboard shows aggregate of current view.
            // For now, let's sum everything in reportData.

            // Helper to parse currency string to float if needed, or assume data is number
            const val = (v) => parseFloat(v) || 0;

            acc.saldoBruto += val(row.saldoBruto);
            acc.saldoNeto += val(row.saldoNeto);
            acc.saldoTotal += val(row.saldoTotal);

            acc.capitalVigente += val(row.capitalVigente);
            acc.capitalImpago += val(row.capitalImpago);
            acc.capitalVencidoExigible += val(row.capitalVencidoExigible);
            acc.capitalVencidoNoExigible += val(row.capitalVencidoNoExigible);

            acc.interesOrdVigente += val(row.interesOrdVigente);
            acc.interesOrdImpago += val(row.interesOrdImpago);
            acc.interesOrdVencidoExigible += val(row.interesOrdVencidoExigible);
            acc.interesOrdVencidoNoExigible += val(row.interesOrdVencidoNoExigible);

            acc.interesRefVigente += val(row.interesRefVigente);
            acc.interesRefImpago += val(row.interesRefImpago);
            acc.interesRefVencidoExigible += val(row.interesRefVencidoExigible);
            acc.interesRefVencidoNoExigible += val(row.interesRefVencidoNoExigible);

            acc.moratorioCalculado += val(row.moratorioCalculado);
            acc.moratorioProvisionado += val(row.moratorioProvisionado);
            acc.saldosFega += val(row.saldosFega);
            acc.saldosCastigos += val(row.saldosCastigos);
            acc.cuentasOrden += val(row.cuentasOrden);

            return acc;
        }, initialTotals);

    }, [reportData]);

    // Derived totals for the top cards
    const derivedVigente = totals.capitalVigente + totals.interesOrdVigente + totals.interesRefVigente;
    const derivedVencido = totals.capitalVencidoExigible + totals.capitalVencidoNoExigible +
        totals.interesOrdVencidoExigible + totals.interesOrdVencidoNoExigible +
        totals.interesRefVencidoExigible + totals.interesRefVencidoNoExigible;


    // Filtered data for table
    const filteredData = reportData.filter(item => {
        const matchesSearch = item.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.mes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPortfolio = selectedPortfolio === 'Todas' || item.cartera === selectedPortfolio;
        return matchesSearch && matchesPortfolio;
    });


    // CSV Handling
    const handleExportTemplate = () => {
        const headers = [
            'Cliente', 'Mes', 'Cartera',
            'SaldoBruto', 'SaldoNeto', 'SaldoTotal',
            'CapitalVigente', 'CapitalImpago', 'CapitalVencidoExigible', 'CapitalVencidoNoExigible',
            'InteresOrdVigente', 'InteresOrdImpago', 'InteresOrdVencidoExigible', 'InteresOrdVencidoNoExigible',
            'InteresRefVigente', 'InteresRefImpago', 'InteresRefVencidoExigible', 'InteresRefVencidoNoExigible',
            'MoratorioCalculado', 'MoratorioProvisionado', 'SaldosFega', 'SaldosCastigos', 'CuentasOrden'
        ];

        // Example row
        const exampleRow = [
            'Empresa Ejemplo S.A.', 'Enero 2026', 'Cartera Activa',
            '100000', '95000', '105000',
            '80000', '0', '5000', '10000',
            '5000', '0', '1000', '2000',
            '0', '0', '0', '0',
            '0', '0', '0', '0', '500'
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + exampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_saldos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim()); // Simple split, purely for this template

            const parsedData = lines.slice(1).filter(line => line.trim() !== '').map((line, index) => {
                const values = line.split(',');
                const entry = {};
                headers.forEach((header, i) => {
                    // CamelCase header mapping if needed, but assuming template matches state keys roughly
                    // Actually let's just map index to key to be safe if headers match
                    let key = header.charAt(0).toLowerCase() + header.slice(1); // client -> client

                    // Manual mapping to ensure keys match our state logic
                    const keyMap = {
                        'Cliente': 'cliente', 'Mes': 'mes', 'Cartera': 'cartera',
                        'SaldoBruto': 'saldoBruto', 'SaldoNeto': 'saldoNeto', 'SaldoTotal': 'saldoTotal',
                        'CapitalVigente': 'capitalVigente', 'CapitalImpago': 'capitalImpago', 'CapitalVencidoExigible': 'capitalVencidoExigible', 'CapitalVencidoNoExigible': 'capitalVencidoNoExigible',
                        'InteresOrdVigente': 'interesOrdVigente', 'InteresOrdImpago': 'interesOrdImpago', 'InteresOrdVencidoExigible': 'interesOrdVencidoExigible', 'InteresOrdVencidoNoExigible': 'interesOrdVencidoNoExigible',
                        'InteresRefVigente': 'interesRefVigente', 'InteresRefImpago': 'interesRefImpago', 'InteresRefVencidoExigible': 'interesRefVencidoExigible', 'InteresRefVencidoNoExigible': 'interesRefVencidoNoExigible',
                        'MoratorioCalculado': 'moratorioCalculado', 'MoratorioProvisionado': 'moratorioProvisionado', 'SaldosFega': 'saldosFega', 'SaldosCastigos': 'saldosCastigos', 'CuentasOrden': 'cuentasOrden'
                    };

                    const mappedKey = keyMap[header] || key;
                    entry[mappedKey] = isNaN(values[i]) ? values[i] : (values[i] === '' ? 0 : values[i]);
                });
                return entry;
            });

            setReportData(parsedData);
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };


    // Helper for formatting currency
    const fmt = (val) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
    };

    const StatusRow = ({ label, amount, type = 'neutral' }) => {
        let colorClass = 'text-slate-500';
        let bgClass = 'bg-slate-50';

        if (type === 'success') {
            colorClass = 'text-emerald-700 dark:text-emerald-400';
            bgClass = 'bg-emerald-100 dark:bg-emerald-900/30';
        } else if (type === 'danger') {
            colorClass = 'text-red-700 dark:text-red-400';
            bgClass = 'bg-red-100 dark:bg-red-900/30';
        } else if (type === 'warning') {
            colorClass = 'text-amber-700 dark:text-amber-400';
            bgClass = 'bg-amber-100 dark:bg-amber-900/30';
        }

        return (
            <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${bgClass} mb-2 transition-all hover:scale-[1.02]`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>{label}:</span>
                <span className={`text-xs font-bold font-mono ${colorClass}`}>{fmt(amount)}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header Navigation */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <button onClick={onBack} className="hover:text-[#135bec] transition-colors font-medium">Reportes</button>
                <span>/</span>
                <span className="text-slate-800 dark:text-white font-bold">Saldos</span>
            </div>

            {/* Main Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row items-center gap-4 justify-between transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[#135bec]">
                            <DollarSign size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white uppercase tracking-wide">REPORTE DE SALDOS</h2>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleExportTemplate}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-[#135bec] hover:text-[#135bec] transition-all"
                        >
                            <Download size={16} /> <span className="hidden sm:inline">Plantilla</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#135bec]/90 transition-all shadow-md shadow-blue-500/20"
                        >
                            <Upload size={16} /> <span className="hidden sm:inline">Cargar CSV</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".csv"
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative min-w-[150px]">
                        <select
                            value={selectedPortfolio}
                            onChange={(e) => setSelectedPortfolio(e.target.value)}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-4 pr-10 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] outline-none cursor-pointer"
                        >
                            <option>Todas</option>
                            <option>Cartera Activa</option>
                            <option>Cartera Vencida</option>
                            <option>Cartera Castigada</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] outline-none transition-all"
                        />
                    </div>

                    <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-lg transition-all active:scale-95"
                        onClick={() => setReportData([])}
                        title="Limpiar Datos"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Primary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Saldo Bruto */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-[#135bec]/30 transition-all duration-300 group">
                    <div className="text-center mb-6">
                        <h3 className="text-3xl font-bold text-[#0d121b] dark:text-white">{fmt(totals.saldoBruto)}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                            SALDO BRUTO
                        </p>
                    </div>
                    <div className="w-full space-y-2 mt-auto">
                        <StatusRow label="VIGENTE" amount={derivedVigente} type="success" />
                        <StatusRow label="VENCIDO" amount={derivedVencido} type="danger" />
                    </div>
                </div>

                {/* Saldo Neto */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-[#135bec]/30 transition-all duration-300 group">
                    <div className="text-center mb-6">
                        <h3 className="text-3xl font-bold text-[#0d121b] dark:text-white">{fmt(totals.saldoNeto)}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">SALDO NETO</p>
                    </div>
                    <div className="w-full space-y-2 mt-auto">
                        <StatusRow label="VIGENTE" amount={derivedVigente} type="success" />
                        <StatusRow label="VENCIDO" amount={derivedVencido} type="danger" />
                    </div>
                </div>

                {/* Saldo Total */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-[#135bec]/30 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#135bec] to-blue-400"></div>
                    <div className="text-center mb-6">
                        <h3 className="text-3xl font-bold text-[#0d121b] dark:text-white">{fmt(totals.saldoTotal)}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">SALDO TOTAL</p>
                    </div>
                    <div className="w-full space-y-2 mt-auto">
                        <StatusRow label="VIGENTE" amount={derivedVigente} type="success" />
                        <StatusRow label="VENCIDO" amount={derivedVencido} type="danger" />
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Capital */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all duration-300">
                    <div className="text-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CAPITAL</p>
                        <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">
                            {fmt(totals.capitalVigente + totals.capitalImpago + totals.capitalVencidoExigible + totals.capitalVencidoNoExigible)}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        <StatusRow label="VIGENTE" amount={totals.capitalVigente} type="success" />
                        <StatusRow label="IMPAGO" amount={totals.capitalImpago} type="warning" />
                        <StatusRow label="VENCIDO EXIGIBLE" amount={totals.capitalVencidoExigible} type="danger" />
                        <StatusRow label="VENCIDO NO EXIGIBLE" amount={totals.capitalVencidoNoExigible} type="danger" />
                    </div>
                </div>

                {/* Interes Ordinario */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all duration-300">
                    <div className="text-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">INTERES ORDINARIO</p>
                        <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">
                            {fmt(totals.interesOrdVigente + totals.interesOrdImpago + totals.interesOrdVencidoExigible + totals.interesOrdVencidoNoExigible)}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        <StatusRow label="VIGENTE" amount={totals.interesOrdVigente} type="success" />
                        <StatusRow label="IMPAGO" amount={totals.interesOrdImpago} type="warning" />
                        <StatusRow label="VENCIDO EXIGIBLE" amount={totals.interesOrdVencidoExigible} type="danger" />
                        <StatusRow label="VENCIDO NO EXIGIBLE" amount={totals.interesOrdVencidoNoExigible} type="danger" />
                    </div>
                </div>

                {/* Interes Refinanciado */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all duration-300">
                    <div className="text-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">INTERES REFINANCIADO</p>
                        <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">
                            {fmt(totals.interesRefVigente + totals.interesRefImpago + totals.interesRefVencidoExigible + totals.interesRefVencidoNoExigible)}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        <StatusRow label="VIGENTE" amount={totals.interesRefVigente} type="success" />
                        <StatusRow label="IMPAGO" amount={totals.interesRefImpago} type="warning" />
                        <StatusRow label="VENCIDO EXIGIBLE" amount={totals.interesRefVencidoExigible} type="danger" />
                        <StatusRow label="VENCIDO NO EXIGIBLE" amount={totals.interesRefVencidoNoExigible} type="danger" />
                    </div>
                </div>

                {/* OTROS */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all duration-300">
                    <div className="text-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">OTROS CONCEPTOS</p>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-2 text-center transition-all hover:scale-[1.02]">
                            <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase">MORATORIO CALCULADO</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-300">{fmt(totals.moratorioCalculado)}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-2 text-center transition-all hover:scale-[1.02]">
                            <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase">MORATORIO PROVISIONADO</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-300">{fmt(totals.moratorioProvisionado)}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center transition-all hover:scale-[1.02]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">SALDOS FEGA</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{fmt(totals.saldosFega)}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center transition-all hover:scale-[1.02]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">SALDOS CASTIGOS</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{fmt(totals.saldosCastigos)}</p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center transition-all hover:scale-[1.02]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">CUENTAS DE ORDEN</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{fmt(totals.cuentasOrden)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                        <FileText size={18} className="text-[#135bec]" />
                        Desglose por Cliente y Mes
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                        {filteredData.length} registros
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 font-bold">Cliente</th>
                                <th className="px-4 py-3 font-bold">Mes</th>
                                <th className="px-4 py-3 font-bold">Cartera</th>
                                <th className="px-4 py-3 font-bold text-right">Saldo Total</th>
                                <th className="px-4 py-3 font-bold text-right">Capital Vigente</th>
                                <th className="px-4 py-3 font-bold text-right">Interes Ord. Vigente</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            {row.cliente}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{row.mes}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                        ${row.cartera === 'Cartera Activa' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.cartera === 'Cartera Vencida' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {row.cartera}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                                            {fmt(row.saldoTotal)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                                            {fmt(row.capitalVigente)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                                            {fmt(row.interesOrdVigente)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Upload size={32} className="opacity-20" />
                                            <p>No hay datos cargados.</p>
                                            <button onClick={() => fileInputRef.current?.click()} className="text-[#135bec] hover:underline text-xs">
                                                Cargar archivo CSV
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
