
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

interface ColumnFormProps {
  column?: any;
  onClose: () => void;
}

export const ColumnForm = ({ column, onClose }: ColumnFormProps) => {
  const [formData, setFormData] = useState({
    name: column?.name || '',
    manufacturer: column?.manufacturer || '',
    part_number: column?.part_number || '',
    stationary_phase: column?.stationary_phase || '',
    particle_size: column?.particle_size || '',
    dimensions: column?.dimensions || '',
    max_pressure: column?.max_pressure || '',
    max_temperature: column?.max_temperature || '',
    estimated_lifetime_injections: column?.estimated_lifetime_injections || 10000,
    purchase_date: column?.purchase_date || '',
    first_use_date: column?.first_use_date || '',
    status: column?.status || 'active',
    notes: column?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const submitData = {
        ...formData,
        user_id: user.id,
        max_pressure: formData.max_pressure ? parseInt(formData.max_pressure) : null,
        max_temperature: formData.max_temperature ? parseInt(formData.max_temperature) : null,
        estimated_lifetime_injections: parseInt(formData.estimated_lifetime_injections.toString()),
        purchase_date: formData.purchase_date || null,
        first_use_date: formData.first_use_date || null,
      };

      if (column) {
        const { error } = await supabase
          .from('columns')
          .update(submitData)
          .eq('id', column.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Column updated successfully!',
        });
      } else {
        const { error } = await supabase
          .from('columns')
          .insert(submitData);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Column created successfully!',
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Columns
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{column ? 'Edit Column' : 'Add New Column'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Column Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="part_number">Part Number</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stationary_phase">Stationary Phase</Label>
                <Input
                  id="stationary_phase"
                  value={formData.stationary_phase}
                  onChange={(e) => setFormData({ ...formData, stationary_phase: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="particle_size">Particle Size</Label>
                <Input
                  id="particle_size"
                  value={formData.particle_size}
                  onChange={(e) => setFormData({ ...formData, particle_size: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max_pressure">Max Pressure (bar)</Label>
                <Input
                  id="max_pressure"
                  type="number"
                  value={formData.max_pressure}
                  onChange={(e) => setFormData({ ...formData, max_pressure: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max_temperature">Max Temperature (°C)</Label>
                <Input
                  id="max_temperature"
                  type="number"
                  value={formData.max_temperature}
                  onChange={(e) => setFormData({ ...formData, max_temperature: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="estimated_lifetime_injections">Estimated Lifetime Injections</Label>
                <Input
                  id="estimated_lifetime_injections"
                  type="number"
                  value={formData.estimated_lifetime_injections}
                  onChange={(e) => setFormData({ ...formData, estimated_lifetime_injections: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="first_use_date">First Use Date</Label>
                <Input
                  id="first_use_date"
                  type="date"
                  value={formData.first_use_date}
                  onChange={(e) => setFormData({ ...formData, first_use_date: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : column ? 'Update Column' : 'Create Column'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
