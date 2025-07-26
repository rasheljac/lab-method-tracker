
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomField } from '@/hooks/useCustomFields';

interface CustomFieldsRendererProps {
  customFields: CustomField[];
  customFieldValues: Record<string, any>;
  onCustomFieldChange: (fieldName: string, value: any) => void;
  errors?: Record<string, any>;
}

export const CustomFieldsRenderer = ({
  customFields,
  customFieldValues,
  onCustomFieldChange,
  errors = {},
}: CustomFieldsRendererProps) => {
  const renderField = (field: CustomField) => {
    const value = customFieldValues[field.field_name];
    const error = errors[field.field_name];

    switch (field.field_type) {
      case 'text':
        return (
          <div key={field.id}>
            <Label htmlFor={field.field_name}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Input
              id={field.field_name}
              value={value || ''}
              onChange={(e) => onCustomFieldChange(field.field_name, e.target.value)}
              placeholder={`Enter ${field.field_label.toLowerCase()}`}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id}>
            <Label htmlFor={field.field_name}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Input
              id={field.field_name}
              type="number"
              value={value || ''}
              onChange={(e) => onCustomFieldChange(field.field_name, parseFloat(e.target.value) || null)}
              placeholder={`Enter ${field.field_label.toLowerCase()}`}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id}>
            <Label>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => onCustomFieldChange(field.field_name, date?.toISOString() || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Switch
              id={field.field_name}
              checked={value || false}
              onCheckedChange={(checked) => onCustomFieldChange(field.field_name, checked)}
            />
            <Label htmlFor={field.field_name}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            {error && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id}>
            <Label>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(selectedValue) => onCustomFieldChange(field.field_name, selectedValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.select_options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!customFields?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Custom Fields</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.map(renderField)}
      </div>
    </div>
  );
};
