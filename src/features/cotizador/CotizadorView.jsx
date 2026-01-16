import React, { useState } from 'react';
import { Calculator, Download, Loader2, Sparkles } from 'lucide-react';
import { generateGeminiContent } from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../assets/sofimas-logo.png';

export default function CotizadorView() {
  const [formData, setFormData] = useState({
    tipoProducto: '',
    nombre: '',
    rfc: '',
    fechaInicial: new Date().toISOString().split('T')[0],
    monto: '',
    tasa: '',
    plazo: '',
    comision: '',
    // Arrendamiento Specifics
    valorBien: '',
    anticipo: '20.00%',
    residual: '10.00%',
    gastos: '$3,260.00',
    comisionArrendamiento: '2.00%',
    tipoSeguro: 'contado',
    costoSeguro: ''
  });

  const [resultado, setResultado] = useState(null);
  
  // AI Risk Analysis State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleMontoBlur = (e) => {
    const { id, value } = e.target;
    let valor = value.replace(/[^0-9.]/g, '');
    if (valor === '') return;
    let numero = parseFloat(valor);
    if (isNaN(numero)) numero = 0;
    setFormData(prev => ({ 
      ...prev, 
      [id]: '$' + numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    }));
  };

  const handleMontoFocus = (e) => {
    const { id } = e.target;
    setFormData(prev => ({ ...prev, [id]: prev[id].replace(/[^0-9.]/g, '') }));
  };

  const handlePorcentajeBlur = (id) => {
    let valor = formData[id].replace(/[^0-9.]/g, '');
    if (valor === '') return;
    let numero = parseFloat(valor);
    if (isNaN(numero)) numero = 0;
    setFormData(prev => ({ ...prev, [id]: numero.toFixed(2) + '%' }));
  };

  const handlePorcentajeFocus = (id) => {
     setFormData(prev => ({ ...prev, [id]: prev[id].replace(/[^0-9.]/g, '') }));
  };

  const extraerNumero = (valor) => {
    if (!valor) return NaN;
    return parseFloat(valor.toString().replace(/[^0-9.]/g, ''));
  };

  const formatoMoneda = (valor) => {
    return '$' + valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const calculatePMT = (rate, nper, pv, fv = 0, type = 0) => {
    if (rate === 0) return -(pv + fv) / nper;
    const pvif = Math.pow(1 + rate, nper);
    let pmt = (rate / (pvif - 1)) * -(pv * pvif + fv);
    if (type === 1) {
      pmt /= (1 + rate);
    }
    return pmt;
  };

  const calcularCAT = (flujos, tiempos_en_anios) => {
    if (!tiempos_en_anios || flujos.length !== tiempos_en_anios.length) {
      tiempos_en_anios = flujos.map((_, index) => index / 12);
    }
  
    let tasa = 0.01;      
    let iteraciones = 200;
    let epsilon = 1e-7;   
  
    for (let i = 0; i < iteraciones; i++) {
      let npv = 0, dnpv = 0;
  
      for (let t = 0; t < flujos.length; t++) {
        const t_anual = tiempos_en_anios[t];
        const flujo = flujos[t];
        const factor_descuento = Math.pow(1 + tasa, t_anual);
        npv += flujo / factor_descuento;
        dnpv -= t_anual * flujo / Math.pow(1 + tasa, t_anual + 1);
      }
  
      if (Math.abs(dnpv) < epsilon) break;
  
      const nuevaTasa = tasa - npv / dnpv;
      if (Math.abs(nuevaTasa - tasa) < epsilon) {
        tasa = nuevaTasa;
        break;
      }
      tasa = nuevaTasa;
      if (tasa < -0.99 || tasa > 10) return 0.02;
    }
    return tasa; 
  };

  const handleAnalyzeRisk = async () => {
    setIsAnalyzing(true);
    const prompt = `Actua como un experto analista de riesgo crediticio para una financiera (SOFOM). 
    Evalúa brevemente la siguiente solicitud de crédito:
    
    - Cliente: ${resultado.nombre}
    - Monto Solicitado: ${formatoMoneda(resultado.monto)}
    - Plazo: ${resultado.plazo} meses
    - Tasa Anual: ${resultado.tasaAnual.toFixed(2)}%
    - Pago Mensual: ${formatoMoneda(resultado.pagoMensual)}
    - CAT: ${resultado.catAnual.toFixed(2)}%

    Proporciona un análisis en formato de lista (bullet points) con 3 puntos clave (pros/contras) y una conclusión final de viabilidad (Baja/Media/Alta). Sé conciso y profesional.`;

    const result = await generateGeminiContent(prompt);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const generarTabla = () => {
    // Reset AI analysis when new calculation happens
    setAnalysisResult(null);

    const { nombre, rfc } = formData;
    if (!nombre || !rfc) {
      alert("Por favor completa el nombre y RFC");
      return;
    }

    if (formData.tipoProducto === 'arrendamiento_puro') {
        const valorBienConIva = extraerNumero(formData.valorBien);
        const tasaAnual = extraerNumero(formData.tasa);
        const plazo = parseInt(formData.plazo);
        const porcentajeResidual = extraerNumero(formData.residual);
        const porcentajeComision = extraerNumero(formData.comisionArrendamiento);
        const gastosRegistro = extraerNumero(formData.gastos);
        const anticipoPorcentaje = extraerNumero(formData.anticipo);
        const costoSeguroConIva = formData.tipoSeguro === 'financiado' ? extraerNumero(formData.costoSeguro) : 0;

        if (isNaN(valorBienConIva) || isNaN(tasaAnual) || isNaN(plazo)) {
            alert("Por favor verifica los campos numéricos");
            return;
        }

        const IVA = 0.16;
        
        // Cálculos del Bien
        const valorBienSinIva = valorBienConIva / (1 + IVA);
        const anticipoBien = valorBienSinIva * (anticipoPorcentaje / 100);
        const aFinanciarBien = valorBienSinIva - anticipoBien;

        // Cálculos del Seguro (si aplica)
        let aFinanciarSeguro = 0;
        let anticipoSeguro = 0;
        let costoSeguroSinIva = 0;
        
        if (formData.tipoSeguro === 'financiado' && costoSeguroConIva > 0) {
            costoSeguroSinIva = costoSeguroConIva / (1 + IVA);
            anticipoSeguro = costoSeguroSinIva * (anticipoPorcentaje / 100);
            aFinanciarSeguro = costoSeguroSinIva - anticipoSeguro;
        }

        // Totales Financieros
        const montoAFinanciarTotal = aFinanciarBien + aFinanciarSeguro;
        const montoAnticipoTotal = anticipoBien + anticipoSeguro;

        const valorResidual = valorBienSinIva * (porcentajeResidual / 100);
        const comisionApertura = ((valorBienSinIva + costoSeguroSinIva) * (porcentajeComision / 100)) * (1 + IVA);
        
        const tasaMensual = (tasaAnual / 100) / 12;
        
        // Desglose de Rentas
        const rentaBienSinIva = calculatePMT(tasaMensual, plazo, -aFinanciarBien, valorResidual);
        const rentaSeguroSinIva = aFinanciarSeguro > 0 ? calculatePMT(tasaMensual, plazo, -aFinanciarSeguro, 0) : 0;
        
        const rentaMensualSinIva = rentaBienSinIva + rentaSeguroSinIva;
        const rentaMensualConIva = rentaMensualSinIva * (1 + IVA);
        
        // Pago inicial sin primera renta
        const pagoInicial = comisionApertura + gastosRegistro + (montoAnticipoTotal * (1 + IVA));

        // Fecha Calculation Setup
        const fechaInicialDate = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00'); // Default to today or use formData if available
        // Use formData.fechaInicial similar to credit logic if it exists, but formData default is today string
        const fechaInicialVal = formData.fechaInicial ? new Date(formData.fechaInicial + 'T00:00:00') : fechaInicialDate;
        
        let fechaPrimerPago = new Date(fechaInicialVal.getFullYear(), fechaInicialVal.getMonth(), 10);
        if (fechaInicialVal.getDate() > 5) {
             fechaPrimerPago.setMonth(fechaPrimerPago.getMonth() + 1);
        }

        let saldoBien = aFinanciarBien;
        let saldoSeguro = aFinanciarSeguro;
        const tablaData = [];
        
        // Fila 0 - Inicio
        tablaData.push({
            periodo: 0,
            fecha: fechaInicialVal.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            saldoInicial: 0,
            renta: 0,
            interes: 0,
            capital: 0,
            iva: 0,
            total: pagoInicial, 
            saldoFinal: saldoBien + saldoSeguro,
            // Campos desglose inicializados
            capitalBien: 0, interesBien: 0, ivaBien: 0,
            capitalSeguro: 0, interesSeguro: 0, ivaSeguro: 0
        });

        for (let i = 1; i <= plazo; i++) {
            // Fecha Logic
            let fechaPago = new Date(fechaPrimerPago);
            if (i === plazo) {
                // Logic simplificada para vencimiento, a la practica SOFOM dia 20 siempre
                fechaPago.setMonth(fechaPrimerPago.getMonth() + i - 1);
            } else {
                fechaPago.setMonth(fechaPrimerPago.getMonth() + i - 1);
            }
            const fechaStr = fechaPago.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

            // Cálculos Bien
            const interesBien = saldoBien * tasaMensual;
            let capitalBien = rentaBienSinIva - interesBien;
            
            // Cálculos Seguro
            let interesSeguro = 0;
            let capitalSeguro = 0;
            if (aFinanciarSeguro > 0) {
                 interesSeguro = saldoSeguro * tasaMensual;
                 capitalSeguro = rentaSeguroSinIva - interesSeguro;
            }

            // Actualización Saldos
            saldoBien -= capitalBien;
            saldoSeguro -= capitalSeguro;

            if (saldoBien < 0) saldoBien = 0;
            if (saldoSeguro < 0) saldoSeguro = 0;

            const ivaBien = rentaBienSinIva * IVA; 
            const ivaSeguro = rentaSeguroSinIva * IVA;

            tablaData.push({
                periodo: i,
                fecha: fechaStr,
                saldoInicial: (saldoBien + capitalBien) + (saldoSeguro + capitalSeguro),
                renta: rentaMensualSinIva,
                interes: interesBien + interesSeguro,
                capital: capitalBien + capitalSeguro,
                iva: (interesBien + interesSeguro) * IVA, // Mantener compatibilidad si se usa
                total: rentaMensualConIva,
                saldoFinal: saldoBien + saldoSeguro,
                // Desglose
                capitalBien,
                interesBien,
                ivaBien,
                capitalSeguro,
                interesSeguro,
                ivaSeguro
            });
        }

        setResultado({
            tipo: 'arrendamiento_puro',
            nombre, rfc,
            valorBienConIva,
            tasaAnual,
            plazo,
            rentaMensualConIva,
            rentaMensualSinIva,
            pagoInicial,
            valorResidual,
            tablaData,
            monto: valorBienConIva,
            // Desglose Pago Inicial
            comisionApertura,
            gastosRegistro,
            montoAnticipo: montoAnticipoTotal * (1 + IVA) // Guardamos con IVA para mostrar el total a pagar
        });
        return;
    }

    const monto = extraerNumero(formData.monto);
    const tasaAnual = extraerNumero(formData.tasa) / 100;
    const plazo = parseInt(formData.plazo);
    const comision = extraerNumero(formData.comision) / 100;
    const { fechaInicial: fechaInicialInput } = formData;

    if (isNaN(monto) || isNaN(tasaAnual) || isNaN(plazo) || isNaN(comision)) {
      alert("Por favor completa todos los campos numéricos con valores válidos");
      return;
    }
    if (!fechaInicialInput) {
      alert("Por favor selecciona la fecha inicial del crédito");
      return;
    }

    const fechaInicial = new Date(fechaInicialInput + 'T00:00:00');
    const diaInicial = fechaInicial.getDate();
    let fechaPrimerPago = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), 20);

    if (diaInicial > 5) {
      fechaPrimerPago.setMonth(fechaPrimerPago.getMonth() + 1);
    }

    const tasaMensual = tasaAnual / 12;
    const pagoMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);
    const comisionInicial = monto * comision;

    let saldo = monto;
    let totalInteres = 0, totalCapital = 0, totalComision = 0;
    let flujos = [];
    let tablaData = [];

    flujos.push(-(monto - comisionInicial));
    const comisionConIVA = comisionInicial * 1.16;
    totalComision += comisionConIVA;

    const fechaCreacion = fechaInicial.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Periodo 0
    tablaData.push({
      periodo: 0,
      fecha: fechaCreacion,
      dias: 0,
      pago: 0,
      interes: 0,
      comision: comisionConIVA,
      capital: 0,
      saldo: monto
    });

    for (let i = 1; i <= plazo; i++) {
      let fechaPago = new Date(fechaPrimerPago);
      if (i === plazo) {
        const vencimiento = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth() + plazo, fechaInicial.getDate());
        fechaPago = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
      } else {
        fechaPago.setMonth(fechaPrimerPago.getMonth() + i - 1);
      }

      let fechaAnterior;
      if (i === 1) {
        fechaAnterior = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), fechaInicial.getDate());
      } else {
        // Parse date manually from dd/mm/yyyy format
        const [day, month, year] = tablaData[i - 1].fecha.split('/');
        fechaAnterior = new Date(`${year}-${month}-${day}T00:00:00`);
      }

      const fechaAnt = new Date(fechaAnterior.getFullYear(), fechaAnterior.getMonth(), fechaAnterior.getDate());
      const fechaPag = new Date(fechaPago.getFullYear(), fechaPago.getMonth(), fechaPago.getDate());

      if (i === 1) {
        fechaPrimerPago = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), 20);
        if (diaInicial > 5) {
          fechaPrimerPago.setMonth(fechaPrimerPago.getMonth() + 1);
        }
        fechaPag.setFullYear(fechaPrimerPago.getFullYear(), fechaPrimerPago.getMonth(), fechaPrimerPago.getDate());
      }

      const diasTranscurridos = Math.round((fechaPag - fechaAnt) / (1000 * 60 * 60 * 24));
      const tasaDiaria = tasaAnual / 360;
      // Redondear a dos dígitos el saldo * tasaDiaria antes de multiplicar por los días
      const interes = Number((saldo * tasaDiaria).toFixed(2)) * diasTranscurridos;
      let capital = pagoMensual - interes;

      let pagoTotal = pagoMensual;
      if (i === plazo) {
        capital = saldo; 
        pagoTotal = capital + interes;
        saldo = 0;
      } else {
        saldo = Math.max(0, saldo - capital);
      }

      totalInteres += interes;
      totalCapital += capital;
      flujos.push(pagoTotal);

      tablaData.push({
        periodo: i,
        fecha: fechaPago.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        dias: diasTranscurridos,
        pago: pagoTotal,
        interes: interes,
        comision: 0,
        capital: capital,
        saldo: saldo
      });
    }

    const catAnual = calcularCAT(flujos) * 100;
    const fechaVencimiento = new Date(fechaInicial.getFullYear(), fechaInicial.getMonth() + plazo, fechaInicial.getDate()).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setResultado({
      tipo: 'credito_simple',
      tablaData,
      nombre,
      rfc,
      fechaInicial: fechaCreacion,
      fechaVencimiento,
      monto,
      tasaAnual: tasaAnual * 100,
      plazo,
      pagoMensual,
      comisionInicial,
      comisionConIVA,
      totalInteres,
      totalCapital,
      totalComision,
      catAnual
    });
  };

  const generarPDF = () => {
    if (!resultado) return;

    const doc = new jsPDF();
    
    // CRM Colors
    const primaryColor = [19, 91, 236]; // #135bec
    const darkText = [13, 18, 27]; // #0d121b
    const lightText = [100, 116, 139]; // slate-500
    const lightBg = [248, 249, 252]; // #f8f9fc

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // Helper functions
    const formatoPorcentaje = (v) => v.toFixed(2) + '%';

    // Load Image for Aspect Ratio
    const img = new Image();
    img.src = logo;
    
    img.onload = () => {
        let yPos = 20;
        
        // --- Header ---
        // Logo with aspect ratio
        try {
            const logoWidth = 35;
            const logoHeight = (img.height * logoWidth) / img.width;
            doc.addImage(img, 'PNG', margin, yPos, logoWidth, logoHeight);
            
            // Adjust yPos based on logo height if necessary, but we usually have space
        } catch (e) {
            console.error("Error cargando logo", e);
        }

        // Title (Right Aligned)
        doc.setTextColor(...primaryColor);
        doc.setFontSize(16); // Reduced slightly to fit
        doc.setFont(undefined, 'bold');
        const title = resultado.tipo === 'arrendamiento_puro' ? 'Cotización de Arrendamiento' : 'Tabla de Amortización';
        doc.text(title, pageWidth - margin, yPos + 8, { align: 'right' });

        // Company Name (Right Aligned, Below Title)
        doc.setTextColor(...darkText);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('SOFIMAS Consultores del Noroeste', pageWidth - margin, yPos + 14, { align: 'right' });

        yPos += 25;

        // --- Info Cards ---
    const drawCard = (x, y, w, h, title, data, columns = 1) => {
        // Card Background
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.roundedRect(x, y, w, h, 3, 3, 'FD');
        
        // Title Background
        doc.setFillColor(...lightBg);
        doc.roundedRect(x, y, w, 10, 3, 3, 'F');
        // Fix bottom corners of title bg (drawing a rect over the bottom half to square it off)
        doc.rect(x, y + 5, w, 5, 'F'); 
        doc.setDrawColor(226, 232, 240);
        doc.line(x, y+10, x+w, y+10);

        // Title Text
        doc.setTextColor(...darkText);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(title, x + 5, y + 7);

        // Data
        const startY = y + 16;
        const colWidth = w / columns;
        const itemsPerCol = Math.ceil(data.length / columns);
        
        doc.setFontSize(8);
        data.forEach((item, i) => {
            const colIndex = Math.floor(i / itemsPerCol);
            const rowIndex = i % itemsPerCol;
            
            const currentX = x + (colIndex * colWidth);
            const currentY = startY + (rowIndex * 6);

            doc.setTextColor(...lightText);
            doc.setFont(undefined, 'normal');
            doc.text(item.label, currentX + 5, currentY);
            
            doc.setTextColor(...darkText);
            doc.setFont(undefined, 'bold');
            doc.text(String(item.value), currentX + colWidth - 5, currentY, { align: 'right' });
        });
    };

    // Calculate dimensions
    const cardWidth = (contentWidth - 10) / 2;
    let clientCardH = 30;
    let conditionsCardH = 50; // Ajustado para 2 columnas (era 90)
    
    // Data Preparation
    let clientData = [];
    let creditData = [];
    let tableData = [];
    let tableHeaders = [];
    let titleClient = "Detalles del Cliente";
    let titleConditions = "Condiciones del Crédito";

    if (resultado.tipo === 'arrendamiento_puro') {
        clientData = [
            { label: 'Cliente', value: resultado.nombre },
            { label: 'RFC', value: resultado.rfc },
        ];

        creditData = [
            { label: 'Tipo de Crédito', value: 'Arrendamiento Puro' },
            { label: 'Plazo', value: `${resultado.plazo} meses` },
            { label: 'Valor del Bien (Con IVA)', value: formatoMoneda(resultado.valorBienConIva) },
            { label: 'Precio de la Unidad (Sin IVA)', value: formatoMoneda(resultado.valorBienConIva / 1.16) },
            { label: 'Seguro', value: formData.tipoSeguro === 'financiado' ? formatoMoneda(extraerNumero(formData.costoSeguro)) : 'Contado' },
            { label: 'Monto a Financiar', value: formatoMoneda(resultado.tablaData[0].saldoFinal) }, // Saldo Inicial del Arrendamiento
            { label: 'Comisión por Apertura', value: formatoMoneda(resultado.comisionApertura) },
            { label: 'Gastos de Registro', value: formatoMoneda(resultado.gastosRegistro) },
            { label: 'Renta Extraordinaria', value: formatoMoneda(resultado.montoAnticipo) },
            { label: 'Pago Total Inicial', value: formatoMoneda(resultado.pagoInicial) },
        ];
        
        // Define headers for Lease
        tableHeaders = [['No.', 'Fecha de Pago', 'Pago Mensual', 'Seguro', 'IVA', 'Pago Total']];


        // Map data for Lease
        tableData = resultado.tablaData.map(row => {
            if (row.periodo === 0) {
                 return [
                    row.periodo, 
                    row.fecha, // Now we have fecha
                    '-', 
                    '-', 
                    '-', 
                    formatoMoneda(row.total) // Pago Inicial
                 ];
            }
            
            // Calculate aggregations for the row
            // Pago Mensual (Capital + intereses de capital)
            const pagoMensualBien = (row.capitalBien || 0) + (row.interesBien || 0);
            
            // Seguro (Seguro + intereses seguro)
            const pagoSeguroTotal = (row.capitalSeguro || 0) + (row.interesSeguro || 0);

            // IVA (iva total)
            const ivaTotal = (row.ivaBien || 0) + (row.ivaSeguro || 0);
            
            // Pago Total (Todo sumado)
            const pagoFinal = row.total;

            return [
                row.periodo,
                row.fecha,
                formatoMoneda(pagoMensualBien),
                formatoMoneda(pagoSeguroTotal),
                formatoMoneda(ivaTotal),
                formatoMoneda(pagoFinal)
            ];
        });

    } else {
        // Credito Simple (Default)
        clientData = [
            { label: 'Cliente', value: resultado.nombre },
            { label: 'RFC', value: resultado.rfc },
            { label: 'Monto Crédito', value: formatoMoneda(resultado.monto) },
            { label: 'Comisión Apertura', value: formatoPorcentaje(extraerNumero(formData.comision)) + ' + IVA' },
            { label: 'Disposición', value: formatoMoneda(resultado.monto) },
        ];

        creditData = [
            { label: 'Fecha Inicio', value: resultado.fechaInicial },
            { label: 'Tasa Anual', value: formatoPorcentaje(resultado.tasaAnual) },
            { label: 'Plazo', value: `${resultado.plazo} meses` },
            { label: 'CAT Estimado', value: formatoPorcentaje(resultado.catAnual) },
            { label: 'Periodo Pago', value: 'Día 20' },
        ];

        tableHeaders = [['No.', 'Fecha', 'Comisión', 'Saldo', 'Capital', 'Pago Total', 'Interés']];

        tableData = resultado.tablaData.map(row => {
            let comision = row.periodo === 0 ? formatoMoneda(row.comision) : '-';
            let interes = row.periodo === 0 ? '-' : formatoMoneda(row.interes);
            let capital = row.periodo === 0 ? '-' : formatoMoneda(row.capital);
            let pago = row.periodo === 0 ? formatoMoneda(row.comision) : formatoMoneda(row.pago);
            return [row.periodo, row.fecha, comision, formatoMoneda(row.saldo), capital, pago, interes];
        });
        
        // Add Totals Row only for Credit Simple here, or generic below?
        // simple credit logic added totals inside tableData previously.
        tableData.push(['Total', '-', formatoMoneda(resultado.totalComision), '-', formatoMoneda(resultado.totalCapital), formatoMoneda(resultado.totalCapital + resultado.totalInteres), formatoMoneda(resultado.totalInteres)]);
    }

    if (resultado.tipo === 'arrendamiento_puro') {
        // Layout: Stacked (Conditions below Client)
        drawCard(margin, yPos, contentWidth, clientCardH, titleClient, clientData);
        yPos += clientCardH + 4;
        // Two columns for Conditions
        drawCard(margin, yPos, contentWidth, conditionsCardH, titleConditions, creditData, 2);
        yPos += conditionsCardH + 5;
    } else {
        // Standard Layout
        drawCard(margin, yPos, cardWidth, 50, titleClient, clientData);
        drawCard(margin + cardWidth + 10, yPos, cardWidth, 50, titleConditions, creditData);
        yPos += 50 + 5;
    }


    // --- Table ---
    // (Table generation moved above to support branching)

    doc.autoTable({
        startY: yPos,
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        head: tableHeaders,
        body: tableData,
        theme: 'plain', // Use plain and style manually for cleaner look
        styles: {
            fontSize: 7, // Compacted per request
            cellPadding: 2, // Compacted per request
            textColor: darkText,
            font: 'helvetica', // closest to standard sans
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 3,
            fontSize: 7
        },
        bodyStyles: {
            halign: 'center',
        },
        columnStyles: {
            0: { halign: 'center' }, // No.
            1: { halign: 'center' }, // Fecha
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Very light slate
        },
        didParseCell: function(data) {
            // Style the Total Row
            if (data.row.index === tableData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [241, 245, 249]; // Slate 100
            }
        }
    });

    // --- Footer/Notes ---
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Notes Container
    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(...lightText);
    
    const notas = [
        'NOTAS IMPORTANTES:',
        '• La presente cotización es de carácter informativo. Los cálculos podrán variar al momento de formalizar el financiamiento.',
        '• Seguro, placas, tenencia y cualquier otro gasto son tramitados por SOFIMAS y cubiertos por el cliente.',
        '• Planes sujetos a autorización de crédito.',
        '• Los plazos van de 12 a 48 meses.',
        '• Todas las cantidades expresadas en esta cotización se encuentran en moneda nacional.',
        'Vigencia: La presente cotización tendra una vigencia de 30 dias naturales a partir de la fecha de generación de la cotización.'
    ];

    let noteY = yPos + 5;
    notas.forEach((nota, i) => {
        doc.setFont(undefined, i === 0 ? 'bold' : 'normal');
        doc.text(nota, margin + 5, noteY);
        noteY += 4;
    });

    // Bottom Branding
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generado por SOFIMAS Consultores del Noroeste S.A. de C.V., SOFOM ENR', margin, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save('Cotizacion_CRM.pdf');
    }; // End onload

    img.onerror = () => {
         // Fallback if image fails (same logic without image or default header)
         alert("Error cargando el logo para el PDF.");
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
          <Calculator className="text-[#135bec]" /> Calculadora de Crédito
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Calcula tu tabla de amortización y CAT de forma sencilla.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0d121b] dark:text-white">Tipo de Producto</label>
            <select id="tipoProducto" value={formData.tipoProducto} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all">
              <option value="">Seleccione un producto...</option>
              <option value="credito_simple">Crédito Simple</option>
              <option value="arrendamiento_puro">Arrendamiento Puro</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0d121b] dark:text-white">Nombre o Razón Social</label>
            <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="Ej: Juan Pérez" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0d121b] dark:text-white">RFC</label>
            <input type="text" id="rfc" value={formData.rfc} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="XAXX010101000" maxLength={13} />
          </div>

          {formData.tipoProducto === 'arrendamiento_puro' && (
            <>
               <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Valor del Bien (Con IVA)</label>
                <input type="text" id="valorBien" value={formData.valorBien} onChange={handleInputChange} onBlur={handleMontoBlur} onFocus={handleMontoFocus} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="$0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">% Anticipo a Capital</label>
                <input type="text" id="anticipo" value={formData.anticipo} onChange={handleInputChange} onBlur={() => handlePorcentajeBlur('anticipo')} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="0.00%" />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Gastos de Registro (Con IVA)</label>
                <input type="text" id="gastos" value={formData.gastos} onChange={handleInputChange} onBlur={handleMontoBlur} onFocus={handleMontoFocus} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="$0.00" />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Plazo (meses)</label>
                <input type="number" id="plazo" value={formData.plazo} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Tasa Anual (%)</label>
                <input type="text" id="tasa" value={formData.tasa} onChange={handleInputChange} onBlur={() => handlePorcentajeBlur('tasa')} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="0.00%" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">V. Residual (%)</label>
                <input type="text" id="residual" value={formData.residual} onChange={handleInputChange} onBlur={() => handlePorcentajeBlur('residual')} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="0.00%" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Comisión (%)</label>
                <input type="text" id="comisionArrendamiento" value={formData.comisionArrendamiento} onChange={handleInputChange} onBlur={() => handlePorcentajeBlur('comisionArrendamiento')} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="0.00%" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Seguro</label>
                <select id="tipoSeguro" value={formData.tipoSeguro} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all">
                  <option value="contado">Contado</option>
                  <option value="financiado">Financiado</option>
                </select>
              </div>
              {formData.tipoSeguro === 'financiado' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0d121b] dark:text-white">Costo del Seguro (Con IVA)</label>
                  <input type="text" id="costoSeguro" value={formData.costoSeguro} onChange={handleInputChange} onBlur={handleMontoBlur} onFocus={handleMontoFocus} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="$0.00" />
                </div>
              )}
            </>
          )}

          {formData.tipoProducto === 'credito_simple' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Fecha Inicial</label>
                <input type="date" id="fechaInicial" value={formData.fechaInicial} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Monto del Crédito</label>
                <input type="text" id="monto" value={formData.monto} onChange={handleInputChange} onBlur={handleMontoBlur} onFocus={handleMontoFocus} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="$0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Tasa Anual (%)</label>
                <input type="text" id="tasa" value={formData.tasa} onChange={handleInputChange} onBlur={() => handlePorcentajeBlur('tasa')} onFocus={() => handlePorcentajeFocus('tasa')} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="0.00%" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Plazo (meses)</label>
                <input type="number" id="plazo" value={formData.plazo} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">Comisión Apertura (%)</label>
                <input type="text" id="comision" value={formData.comision} onChange={handleInputChange} onBlur={() => handlePorcentajeBlur('comision')} onFocus={() => handlePorcentajeFocus('comision')} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-[#135bec]/20 outline-none transition-all" placeholder="0.00%" />
              </div>
            </>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={generarTabla} className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center gap-2">
            <Calculator size={20} /> Calcular Tabla
          </button>
        </div>
      </div>

      {resultado && resultado.tipo === 'arrendamiento_puro' && (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#135bec] to-blue-700 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
                <p className="text-blue-100 text-sm font-medium mb-1">Renta Mensual (Con IVA)</p>
                <h3 className="text-2xl font-bold">{formatoMoneda(resultado.rentaMensualConIva)}</h3>
                <div className="mt-2 text-xs text-blue-200 border-t border-blue-500/30 pt-2 flex justify-between">
                  <span>Sin IVA:</span>
                  <span>{formatoMoneda(resultado.rentaMensualSinIva)}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative group cursor-help">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pago Inicial Total</p>
                <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white">{formatoMoneda(resultado.pagoInicial)}</h3>
                <div className="mt-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  Incluye: Comisión, Gastos y Anticipo
                </div>

                {/* Tooltip Desglose */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-20 pointer-events-none">
                    <div className="space-y-2">
                        <p className="text-gray-400 italic text-center mb-2 pb-1 border-b border-gray-600">Cantidades incluyen IVA</p>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Comisión Apertura:</span>
                            <span className="font-mono">{formatoMoneda(resultado.comisionApertura)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Gastos de Registro:</span>
                            <span className="font-mono">{formatoMoneda(resultado.gastosRegistro)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Anticipo:</span>
                            <span className="font-mono">{formatoMoneda(resultado.montoAnticipo)}</span>
                        </div>
                        <div className="border-t border-slate-600 pt-2 mt-1 flex justify-between font-bold text-white">
                            <span>Total:</span>
                            <span>{formatoMoneda(resultado.pagoInicial)}</span>
                        </div>
                    </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Valor Residual (Opción)</p>
                <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white">{formatoMoneda(resultado.valorResidual)}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-[#0d121b] dark:text-white">Tabla de Amortización (Arrendamiento)</h3>
              <button onClick={generarPDF} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <Download size={14} /> Descargar PDF
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-white uppercase bg-[#135bec]">
                  <tr>
                    <th className="px-4 py-3 text-center">No.</th>
                    <th className="px-4 py-3 text-center">Fecha</th>
                    <th className="px-4 py-3 text-right">Capital</th>
                    <th className="px-4 py-3 text-right">Intereses Capital</th>
                    <th className="px-4 py-3 text-right">IVA de Intereses</th>
                    <th className="px-4 py-3 text-right">Seguro</th>
                    <th className="px-4 py-3 text-right">Intereses Seguro</th>
                    <th className="px-4 py-3 text-right">IVA Intereses</th>
                    <th className="px-4 py-3 text-right">Pago Total</th>
                    <th className="px-4 py-3 text-right">Saldo Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {resultado.tablaData.map((row) => (
                    <tr key={row.periodo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-center font-medium">{row.periodo}</td>
                      <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{row.fecha}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatoMoneda(row.capitalBien)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{formatoMoneda(row.interesBien)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{formatoMoneda(row.ivaBien)}</td>
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">{formatoMoneda(row.capitalSeguro)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{formatoMoneda(row.interesSeguro)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{formatoMoneda(row.ivaSeguro)}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#0d121b] dark:text-white">{formatoMoneda(row.total)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{formatoMoneda(row.saldoFinal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {resultado && resultado.tipo !== 'arrendamiento_puro' && (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 border-l-[#135bec] p-6 border-y border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-800">
            <h3 className="text-lg font-bold mb-4 text-[#0d121b] dark:text-white">Resumen del Crédito</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <p className="text-slate-600 dark:text-slate-400">Cliente: <span className="font-semibold text-[#0d121b] dark:text-white">{resultado.nombre}</span></p>
              <p className="text-slate-600 dark:text-slate-400">RFC: <span className="font-semibold text-[#0d121b] dark:text-white">{resultado.rfc}</span></p>
              <p className="text-slate-600 dark:text-slate-400">Pago mensual promedio: <span className="font-semibold text-[#0d121b] dark:text-white">{formatoMoneda(resultado.pagoMensual)}</span></p>
              <p className="text-slate-600 dark:text-slate-400">Comisión inicial (sin IVA): <span className="font-semibold text-[#0d121b] dark:text-white">{formatoMoneda(resultado.comisionInicial)}</span></p>
              <p className="text-slate-600 dark:text-slate-400">Comisión + IVA (16%): <span className="font-semibold text-[#0d121b] dark:text-white">{formatoMoneda(resultado.comisionConIVA)}</span></p>
              <p className="text-[#135bec] font-bold text-lg">CAT Estimado: {resultado.catAnual.toFixed(2)}%</p>
            </div>
            
            {/* AI Risk Analysis Button & Result */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <button onClick={generarPDF} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                  <Download size={18} /> Descargar PDF
                </button>
                <button 
                  onClick={handleAnalyzeRisk} 
                  disabled={isAnalyzing}
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Analizar Riesgo con IA
                </button>
              </div>

              {analysisResult && (
                <div className="mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 animate-[fadeIn_0.5s_ease-out]">
                  <h4 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 mb-2">
                    <Sparkles size={16} /> Análisis de IA
                  </h4>
                  <div className="prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300 ai-response whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-[#0d121b] dark:text-white">Tabla de Amortización</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-white uppercase bg-[#135bec]">
                  <tr>
                    <th className="px-4 py-3 text-center">No.</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Pago</th>
                    <th className="px-4 py-3 text-right">Interés</th>
                    <th className="px-4 py-3 text-right">Comisión</th>
                    <th className="px-4 py-3 text-right">Amortización</th>
                    <th className="px-4 py-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {resultado.tablaData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-center font-medium">{row.periodo}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.fecha}</td>
                      <td className="px-4 py-3 text-right font-medium">{row.periodo === 0 ? '$0.00' : formatoMoneda(row.pago)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{row.periodo === 0 ? '$0.00' : formatoMoneda(row.interes)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{row.periodo === 0 ? formatoMoneda(row.comision) : '$0.00'}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{row.periodo === 0 ? '$0.00' : formatoMoneda(row.capital)}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#0d121b] dark:text-white">{formatoMoneda(row.saldo)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <td className="px-4 py-3 text-center">Total</td>
                    <td>-</td>
                    <td className="px-4 py-3 text-right">{formatoMoneda(resultado.totalCapital + resultado.totalInteres)}</td>
                    <td className="px-4 py-3 text-right">{formatoMoneda(resultado.totalInteres)}</td>
                    <td className="px-4 py-3 text-right">{formatoMoneda(resultado.totalComision)}</td>
                    <td className="px-4 py-3 text-right">{formatoMoneda(resultado.totalCapital)}</td>
                    <td className="px-4 py-3 text-right">$0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
