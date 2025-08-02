
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
      // Get chart elements from the DOM
      const chartElements: HTMLElement[] = [];
      
      // Look for chart containers in the dashboard
      const dashboardCharts = document.querySelectorAll('[data-chart]');
      dashboardCharts.forEach(chart => {
        if (chart instanceof HTMLElement) {
          chartElements.push(chart);
        }
      });

      // Look for the column lifetime chart specifically
      const lifetimeChart = document.querySelector('.recharts-wrapper');
      if (lifetimeChart instanceof HTMLElement) {
        chartElements.push(lifetimeChart);
      }

      console.log('Found chart elements:', chartElements.length);

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
