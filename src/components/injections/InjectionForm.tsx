
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface InjectionFormProps {
  injection?: any;
  onClose: () => void;
}

export const InjectionForm = ({ injection, onClose }: InjectionFormProps) => {
  const [formData, setFormData] = useState({
    injection_number: injection?.injection_number || '',
    method_id: injection?.method_id || '',
    column_id: injection?.column_id || '',
    sample_id: injection?.sample_id || '',
    injection_date: injection?.injection_date ? new Date(injection.injection_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    run_successful: injection?.run_successful ?? true,
    temperature_reading: injection?.temperature_reading || '',
    pressure_reading: injection?.pressure_reading || '',
    notes: injection?.notes || '',
    quantity: 1,
  });

  const [methods, setMethods] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextInjectionNumber, setNextInjectionNumber] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [methodsRes, columnsRes] = await Promise.all([
          supabase.from('methods').select('id, name').eq('user_id', user.id),
          supabase.from('columns').select('id, name').eq('user_id', user.id).eq('status', 'active')
        ]);

        if (methodsRes.data) setMethods(methodsRes.data);
        if (columnsRes.data) setColumns(columnsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [injection]);

  // Calculate next injection number when column changes
  useEffect(() => {
    const calculateNextInjectionNumber = async () => {
      if (!formData.column_id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: lastInjection } = await supabase
          .from('injections')
          .select('injection_number')
          .eq('user_id', user.id)
          .eq('column_id', formData.column_id)
          .order('injection_number', { ascending: false })
          .limit(1);

        const nextNumber = lastInjection && lastInjection.length > 0 ? lastInjection[0].injection_number + 1 : 1;
        setNextInjectionNumber(nextNumber);
        
        if (!injection) {
          setFormData(prev => ({ ...prev, injection_number: nextNumber.toString() }));
        }
      } catch (error) {
        console.error('Error calculating next injection number:', error);
      }
    };

    calculateNextInjectionNumber();
  }, [formData.column_id, injection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (injection) {
        // Update existing injection
        const submitData = {
          ...formData,
          user_id: user.id,
          injection_number: parseInt(formData.injection_number),
          temperature_reading: formData.temperature_reading ? parseInt(formData.temperature_reading) : null,
          pressure_reading: formData.pressure_reading ? parseInt(formData.pressure_reading) : null,
          injection_date: new Date(formData.injection_date).toISOString(),
        };

        const { error } = await supabase
          .from('injections')
          .update(submitData)
          .eq('id', injection.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Injection updated successfully!',
        });
      } else {
        // Create new injection batch
        const quantity = parseInt(formData.quantity.toString());
        const batchId = uuidv4(); // Generate a single batch ID for all injections
        const injections = [];
        
        for (let i = 0; i < quantity; i++) {
          const submitData = {
            user_id: user.id,
            method_id: formData.method_id,
            column_id: formData.column_id,
            sample_id: formData.sample_id,
            injection_number: nextInjectionNumber + i,
            temperature_reading: formData.temperature_reading ? parseInt(formData.temperature_reading) : null,
            pressure_reading: formData.pressure_reading ? parseInt(formData.pressure_reading) : null,
            injection_date: new Date(formData.injection_date).toISOString(),
            run_successful: formData.run_successful,
            notes: formData.notes,
            batch_id: batchId,
            batch_size: quantity,
          };
          injections.push(submitData);
        }

        const { error } = await supabase
          .from('injections')
          .insert(injections);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `Injection batch with ${quantity} injection${quantity > 1 ? 's' : ''} created successfully!`,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['injections'] });
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
          Back to Injection Batches
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{injection ? 'Edit Injection Batch' : 'Add New Injection Batch'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="injection_number">Starting Injection Number *</Label>
                <Input
                  id="injection_number"
                  type="number"
                  value={formData.injection_number}
                  onChange={(e) => setFormData({ ...formData, injection_number: e.target.value })}
                  required
                  readOnly={!injection}
                  className={!injection ? 'bg-gray-50' : ''}
                />
                {!injection && (
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-calculated for selected column
                  </p>
                )}
              </div>
              
              {!injection && (
                <div>
                  <Label htmlFor="quantity">Batch Size *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Number of injections in this batch (1-100)
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="method_id">Method *</Label>
                <Select value={formData.method_id} onValueChange={(value) => setFormData({ ...formData, method_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sample_id">Sample ID</Label>
                <Input
                  id="sample_id"
                  value={formData.sample_id}
                  onChange={(e) => setFormData({ ...formData, sample_id: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="injection_date">Injection Date *</Label>
                <Input
                  id="injection_date"
                  type="date"
                  value={formData.injection_date}
                  onChange={(e) => setFormData({ ...formData, injection_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="temperature_reading">Temperature Reading (°C)</Label>
                <Input
                  id="temperature_reading"
                  type="number"
                  value={formData.temperature_reading}
                  onChange={(e) => setFormData({ ...formData, temperature_reading: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="pressure_reading">Pressure Reading (bar)</Label>
                <Input
                  id="pressure_reading"
                  type="number"
                  value={formData.pressure_reading}
                  onChange={(e) => setFormData({ ...formData, pressure_reading: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="run_successful"
                  checked={formData.run_successful}
                  onCheckedChange={(checked) => setFormData({ ...formData, run_successful: checked as boolean })}
                />
                <Label htmlFor="run_successful">Run Successful</Label>
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
                {loading ? 'Saving...' : injection ? 'Update Injection Batch' : `Create Batch of ${formData.quantity}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
