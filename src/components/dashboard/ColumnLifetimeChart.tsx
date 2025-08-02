import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GuardColumn {
  id: string;
  part_number: string;
  batch_number: string | null;
  installed_date: string;
  removed_date: string | null;
  installation_injection_count: number;
  removal_injection_count: number | null;
  expected_lifetime_injections: number | null;
  notes: string | null;
}

interface ColumnWithGuard {
  id: string;
  name: string;
  total_injections: number;
  estimated_lifetime_injections: number;
  guard_columns: GuardColumn[];
}

export const ColumnLifetimeChart = () => {
  const { data: columns, isLoading, error } = useQuery({
    queryKey: ['column-lifetime-with-guards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      console.log('Fetching column and guard column lifetime data for user:', user.id);
      
      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('total_injections', { ascending: false });
      
      if (columnsError) {
        console.error('Column lifetime error:', columnsError);
        throw columnsError;
      }

      // Fetch guard columns for each column
      const columnsWithGuards: ColumnWithGuard[] = [];
      
      for (const column of columnsData || []) {
        const { data: guardData, error: guardError } = await supabase
          .from('guard_columns')
          .select('id, part_number, batch_number, installed_date, removed_date, installation_injection_count, removal_injection_count, expected_lifetime_injections, notes')
          .eq('column_id', column.id)
          .eq('user_id', user.id)
          .order('installed_date', { ascending: false });
        
        if (guardError) {
          console.error('Guard column error:', guardError);
          // Continue without guard data for this column
          columnsWithGuards.push({
            ...column,
            guard_columns: []
          });
        } else {
          columnsWithGuards.push({
            ...column,
            guard_columns: guardData || []
          });
        }
      }
      
      console.log('Column with guards data:', columnsWithGuards);
      
      return columnsWithGuards;
    },
    // Force fresh data on every query
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const getGuardColumnLifespan = (columnId: string) => {
    const savedLifetime = localStorage.getItem(`guardColumn_${columnId}_lifetime`);
    return savedLifetime ? parseInt(savedLifetime) : 1000;
  };

  const getGuardColumnStatus = (column: ColumnWithGuard) => {
    const currentGuardColumn = column.guard_columns.find(gc => !gc.removed_date);
    if (!currentGuardColumn) return { status: 'none', percent: 0 };
    
    const guardColumnLifespan = currentGuardColumn.expected_lifetime_injections || getGuardColumnLifespan(column.id);
    const injectionsSinceInstall = column.total_injections - (currentGuardColumn.installation_injection_count || 0);
    const usagePercent = Math.min((injectionsSinceInstall / guardColumnLifespan) * 100, 100);
    
    let status = 'good';
    if (usagePercent >= 100) status = 'overdue';
    else if (usagePercent >= 80) status = 'warning';
    
    return { status, percent: usagePercent };
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (percent: number) => {
    if (percent >= 90) return 'Critical';
    if (percent >= 70) return 'Warning';
    return 'Good';
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Column Lifetime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Column lifetime error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Column Lifetime Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>Error loading column data</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Column Lifetime Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p>No active columns found</p>
            <p className="text-sm">Add columns to track their lifetime usage</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card data-chart="column-lifetime-chart">
        <CardHeader>
          <CardTitle>Column Lifetime Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {columns.slice(0, 5).map((column) => {
              const columnUsagePercent = (column.total_injections / column.estimated_lifetime_injections) * 100;
              const guardStatus = getGuardColumnStatus(column);
              const currentGuardColumn = column.guard_columns.find(gc => !gc.removed_date);

              return (
                <div key={column.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{column.name}</p>
                      <p className="text-xs text-gray-500">
                        {column.total_injections} / {column.estimated_lifetime_injections} injections
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(columnUsagePercent)} text-white border-none`}
                      >
                        {getStatusText(columnUsagePercent)}
                      </Badge>
                      {guardStatus.status !== 'none' && (
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(guardStatus.percent)} text-white border-none text-xs`}
                        >
                          Guard: {guardStatus.status === 'overdue' ? 'Overdue' : guardStatus.status === 'warning' ? 'Warning' : 'Good'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
                          {/* Main column progress */}
                          <div 
                            className={`absolute top-0 left-0 h-full ${getStatusColor(columnUsagePercent)} transition-all`}
                            style={{ width: `${Math.min(columnUsagePercent, 100)}%` }}
                          />
                          
                          {/* Guard column overlay - shows as a striped pattern when active */}
                          {guardStatus.status !== 'none' && (
                            <div 
                              className={`absolute top-0 left-0 h-full ${getStatusColor(guardStatus.percent)} opacity-70 transition-all`}
                              style={{ 
                                width: `${Math.min(guardStatus.percent, 100)}%`,
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
                              }}
                            />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium">Main Column</p>
                            <p className="text-sm">{columnUsagePercent.toFixed(1)}% used ({column.total_injections}/{column.estimated_lifetime_injections})</p>
                          </div>
                          {guardStatus.status !== 'none' && currentGuardColumn && (
                            <div>
                              <p className="font-medium">Guard Column</p>
                              <p className="text-sm">
                                {guardStatus.percent.toFixed(1)}% used 
                                ({column.total_injections - currentGuardColumn.installation_injection_count}/{currentGuardColumn.expected_lifetime_injections || getGuardColumnLifespan(column.id)})
                              </p>
                            </div>
                          )}
                          {guardStatus.status === 'none' && (
                            <p className="text-sm text-gray-600">No active guard column</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Column: {columnUsagePercent.toFixed(1)}% used</span>
                    {guardStatus.status !== 'none' && (
                      <span>Guard: {guardStatus.percent.toFixed(1)}% used</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
