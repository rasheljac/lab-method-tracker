
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
  let currentY = 20;

  // Add logo and header
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/lovable-uploads/1057252a-23f8-45ab-8d12-30e8d2ce821a.png';
    
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });

    // Add logo
    pdf.addImage(logoImg, 'PNG', 20, 10, 30, 15);
  } catch (error) {
    console.log('Logo loading failed, continuing without logo');
  }

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Kapelczak MS Visualizer', 60, 20);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Statistics & Analytics Report', 60, 28);

  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 15);

  currentY = 45;

  // Statistics Overview Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overview Statistics', 20, currentY);
  currentY += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const statsData = [
    ['Total Methods', stats.total_methods.toString()],
    ['Total Columns', stats.total_columns.toString()],
    ['Active Columns', stats.active_columns.toString()],
    ['Total Metabolites', stats.total_metabolites.toString()],
    ['Total Injections', stats.total_injections.toString()],
    ['Average Column Usage', `${stats.avg_column_usage.toFixed(1)}%`]
  ];

  // Create stats table
  let rowHeight = 8;
  statsData.forEach(([label, value]) => {
    pdf.text(label + ':', 25, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, 80, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += rowHeight;
  });

  currentY += 10;

  // Charts Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analytics Charts', 20, currentY);
  currentY += 15;

  // Add charts if available
  for (const chartElement of chartElements) {
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = 20;
    }

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 15;
    } catch (error) {
      console.error('Error capturing chart:', error);
      pdf.text('Chart could not be captured', 20, currentY);
      currentY += 10;
    }
  }

  // Column Details Section
  if (currentY > pageHeight - 100) {
    pdf.addPage();
    currentY = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Column Details', 20, currentY);
  currentY += 15;

  // Column table headers
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name', 20, currentY);
  pdf.text('Manufacturer', 70, currentY);
  pdf.text('Usage', 120, currentY);
  pdf.text('Status', 150, currentY);
  currentY += 8;

  // Draw header line
  pdf.line(20, currentY - 2, pageWidth - 20, currentY - 2);
  currentY += 3;

  // Column data
  pdf.setFont('helvetica', 'normal');
  columns.forEach((column) => {
    if (currentY > pageHeight - 20) {
      pdf.addPage();
      currentY = 30;
      
      // Repeat headers on new page
      pdf.setFont('helvetica', 'bold');
      pdf.text('Name', 20, currentY);
      pdf.text('Manufacturer', 70, currentY);
      pdf.text('Usage', 120, currentY);
      pdf.text('Status', 150, currentY);
      currentY += 8;
      pdf.line(20, currentY - 2, pageWidth - 20, currentY - 2);
      currentY += 3;
      pdf.setFont('helvetica', 'normal');
    }

    pdf.text(column.name.substring(0, 20), 20, currentY);
    pdf.text(column.manufacturer.substring(0, 15), 70, currentY);
    pdf.text(`${column.usage_percent.toFixed(1)}%`, 120, currentY);
    pdf.text(column.status, 150, currentY);
    currentY += 7;
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
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
