
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

// Helper function to wait for charts to be fully rendered
const waitForChartsToRender = async (elements: HTMLElement[]): Promise<void> => {
  return new Promise((resolve) => {
    if (elements.length === 0) {
      resolve();
      return;
    }
    
    // Wait for DOM to be fully rendered and styles to be applied
    setTimeout(() => {
      // Force a reflow to ensure all elements are properly rendered
      elements.forEach((element) => {
        void element.offsetHeight;
      });
      
      // Additional delay to ensure all animations and transitions are complete
      setTimeout(resolve, 800);
    }, 500);
  });
};

// Helper function to find chart elements more reliably
const findChartElements = (): HTMLElement[] => {
  const chartElements: HTMLElement[] = [];
  
  // Look for various chart container selectors
  const selectors = [
    '[data-chart]',
    '.recharts-wrapper',
    '.recharts-responsive-container',
    '[class*="recharts"]',
    '.chart-container'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement && !chartElements.includes(element)) {
        chartElements.push(element);
      }
    });
  });
  
  console.log('Found chart elements:', chartElements.length, chartElements);
  return chartElements;
};

export const generateStatisticsPDF = async (
  stats: DashboardStats,
  columns: ColumnAnalytics[],
  chartElements?: HTMLElement[]
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Find chart elements if not provided
  const chartsToCapture = chartElements || findChartElements();
  
  // Wait for charts to be fully rendered
  await waitForChartsToRender(chartsToCapture);

  // Add logo and header
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/lovable-uploads/1057252a-23f8-45ab-8d12-30e8d2ce821a.png';
    
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
      setTimeout(reject, 5000);
    });

    const logoAspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
    const logoHeight = 15;
    const logoWidth = logoHeight * logoAspectRatio;

    pdf.addImage(logoImg, 'PNG', margin, currentY, logoWidth, logoHeight);
    
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kapelczak MS Visualizer', margin + logoWidth + 10, currentY + 8);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Statistics & Analytics Report', margin + logoWidth + 10, currentY + 16);
    
    currentY += Math.max(logoHeight, 20) + 10;
  } catch (error) {
    console.log('Logo loading failed, continuing without logo');
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
  if (chartsToCapture.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analytics Charts', margin, currentY);
    currentY += 10;

    // Add charts with improved rendering
    for (let i = 0; i < chartsToCapture.length; i++) {
      const chartElement = chartsToCapture[i];
      
      // Check if we need a new page
      if (currentY > pageHeight - 120) {
        pdf.addPage();
        currentY = margin;
      }

      try {
        console.log(`Capturing chart ${i + 1}/${chartsToCapture.length}`, chartElement);
        
        // Get the actual dimensions we want to capture
        const elementWidth = chartElement.scrollWidth || chartElement.offsetWidth;
        const elementHeight = chartElement.scrollHeight || chartElement.offsetHeight;
        
        console.log('Element dimensions:', { width: elementWidth, height: elementHeight });
        
        // Improved chart capture settings with better rendering
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2, // Reasonable scale for quality vs size
          logging: true,
          useCORS: true,
          allowTaint: false,
          foreignObjectRendering: false,
          imageTimeout: 0,
          removeContainer: false,
          width: elementWidth,
          height: elementHeight,
          windowWidth: elementWidth,
          windowHeight: elementHeight,
          onclone: (clonedDoc, clonedElement) => {
            // Find all chart elements in the cloned document
            const clonedCharts = clonedDoc.querySelectorAll('[data-chart]');
            clonedCharts.forEach((chart) => {
              if (chart instanceof HTMLElement) {
                // Force full visibility
                chart.style.visibility = 'visible';
                chart.style.opacity = '1';
                chart.style.display = 'block';
                chart.style.position = 'relative';
                chart.style.width = elementWidth + 'px';
                
                // Ensure all child elements are visible
                const allElements = chart.querySelectorAll('*');
                allElements.forEach((el) => {
                  if (el instanceof HTMLElement) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                  }
                });
              }
            });
          }
        });
        
        console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });

        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas has no dimensions');
        }

        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Calculate dimensions to fit within PDF page width
        const pdfContentWidth = contentWidth;
        const maxChartHeight = 120; // Maximum height for charts in PDF
        
        // Get the aspect ratio from the canvas
        const canvasAspectRatio = canvas.width / canvas.height;
        
        // Calculate dimensions maintaining aspect ratio
        let chartWidth = pdfContentWidth;
        let chartHeight = chartWidth / canvasAspectRatio;
        
        // If calculated height exceeds max, scale down based on height
        if (chartHeight > maxChartHeight) {
          chartHeight = maxChartHeight;
          chartWidth = chartHeight * canvasAspectRatio;
        }
        
        // Center the chart horizontally on the page
        const chartX = margin + (contentWidth - chartWidth) / 2;
        
        console.log('Adding chart to PDF:', { 
          chartWidth, 
          chartHeight, 
          chartX, 
          currentY,
          aspectRatio: canvasAspectRatio 
        });

        pdf.addImage(imgData, 'PNG', chartX, currentY, chartWidth, chartHeight);
        currentY += chartHeight + 15;
        
        console.log(`Chart ${i + 1} captured successfully`);
        
      } catch (error: any) {
        console.error(`Error capturing chart ${i + 1}:`, error);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.text(`[Chart ${i + 1}: Unable to capture - ${error.message || 'Unknown error'}]`, margin, currentY);
        pdf.setTextColor(0, 0, 0);
        currentY += 15;
      }
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
