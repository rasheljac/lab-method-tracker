
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateSolventUsage, SolventUsage, GradientStep } from '@/utils/solventCalculations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Beaker, Droplets, FlaskConical } from 'lucide-react';

interface InjectionBatch {
  batch_id: string;
  sample_id: string;
  injection_date: string;
  method_name: string;
  column_name: string;
  actual_batch_size: number;
  min_injection_number: number;
  max_injection_number: number;
  run_successful: boolean;
  injections: any[];
}

interface InjectionBatchDetailsDialogProps {
  batch: InjectionBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Type guard to check if data is a valid GradientStep array
const isGradientStepArray = (data: any): data is GradientStep[] => {
  return Array.isArray(data) && data.every(step => 
    typeof step === 'object' && 
    step !== null &&
    typeof step.time === 'number' &&
    typeof step.percent_a === 'number' &&
    typeof step.percent_b === 'number' &&
    typeof step.flow_rate === 'number'
  );
};

export const InjectionBatchDetailsDialog = ({ 
  batch, 
  open, 
  onOpenChange 
}: InjectionBatchDetailsDialogProps) => {
  const { data: methodDetails, isLoading } = useQuery({
    queryKey: ['method-details', batch?.injections?.[0]?.method_id],
    queryFn: async () => {
      if (!batch?.injections?.[0]?.method_id) return null;
      
      const { data, error } = await supabase
        .from('methods')
        .select('*')
        .eq('id', batch.injections[0].method_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!batch?.injections?.[0]?.method_id
  });

  // Safely extract and validate gradient steps
  const gradientSteps: GradientStep[] = methodDetails?.gradient_steps && isGradientStepArray(methodDetails.gradient_steps) 
    ? methodDetails.gradient_steps 
    : [];

  const solventUsage: SolventUsage = gradientSteps.length > 0
    ? calculateSolventUsage(
        gradientSteps,
        batch?.actual_batch_size || 0,
        methodDetails?.injection_volume || 0
      )
    : { solventA_mL: 0, solventB_mL: 0, totalVolume_mL: 0 };

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Injection Batch Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Batch Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Sample ID</label>
                  <p className="text-sm">{batch.sample_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Injection Range</label>
                  <p className="text-sm">
                    {batch.min_injection_number === batch.max_injection_number 
                      ? `#${batch.min_injection_number}`
                      : `#${batch.min_injection_number}-${batch.max_injection_number}`
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Method</label>
                  <p className="text-sm">{batch.method_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Column</label>
                  <p className="text-sm">{batch.column_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-sm">{new Date(batch.injection_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={batch.run_successful ? 'default' : 'destructive'}>
                    {batch.run_successful ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Batch Size</label>
                <Badge variant="outline" className="ml-2">
                  {batch.actual_batch_size} injections
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Solvent Usage Calculations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Estimated Solvent Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : gradientSteps.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {solventUsage.solventA_mL} mL
                      </div>
                      <div className="text-sm text-blue-700">Mobile Phase A</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {methodDetails?.mobile_phase_a || 'Solvent A'}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <Droplets className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {solventUsage.solventB_mL} mL
                      </div>
                      <div className="text-sm text-red-700">Mobile Phase B</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {methodDetails?.mobile_phase_b || 'Solvent B'}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <FlaskConical className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-600">
                        {solventUsage.totalVolume_mL} mL
                      </div>
                      <div className="text-sm text-gray-700">Total Volume</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Including injection volume
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <strong>Calculation based on:</strong> Method gradient profile ({gradientSteps.length} steps), 
                    flow rates, and batch size of {batch.actual_batch_size} injections.
                    {methodDetails?.injection_volume && ` Injection volume: ${methodDetails.injection_volume} μL per injection.`}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No gradient data available for solvent calculations</p>
                  <p className="text-sm">Method gradient profile is required to calculate solvent usage</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Injections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Individual Injections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {batch.injections.map((injection, index) => (
                  <div key={injection.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>Injection #{injection.injection_number}</span>
                    <div className="flex items-center gap-2">
                      {injection.pressure_reading && (
                        <span className="text-xs text-gray-600">
                          {injection.pressure_reading} bar
                        </span>
                      )}
                      {injection.temperature_reading && (
                        <span className="text-xs text-gray-600">
                          {injection.temperature_reading}°C
                        </span>
                      )}
                      <Badge 
                        variant={injection.run_successful ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {injection.run_successful ? 'OK' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
