
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateStatisticsPDF, type DashboardStats, type ColumnAnalytics } from '@/services/pdfExportService';

interface PdfExportButtonProps {
  stats: DashboardStats | undefined;
  columns: ColumnAnalytics[] | undefined;
}

export const PdfExportButton = ({ stats, columns }: PdfExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!stats || !columns) {
      toast({
        title: 'Error',
        description: 'Statistics data not available for export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      // Wait a moment for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get chart elements from the DOM
      const chartElements: HTMLElement[] = [];
      
      // Look for data-chart attribute (our main identifier)
      const dataChartElements = document.querySelectorAll('[data-chart]');
      console.log('Found elements with data-chart:', dataChartElements.length);
      
      dataChartElements.forEach(chart => {
        if (chart instanceof HTMLElement) {
          // Force a repaint to ensure everything is rendered
          void chart.offsetHeight;
          chartElements.push(chart);
        }
      });

      // Also look for recharts containers as fallback
      const rechartsElements = document.querySelectorAll('.recharts-wrapper');
      console.log('Found recharts elements:', rechartsElements.length);
      
      rechartsElements.forEach(chart => {
        if (chart instanceof HTMLElement && !chartElements.includes(chart)) {
          void chart.offsetHeight;
          chartElements.push(chart);
        }
      });

      console.log('Total chart elements to export:', chartElements.length);

      if (chartElements.length === 0) {
        console.warn('No chart elements found. Will generate PDF without charts.');
      }

      await generateStatisticsPDF(stats, columns, chartElements);
      
      toast({
        title: 'Success',
        description: 'PDF report has been generated and downloaded',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isExporting || !stats || !columns}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF Report
        </>
      )}
    </Button>
  );
};
