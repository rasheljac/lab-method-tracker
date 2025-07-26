
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, AlertTriangle } from 'lucide-react';
import { GuardColumnForm } from './GuardColumnForm';
import { GuardColumnTimeline } from './GuardColumnTimeline';

interface GuardColumn {
  id: string;
  part_number: string;
  batch_number: string | null;
  installed_date: string;
  removed_date: string | null;
  installation_injection_count: number;
  removal_injection_count: number | null;
  notes: string | null;
}

interface GuardColumnTrackerProps {
  columnId: string;
  columnName: string;
  totalInjections: number;
}

export const GuardColumnTracker = ({ columnId, columnName, totalInjections }: GuardColumnTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: guardColumns, isLoading } = useQuery({
    queryKey: ['guard-columns', columnId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('exec', {
        sql: `
          SELECT id, part_number, batch_number, installed_date, removed_date,
                 installation_injection_count, removal_injection_count, notes
          FROM guard_columns 
          WHERE column_id = $1 AND user_id = $2
          ORDER BY installed_date ASC
        `,
        args: [columnId, (await supabase.auth.getUser()).data.user?.id]
      });
      
      if (error) throw error;
      return data as GuardColumn[];
    },
  });

  const currentGuardColumn = guardColumns?.find(gc => !gc.removed_date);
  const guardColumnLifespan = 1000; // Typical guard column lifespan in injections

  const getGuardColumnStatus = () => {
    if (!currentGuardColumn) return 'none';
    
    const injectionsSinceInstall = totalInjections - (currentGuardColumn.installation_injection_count || 0);
    const usagePercent = (injectionsSinceInstall / guardColumnLifespan) * 100;
    
    if (usagePercent >= 100) return 'overdue';
    if (usagePercent >= 80) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'destructive';
      case 'warning': return 'secondary';
      case 'good': return 'default';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'overdue': return 'Change Overdue';
      case 'warning': return 'Change Soon';
      case 'good': return 'Good';
      case 'none': return 'No Guard Column';
      default: return 'Unknown';
    }
  };

  const status = getGuardColumnStatus();

  if (showForm) {
    return (
      <GuardColumnForm
        columnId={columnId}
        columnName={columnName}
        totalInjections={totalInjections}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: ['guard-columns', columnId] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Guard Column Status - {columnName}
            </CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalInjections}</div>
              <div className="text-sm text-gray-500">Total Injections</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge variant={getStatusColor(status)}>
                  {status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {getStatusText(status)}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">Guard Column Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {currentGuardColumn ? 
                  Math.max(0, guardColumnLifespan - (totalInjections - (currentGuardColumn.installation_injection_count || 0))) 
                  : '-'}
              </div>
              <div className="text-sm text-gray-500">Injections Remaining</div>
            </div>
          </div>

          {currentGuardColumn && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Current Guard Column</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Part Number:</span>
                  <span className="ml-2">{currentGuardColumn.part_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-700">Installed:</span>
                  <span className="ml-2">
                    {new Date(currentGuardColumn.installed_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Batch:</span>
                  <span className="ml-2">{currentGuardColumn.batch_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-700">Injections Since Install:</span>
                  <span className="ml-2">
                    {totalInjections - (currentGuardColumn.installation_injection_count || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GuardColumnTimeline guardColumns={guardColumns || []} />
    </div>
  );
};
