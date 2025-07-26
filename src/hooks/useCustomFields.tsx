
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required: boolean;
  select_options?: string[];
  field_order: number;
}

export const useCustomFields = () => {
  return useQuery({
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
};
