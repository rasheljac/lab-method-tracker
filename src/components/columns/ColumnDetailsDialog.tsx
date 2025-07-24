
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface ColumnDetailsDialogProps {
  column: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColumnDetailsDialog = ({ column, open, onOpenChange }: ColumnDetailsDialogProps) => {
  if (!column) return null;

  const usagePercent = (column.total_injections / column.estimated_lifetime_injections) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">{column.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                  <p className="mt-1 text-sm text-gray-900">{column.manufacturer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Part Number</label>
                  <p className="mt-1 text-sm text-gray-900">{column.part_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dimensions</label>
                  <p className="mt-1 text-sm text-gray-900">{column.dimensions}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={column.status === 'active' ? 'default' : 'secondary'}>
                      {column.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Specifications */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Stationary Phase</label>
                  <p className="mt-1 text-sm text-gray-900">{column.stationary_phase || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Particle Size</label>
                  <p className="mt-1 text-sm text-gray-900">{column.particle_size || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Max Pressure</label>
                  <p className="mt-1 text-sm text-gray-900">{column.max_pressure ? `${column.max_pressure} bar` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Max Temperature</label>
                  <p className="mt-1 text-sm text-gray-900">{column.max_temperature ? `${column.max_temperature}°C` : 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Usage Statistics */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Usage Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-500">Column Usage</label>
                    <span className="text-sm text-gray-900">{usagePercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={usagePercent} className="w-full" />
                  <p className="text-xs text-gray-500 mt-1">
                    {column.total_injections} of {column.estimated_lifetime_injections} injections
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Injections</label>
                    <p className="mt-1 text-sm text-gray-900">{column.total_injections}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Lifetime</label>
                    <p className="mt-1 text-sm text-gray-900">{column.estimated_lifetime_injections}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Important Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {column.purchase_date ? new Date(column.purchase_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">First Use Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {column.first_use_date ? new Date(column.first_use_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDistanceToNow(new Date(column.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDistanceToNow(new Date(column.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {column.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
                  <p className="text-sm text-gray-900">{column.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
