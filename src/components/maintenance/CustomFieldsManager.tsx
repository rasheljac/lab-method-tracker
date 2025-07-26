
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface CustomField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required: boolean;
  select_options?: string[];
  field_order: number;
}

interface CustomFieldsManagerProps {
  onClose: () => void;
}

export const CustomFieldsManager = ({ onClose }: CustomFieldsManagerProps) => {
  const [newField, setNewField] = useState({
    field_name: '',
    field_type: 'text',
    field_label: '',
    is_required: false,
    select_options: [] as string[],
  });
  const [selectOptions, setSelectOptions] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customFields, isLoading } = useQuery({
    queryKey: ['maintenance-custom-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_custom_fields')
        .select('*')
        .order('field_order', { ascending: true });
      
      if (error) throw error;
      return data as CustomField[];
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: async (field: typeof newField) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fieldData = {
        ...field,
        user_id: user.id,
        field_order: (customFields?.length || 0) + 1,
        select_options: field.field_type === 'select' ? field.select_options : null,
      };

      const { error } = await supabase
        .from('maintenance_custom_fields')
        .insert(fieldData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-custom-fields'] });
      setNewField({
        field_name: '',
        field_type: 'text',
        field_label: '',
        is_required: false,
        select_options: [],
      });
      setSelectOptions('');
      toast({
        title: 'Success',
        description: 'Custom field created successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('maintenance_custom_fields')
        .delete()
        .eq('id', fieldId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-custom-fields'] });
      toast({
        title: 'Success',
        description: 'Custom field deleted successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newField.field_name || !newField.field_label) {
      toast({
        title: 'Error',
        description: 'Field name and label are required',
        variant: 'destructive',
      });
      return;
    }

    const fieldData = {
      ...newField,
      field_name: newField.field_name.toLowerCase().replace(/\s+/g, '_'),
      select_options: newField.field_type === 'select' 
        ? selectOptions.split('\n').filter(option => option.trim())
        : [],
    };

    createFieldMutation.mutate(fieldData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Custom Fields</h2>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Custom Field
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="field_label">Field Label *</Label>
                <Input
                  id="field_label"
                  value={newField.field_label}
                  onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))}
                  placeholder="e.g., Serial Number"
                />
              </div>

              <div>
                <Label htmlFor="field_name">Field Name *</Label>
                <Input
                  id="field_name"
                  value={newField.field_name}
                  onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                  placeholder="e.g., serial_number"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be converted to lowercase with underscores
                </p>
              </div>

              <div>
                <Label htmlFor="field_type">Field Type *</Label>
                <Select
                  value={newField.field_type}
                  onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newField.field_type === 'select' && (
                <div>
                  <Label htmlFor="select_options">Options (one per line)</Label>
                  <Textarea
                    id="select_options"
                    value={selectOptions}
                    onChange={(e) => setSelectOptions(e.target.value)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_required"
                  checked={newField.is_required}
                  onCheckedChange={(checked) => setNewField(prev => ({ ...prev, is_required: checked }))}
                />
                <Label htmlFor="is_required">Required field</Label>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createFieldMutation.isPending}
              >
                {createFieldMutation.isPending ? 'Adding...' : 'Add Field'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Existing Fields ({customFields?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : customFields?.length ? (
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{field.field_label}</div>
                      <div className="text-sm text-gray-500">
                        {field.field_name} • {field.field_type}
                        {field.is_required && (
                          <Badge variant="secondary" className="ml-2">Required</Badge>
                        )}
                      </div>
                      {field.select_options && field.select_options.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Options: {field.select_options.join(', ')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFieldMutation.mutate(field.id)}
                      disabled={deleteFieldMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No custom fields yet. Add your first field to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
