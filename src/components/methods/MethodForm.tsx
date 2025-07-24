
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { GradientTable } from './GradientTable';

type MethodType = Database['public']['Enums']['method_type'];
type SampleType = Database['public']['Enums']['sample_type'];

interface GradientStep {
  time: number;
  percent_a: number;
  percent_b: number;
  flow_rate: number;
}

interface MethodFormProps {
  method?: any;
  onClose: () => void;
}

export const MethodForm = ({ method, onClose }: MethodFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ionization_mode: 'positive' as MethodType,
    flow_rate: '',
    column_temperature: '',
    injection_volume: '',
    run_time: '',
    mobile_phase_a: '',
    mobile_phase_b: '',
    gradient_profile: '',
    sample_type: '' as SampleType | '',
    gradient_steps: [] as GradientStep[],
    column_id: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's columns for selection
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
    if (method) {
      console.log('Populating form with method data:', method);
      setFormData({
        name: method.name || '',
        description: method.description || '',
        ionization_mode: method.ionization_mode || 'positive',
        flow_rate: method.flow_rate ? String(method.flow_rate) : '',
        column_temperature: method.column_temperature ? String(method.column_temperature) : '',
        injection_volume: method.injection_volume ? String(method.injection_volume) : '',
        run_time: method.run_time ? String(method.run_time) : '',
        mobile_phase_a: method.mobile_phase_a || '',
        mobile_phase_b: method.mobile_phase_b || '',
        gradient_profile: method.gradient_profile || '',
        sample_type: method.sample_type || '',
        gradient_steps: method.gradient_steps || [],
        column_id: method.column_id || '',
      });
    } else {
      // Reset form for new method
      setFormData({
        name: '',
        description: '',
        ionization_mode: 'positive' as MethodType,
        flow_rate: '',
        column_temperature: '',
        injection_volume: '',
        run_time: '',
        mobile_phase_a: '',
        mobile_phase_b: '',
        gradient_profile: '',
        sample_type: '',
        gradient_steps: [],
        column_id: '',
      });
    }
  }, [method]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const payload = {
        ...formData,
        flow_rate: formData.flow_rate ? parseFloat(formData.flow_rate) : null,
        column_temperature: formData.column_temperature ? parseInt(formData.column_temperature) : null,
        injection_volume: formData.injection_volume ? parseFloat(formData.injection_volume) : null,
        run_time: formData.run_time ? parseInt(formData.run_time) : null,
        sample_type: formData.sample_type || null,
        gradient_steps: formData.gradient_steps.length > 0 ? formData.gradient_steps as any : null,
        column_id: formData.column_id || null,
        user_id: user.id,
      };

      if (method) {
        const { error } = await supabase
          .from('methods')
          .update(payload)
          .eq('id', method.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('methods')
          .insert(payload);
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['methods'] });
      toast({
        title: 'Success',
        description: `Method ${method ? 'updated' : 'created'} successfully!`,
      });
      onClose();
    } catch (error: any) {
      console.error('Error saving method:', error);
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{method ? 'Edit Method' : 'Add New Method'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Method Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="column_id">Column *</Label>
              <Select
                value={formData.column_id}
                onValueChange={(value) => setFormData({ ...formData, column_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a column" />
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
            <div className="space-y-2">
              <Label htmlFor="ionization_mode">Ionization Mode *</Label>
              <Select
                value={formData.ionization_mode}
                onValueChange={(value: MethodType) => setFormData({ ...formData, ionization_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample_type">Sample Type</Label>
              <Select
                value={formData.sample_type}
                onValueChange={(value: SampleType) => setFormData({ ...formData, sample_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sample type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="serum">Serum</SelectItem>
                  <SelectItem value="urine">Urine</SelectItem>
                  <SelectItem value="tissue">Tissue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow_rate">Flow Rate (mL/min)</Label>
              <Input
                id="flow_rate"
                type="number"
                step="0.01"
                value={formData.flow_rate}
                onChange={(e) => setFormData({ ...formData, flow_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="column_temperature">Column Temperature (°C)</Label>
              <Input
                id="column_temperature"
                type="number"
                value={formData.column_temperature}
                onChange={(e) => setFormData({ ...formData, column_temperature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="injection_volume">Injection Volume (μL)</Label>
              <Input
                id="injection_volume"
                type="number"
                step="0.1"
                value={formData.injection_volume}
                onChange={(e) => setFormData({ ...formData, injection_volume: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="run_time">Run Time (min)</Label>
              <Input
                id="run_time"
                type="number"
                value={formData.run_time}
                onChange={(e) => setFormData({ ...formData, run_time: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile_phase_a">Mobile Phase A</Label>
              <Input
                id="mobile_phase_a"
                value={formData.mobile_phase_a}
                onChange={(e) => setFormData({ ...formData, mobile_phase_a: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile_phase_b">Mobile Phase B</Label>
              <Input
                id="mobile_phase_b"
                value={formData.mobile_phase_b}
                onChange={(e) => setFormData({ ...formData, mobile_phase_b: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gradient_profile">Gradient Profile (Text)</Label>
            <Textarea
              id="gradient_profile"
              value={formData.gradient_profile}
              onChange={(e) => setFormData({ ...formData, gradient_profile: e.target.value })}
              rows={3}
              placeholder="e.g., 0-2 min: 95% A, 2-10 min: 95-5% A, 10-12 min: 5% A"
            />
          </div>

          <GradientTable
            value={formData.gradient_steps}
            onChange={(steps) => setFormData({ ...formData, gradient_steps: steps })}
          />
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : method ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
