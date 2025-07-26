
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface MetaboliteDetailsDialogProps {
  metabolite: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MetaboliteDetailsDialog = ({
  metabolite,
  open,
  onOpenChange,
}: MetaboliteDetailsDialogProps) => {
  if (!metabolite) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{metabolite.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Chemical Formula</h4>
              <p className="text-gray-600">{metabolite.formula || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Molecular Weight</h4>
              <p className="text-gray-600">{metabolite.molecular_weight ? `${metabolite.molecular_weight} g/mol` : 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">CAS Number</h4>
              <p className="text-gray-600">{metabolite.cas_number || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Retention Time Range</h4>
              <p className="text-gray-600">{metabolite.retention_time_range || 'N/A'}</p>
            </div>
          </div>
          
          {metabolite.ionization_preference && (
            <div>
              <h4 className="font-medium text-gray-900">Ionization Preference</h4>
              <Badge variant="outline" className="mt-1">
                {metabolite.ionization_preference}
              </Badge>
            </div>
          )}
          
          {metabolite.notes && (
            <div>
              <h4 className="font-medium text-gray-900">Notes</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{metabolite.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
