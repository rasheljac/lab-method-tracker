
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { GradientTable } from './GradientTable';

interface MethodDetailsDialogProps {
  method: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MethodDetailsDialog = ({ method, open, onOpenChange }: MethodDetailsDialogProps) => {
  if (!method) return null;

  const getIonizationBadge = (mode: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      both: 'bg-blue-100 text-blue-800',
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Process gradient steps to ensure they're in the correct format
  const processGradientSteps = (steps: any) => {
    console.log('Processing gradient steps:', steps);
    if (!steps) return [];
    if (Array.isArray(steps)) return steps;
    if (typeof steps === 'string') {
      try {
        const parsed = JSON.parse(steps);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const gradientSteps = processGradientSteps(method.gradient_steps);
  console.log('Processed gradient steps:', gradientSteps);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">{method.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ionization Mode</label>
                    <div className="mt-1">
                      <Badge className={getIonizationBadge(method.ionization_mode)}>
                        {method.ionization_mode}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sample Type</label>
                    <div className="mt-1">
                      <Badge variant="outline">{method.sample_type || 'N/A'}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Flow Rate</label>
                    <p className="mt-1 text-sm text-gray-900">{method.flow_rate ? `${method.flow_rate} mL/min` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Run Time</label>
                    <p className="mt-1 text-sm text-gray-900">{method.run_time ? `${method.run_time} min` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Injection Volume</label>
                    <p className="mt-1 text-sm text-gray-900">{method.injection_volume ? `${method.injection_volume} µL` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Column Temperature</label>
                    <p className="mt-1 text-sm text-gray-900">{method.column_temperature ? `${method.column_temperature}°C` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Column Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Column Information</h3>
                {method.column ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Column Name</label>
                        <p className="mt-1 text-sm text-gray-900">{method.column.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Dimensions</label>
                        <p className="mt-1 text-sm text-gray-900">{method.column.dimensions}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                        <p className="mt-1 text-sm text-gray-900">{method.column.manufacturer}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No column assigned</p>
                )}
              </div>

              <Separator />

              {/* Mobile Phases */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Mobile Phases</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mobile Phase A</label>
                    <p className="mt-1 text-sm text-gray-900">{method.mobile_phase_a || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mobile Phase B</label>
                    <p className="mt-1 text-sm text-gray-900">{method.mobile_phase_b || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Gradient Profile */}
              {method.gradient_profile && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Gradient Profile</h3>
                    <p className="text-sm text-gray-900">{method.gradient_profile}</p>
                  </div>
                </>
              )}

              {/* Gradient Chart - Always show if there are steps */}
              {gradientSteps.length > 0 && (
                <>
                  <Separator />
                  <div className="min-h-0 flex-1">
                    <h3 className="font-medium text-gray-900 mb-3">Gradient Chart</h3>
                    <div className="w-full overflow-visible">
                      <GradientTable
                        value={gradientSteps}
                        onChange={() => {}} // Read-only in details view
                        readOnly={true}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              {method.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{method.description}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Metadata */}
              <div className="pb-6">
                <h3 className="font-medium text-gray-900 mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDistanceToNow(new Date(method.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDistanceToNow(new Date(method.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
