
import { checklistItemsData, getGeneratedDocuments, LINK_MAP } from './checklistUtils';

const ensureJSPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => {
        if (window.jspdf) resolve(window.jspdf);
        else reject(new Error("jspdf not loaded correctly"));
    };
    script.onerror = () => reject(new Error("Failed to load jspdf"));
    document.body.appendChild(script);
  });
};

export const generateChecklistPDF = async (formData) => {
    try {
        const jspdfLib = await ensureJSPDF();
        const { jsPDF } = jspdfLib;
        
        const generatedDocuments = getGeneratedDocuments(formData);

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Funciones Helper para el PDF
        const addLogo = () => {
        try {
            doc.setFont('Times', 'Bold');
            doc.setTextColor(39, 89, 150);
            doc.text("SOFIMAS", pageWidth - 40, 20);
        } catch(e) {}
        };

        const addFooter = (pageNumber, totalPages) => {
            doc.setPage(pageNumber);

            let footerY = pageHeight - 45;

            doc.setDrawColor(39, 89, 150);
            doc.setLineWidth(0.5);
            doc.line(15, footerY, pageWidth - 15, footerY);
            footerY += 5;

            doc.setFont('Times', 'Roman');
            doc.setFontSize(8);
            doc.setTextColor(52, 58, 64);

            const note1 = '*Este documento es de carácter informativo, por lo que no implica obligación ni compromiso por parte de **SOFIMAS Consultores del Noroeste, S.A. de C.V., SOFOM E.N.R.**';
            const note1Lines = doc.splitTextToSize(note1, pageWidth - 30);
            doc.text(note1Lines, 15, footerY);
            footerY += (note1Lines.length * 3);

            const note2 = '*SOFIMAS Consultores del Noroeste S.A de C.V., SOFOM E.N.R. podrá solicitar mayor información para completar el expediente de crédito.';
            const note2Lines = doc.splitTextToSize(note2, pageWidth - 30);
            doc.text(note2Lines, 15, footerY);
            footerY += (note2Lines.length * 3) + 3;

            doc.setDrawColor(200, 200, 200);
            doc.setLineDash([1, 1]);
            doc.line(15, footerY, pageWidth - 15, footerY);
            doc.setLineDash([]);
            footerY += 4;

            const leftColumnX = 15;
            const rightColumnX = pageWidth / 2 + 10;

            doc.setFont('Times', 'Bold');
            doc.setFontSize(8);
            doc.text('Redes Sociales:', leftColumnX, footerY);

            doc.setFont('Times', 'Roman');
            doc.setFontSize(7);
            doc.setTextColor(39, 89, 150);
            doc.textWithLink('www.facebook.com/sofimasmx', leftColumnX, footerY + 3, { url: 'https://www.facebook.com/sofimasmx' });
            doc.textWithLink('www.instagram.com/sofimasmx', leftColumnX, footerY + 6, { url: 'https://www.instagram.com/sofimasmx' });
            doc.text('LinkedIn - Sofimas', leftColumnX, footerY + 9);

            doc.setTextColor(52, 58, 64);
            doc.text('Sofimas Consultores del Noroeste S.A de C.V., SOFOM E.N.R', rightColumnX, footerY);
            doc.text('Blvd. Paseo Río Sonora Sur No. 205, Col. Proyecto Río', rightColumnX, footerY + 3);
            doc.text('Sonora', rightColumnX, footerY + 6);
            doc.text('C.P 83270, Hermosillo, Sonora.', rightColumnX, footerY + 9);
            doc.text('662-2102480', rightColumnX, footerY + 12);

            doc.setTextColor(39, 89, 150);
            doc.textWithLink('www.sofimas.com', rightColumnX, footerY + 15, { url: 'https://www.sofimas.com' });
            doc.textWithLink('contacto@sofimas.com', rightColumnX, footerY + 18, { url: 'mailto:contacto@sofimas.com' });

            doc.setFont('Times', 'Roman');
            doc.setFontSize(9);
            doc.setTextColor(52, 58, 64);
            doc.text(`${pageNumber} de ${totalPages}`, pageWidth - 25, pageHeight - 10);
        };

        addLogo();
        let y = 30;

        doc.setFont('Times', 'Bold');
        doc.setFontSize(16);
        doc.setTextColor(39, 89, 150);
        doc.text('CHECK LIST PROSPECTOS - SOFIMAS', pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Tabla de Selecciones
        doc.setFont('Times', 'Roman');
        doc.setFontSize(10);
        doc.setTextColor(52, 58, 64);

        checklistItemsData.forEach(item => {
        // Handle Selects
        if (item.type === 'select') {
            const selectedOption = item.options.find(o => o.value === formData[item.id]);
            if (selectedOption) {
            if (y > 220) { doc.addPage(); addLogo(); y = 30; }
            doc.setFont('Times', 'Roman');
            doc.text(`• ${item.label}: `, 15, y);
            doc.setFont('Times', 'Bold');
            doc.text(selectedOption.text, 15 + doc.getTextWidth(`• ${item.label}: `), y);
            doc.setFont('Times', 'Roman');
            y += 5;
            }
        } 
        // Handle Inputs (Text, Email, Tel)
        else if (['text', 'tel', 'email'].includes(item.type)) {
            const value = formData[item.id];
            if (value) {
            if (y > 220) { doc.addPage(); addLogo(); y = 30; }
            doc.setFont('Times', 'Roman');
            doc.text(`• ${item.label}: `, 15, y);
            doc.setFont('Times', 'Bold');
            doc.text(value, 15 + doc.getTextWidth(`• ${item.label}: `), y);
            doc.setFont('Times', 'Roman');
            y += 5;
            }
        }
        });
        y += 5;

        // Documentos
        const drawCheckbox = (x, y) => {
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.3);
            doc.rect(x, y - 3 + 0.5, 3, 3);
        };

        doc.setFontSize(12);
        generatedDocuments.forEach(party => {
            if (y > 220) { doc.addPage(); addLogo(); y = 30; }
            
            y += 5;
            doc.setFont('Times', 'Bold');
            doc.setFontSize(12);
            doc.setTextColor(39, 89, 150);
            const titleLines = doc.splitTextToSize(party.title, pageWidth - 30);
            doc.text(titleLines, 15, y);
            y += (titleLines.length * 5);

            party.sections.forEach(section => {
                if (y > 220) { doc.addPage(); addLogo(); y = 30; }
                
                y += 3;
                doc.setFont('Times', 'Bold');
                doc.setFontSize(11);
                doc.setTextColor(52, 58, 64);
                doc.text(section.name, 20, y);
                y += 6;

                doc.setFont('Times', 'Roman');
                doc.setFontSize(10);

                section.docs.forEach((docItem, index) => {
                    if (y > 220) { doc.addPage(); addLogo(); y = 30; }
                    
                    const linkSource = LINK_MAP[docItem] || '';
                    const isExcluded = ['Ingreso de clave CIEC en portal de Análisis de Crédito', 'CURP'].includes(docItem);
                    let linkDisplay = '';
                    let url = null;

                    if (linkSource.startsWith('http')) {
                        linkDisplay = isExcluded ? ' (Link)' : ' (Descargar)';
                        url = isExcluded ? linkSource : linkSource.split('?')[0] + '?download=1';
                    } else if (linkSource) {
                        linkDisplay = ` (${linkSource})`;
                    }

                    const docText = `${index + 1}. ${docItem}${linkDisplay}`;
                    const lines = doc.splitTextToSize(docText, 165);
                    
                    drawCheckbox(25, y);
                    doc.setTextColor(52, 58, 64);
                    doc.text(lines, 32, y);

                    if (url) {
                        doc.link(32, y - 3.5, 165, lines.length * 4, { url });
                        doc.setTextColor(39, 89, 150);
                    }

                    y += (lines.length * 4);
                });
                y += 2;
            });
        });

        // Final Footer Loop
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            addFooter(i, totalPages);
        }
        
        doc.save(`Check List - Sofimas - ${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (e) {
        console.error("Error generating PDF", e);
        alert("Ocurrió un error al generar el PDF. Por favor, asegúrese de tener conexión a internet para cargar la librería.");
    }
};
