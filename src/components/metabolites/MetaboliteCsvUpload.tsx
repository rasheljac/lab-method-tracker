
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetaboliteCsvUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MetaboliteCsvUpload = ({ onSuccess, onCancel }: MetaboliteCsvUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Error',
          description: 'Please select a CSV file',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const metabolites = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;

      const metabolite: any = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'compound':
          case 'name':
            metabolite.name = value;
            break;
          case 'formula':
            metabolite.formula = value;
            break;
          case 'm/z':
          case 'mw':
          case 'molecular_weight':
            metabolite.molecular_weight = value ? parseFloat(value) : null;
            break;
          case 'rt':
          case 'retention_time':
          case 'retention_time_range':
            metabolite.retention_time_range = value;
            break;
          case 'cas':
          case 'cas_number':
            metabolite.cas_number = value;
            break;
          case 'ionization':
          case 'ionization_preference':
            metabolite.ionization_preference = value.toLowerCase();
            break;
          default:
            break;
        }
      });

      if (metabolite.name) {
        metabolites.push(metabolite);
      }
    }

    return metabolites;
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const metabolites = parseCSV(text);

          if (metabolites.length === 0) {
            throw new Error('No valid metabolites found in CSV file');
          }

          // Add user_id to each metabolite
          const metabolitesWithUserId = metabolites.map(m => ({
            ...m,
            user_id: user.id,
          }));

          const { error } = await supabase
            .from('metabolites')
            .insert(metabolitesWithUserId);

          if (error) throw error;

          toast({
            title: 'Success',
            description: `Successfully imported ${metabolites.length} metabolites`,
          });

          onSuccess();
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
      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Metabolites
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Metabolites from CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Expected columns: compound, formula, m/z, RT (retention time)
            </p>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Preview (first 5 rows):</h3>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="px-3 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || loading}
            >
              {loading ? 'Importing...' : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Metabolites
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
