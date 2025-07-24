
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MethodMetaboliteFormProps {
  methodId: string;
  relationship?: any;
  onClose: () => void;
}

export const MethodMetaboliteForm = ({ methodId, relationship, onClose }: MethodMetaboliteFormProps) => {
  const [formData, setFormData] = useState({
    metabolite_id: '',
    column_id: '',
    retention_time: '',
    peak_area_avg: '',
    signal_to_noise: '',
    recovery_percent: '',
    precision_cv: '',
    performance_rating: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch metabolites
  const { data: metabolites } = useQuery({
    queryKey: ['metabolites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('metabolites')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch columns
  const { data: columns } = useQuery({
    queryKey: ['columns'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (relationship) {
      setFormData({
        metabolite_id: relationship.metabolite_id || '',
        column_id: relationship.column_id || '',
        retention_time: relationship.retention_time?.toString() || '',
        peak_area_avg: relationship.peak_area_avg?.toString() || '',
        signal_to_noise: relationship.signal_to_noise?.toString() || '',
        recovery_percent: relationship.recovery_percent?.toString() || '',
        precision_cv: relationship.precision_cv?.toString() || '',
        performance_rating: relationship.performance_rating?.toString() || '',
        notes: relationship.notes || '',
      });
    }
  }, [relationship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        method_id: methodId,
        metabolite_id: formData.metabolite_id,
        column_id: formData.column_id,
        retention_time: formData.retention_time ? parseFloat(formData.retention_time) : null,
        peak_area_avg: formData.peak_area_avg ? parseFloat(formData.peak_area_avg) : null,
        signal_to_noise: formData.signal_to_noise ? parseFloat(formData.signal_to_noise) : null,
        recovery_percent: formData.recovery_percent ? parseFloat(formData.recovery_percent) : null,
        precision_cv: formData.precision_cv ? parseFloat(formData.precision_cv) : null,
        performance_rating: formData.performance_rating ? parseInt(formData.performance_rating) : null,
        notes: formData.notes || null,
      };

      if (relationship) {
        const { error } = await supabase
          .from('method_metabolites')
          .update(payload)
          .eq('id', relationship.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('method_metabolites')
          .insert(payload);
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['method-metabolites', methodId] });
      toast({
        title: 'Success',
        description: `Metabolite ${relationship ? 'updated' : 'added'} successfully!`,
      });
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{relationship ? 'Edit' : 'Add'} Method Metabolite</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metabolite_id">Metabolite *</Label>
              <Select
                value={formData.metabolite_id}
                onValueChange={(value) => setFormData({ ...formData, metabolite_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metabolite" />
                </SelectTrigger>
                <SelectContent>
                  {metabolites?.map((metabolite) => (
                    <SelectItem key={metabolite.id} value={metabolite.id}>
                      {metabolite.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="column_id">Column *</Label>
              <Select
                value={formData.column_id}
                onValueChange={(value) => setFormData({ ...formData, column_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns?.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name} - {column.dimensions}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="retention_time">Retention Time (min)</Label>
              <Input
                id="retention_time"
                type="number"
                step="0.01"
                value={formData.retention_time}
                onChange={(e) => setFormData({ ...formData, retention_time: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="performance_rating">Performance Rating (1-5)</Label>
              <Select
                value={formData.performance_rating}
                onValueChange={(value) => setFormData({ ...formData, performance_rating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recovery_percent">Recovery (%)</Label>
              <Input
                id="recovery_percent"
                type="number"
                step="0.1"
                value={formData.recovery_percent}
                onChange={(e) => setFormData({ ...formData, recovery_percent: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="precision_cv">Precision CV (%)</Label>
              <Input
                id="precision_cv"
                type="number"
                step="0.1"
                value={formData.precision_cv}
                onChange={(e) => setFormData({ ...formData, precision_cv: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="peak_area_avg">Average Peak Area</Label>
              <Input
                id="peak_area_avg"
                type="number"
                step="0.01"
                value={formData.peak_area_avg}
                onChange={(e) => setFormData({ ...formData, peak_area_avg: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="signal_to_noise">Signal to Noise</Label>
              <Input
                id="signal_to_noise"
                type="number"
                step="0.01"
                value={formData.signal_to_noise}
                onChange={(e) => setFormData({ ...formData, signal_to_noise: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : relationship ? 'Update' : 'Add'} Metabolite
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
