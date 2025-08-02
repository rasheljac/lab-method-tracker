
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ColumnAnalytics {
  id: string;
  name: string;
  total_injections: number;
  estimated_lifetime_injections: number;
  manufacturer: string;
  dimensions: string;
  status: string;
  usage_percent: number;
}

export interface DashboardStats {
  total_methods: number;
  total_columns: number;
  total_metabolites: number;
  active_columns: number;
  total_injections: number;
  avg_column_usage: number;
}

export const generateStatisticsPDF = async (
  stats: DashboardStats,
  columns: ColumnAnalytics[],
  chartElements: HTMLElement[]
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Add logo and header
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/lovable-uploads/1057252a-23f8-45ab-8d12-30e8d2ce821a.png';
    
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
      // Add timeout to prevent hanging
      setTimeout(reject, 5000);
    });

    // Calculate logo dimensions to maintain aspect ratio
    const logoAspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
    const logoHeight = 15;
    const logoWidth = logoHeight * logoAspectRatio;

    // Add logo with proper aspect ratio
    pdf.addImage(logoImg, 'PNG', margin, currentY, logoWidth, logoHeight);
    
    // Position title next to logo with proper spacing
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kapelczak MS Visualizer', margin + logoWidth + 10, currentY + 8);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Statistics & Analytics Report', margin + logoWidth + 10, currentY + 16);
    
    currentY += Math.max(logoHeight, 20) + 10;
  } catch (error) {
    console.log('Logo loading failed, continuing without logo');
    // Title without logo
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kapelczak MS Visualizer', margin, currentY);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Statistics & Analytics Report', margin, currentY + 8);
    
    currentY += 25;
  }

  // Date with proper positioning
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, margin + 5);

  currentY += 10;

  // Statistics Overview Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overview Statistics', margin, currentY);
  currentY += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const statsData = [
    ['Total Methods', stats.total_methods.toString()],
    ['Total Columns', stats.total_columns.toString()],
    ['Active Columns', stats.active_columns.toString()],
    ['Total Metabolites', stats.total_metabolites.toString()],
    ['Total Injections', stats.total_injections.toString()],
    ['Average Column Usage', `${stats.avg_column_usage.toFixed(1)}%`]
  ];

  // Create stats table with proper spacing
  const rowHeight = 6;
  const colWidth = contentWidth / 3;
  
  statsData.forEach(([label, value], index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = margin + (col * colWidth);
    const y = currentY + (row * rowHeight);
    
    pdf.text(`${label}:`, x, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x + 40, y);
    pdf.setFont('helvetica', 'normal');
  });

  currentY += Math.ceil(statsData.length / 3) * rowHeight + 15;

  // Charts Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analytics Charts', margin, currentY);
  currentY += 10;

  // Add charts with improved rendering
  for (let i = 0; i < chartElements.length; i++) {
    const chartElement = chartElements[i];
    
    // Check if we need a new page
    if (currentY > pageHeight - 120) {
      pdf.addPage();
      currentY = margin;
    }

    try {
      // Improve chart capture settings
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 1.5, // Reduced scale to prevent memory issues but maintain quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 10000,
        onclone: (clonedDoc) => {
          // Ensure chart is fully visible in clone
          const clonedChart = clonedDoc.querySelector('[data-chart]');
          if (clonedChart instanceof HTMLElement) {
            clonedChart.style.overflow = 'visible';
            clonedChart.style.height = 'auto';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      
      // Calculate proper dimensions to fit page width
      const maxWidth = contentWidth;
      const maxHeight = 80; // Maximum height for charts
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let imgWidth = maxWidth;
      let imgHeight = imgWidth / canvasAspectRatio;
      
      // If height exceeds max, adjust based on height
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * canvasAspectRatio;
      }

      // Center the image if it's smaller than content width
      const xPosition = margin + (contentWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', xPosition, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 15;
      
    } catch (error) {
      console.error('Error capturing chart:', error);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Chart could not be captured', margin, currentY);
      currentY += 15;
    }
  }

  // Column Details Section
  if (currentY > pageHeight - 80) {
    pdf.addPage();
    currentY = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Column Details', margin, currentY);
  currentY += 10;

  // Column table with improved layout
  const tableStartY = currentY;
  const colWidths = [50, 40, 20, 25]; // Name, Manufacturer, Usage, Status
  const headers = ['Name', 'Manufacturer', 'Usage', 'Status'];
  
  // Draw headers
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  let xPos = margin;
  headers.forEach((header, index) => {
    pdf.text(header, xPos, currentY);
    xPos += colWidths[index];
  });
  
  currentY += 6;
  
  // Draw header line
  pdf.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 4;

  // Column data with proper text wrapping
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  
  columns.forEach((column) => {
    // Check for page break
    if (currentY > pageHeight - 25) {
      pdf.addPage();
      currentY = margin + 5;
      
      // Repeat headers on new page
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      xPos = margin;
      headers.forEach((header, index) => {
        pdf.text(header, xPos, currentY);
        xPos += colWidths[index];
      });
      currentY += 6;
      pdf.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
    }

    xPos = margin;
    
    // Truncate text to fit columns
    const truncatedName = column.name.length > 25 ? column.name.substring(0, 22) + '...' : column.name;
    const truncatedManufacturer = column.manufacturer.length > 20 ? column.manufacturer.substring(0, 17) + '...' : column.manufacturer;
    
    pdf.text(truncatedName, xPos, currentY);
    xPos += colWidths[0];
    
    pdf.text(truncatedManufacturer, xPos, currentY);
    xPos += colWidths[1];
    
    pdf.text(`${column.usage_percent.toFixed(1)}%`, xPos, currentY);
    xPos += colWidths[2];
    
    pdf.text(column.status, xPos, currentY);
    
    currentY += 5;
  });

  // Footer with proper spacing
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `© 2025 Kapelczak Lab Systems - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  pdf.save(`Kapelczak_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
