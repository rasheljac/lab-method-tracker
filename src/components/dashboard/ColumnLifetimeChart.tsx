
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const ColumnLifetimeChart = () => {
  const { data: columns, isLoading, error } = useQuery({
    queryKey: ['column-lifetime'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      console.log('Fetching column lifetime data for user:', user.id);
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('total_injections', { ascending: false });
      
      if (error) {
        console.error('Column lifetime error:', error);
        throw error;
      }
      
      console.log('Column lifetime data:', data);
      
      // Log each column's injection count for debugging
      data?.forEach(column => {
        console.log(`Column ${column.name}: ${column.total_injections} injections (${((column.total_injections / column.estimated_lifetime_injections) * 100).toFixed(1)}% used)`);
      });
      
      return data;
    },
    // Force fresh data on every query
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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
    <Card>
      <CardHeader>
        <CardTitle>Column Lifetime Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {columns.slice(0, 5).map((column) => {
            const usagePercent = (column.total_injections / column.estimated_lifetime_injections) * 100;
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

            return (
              <div key={column.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{column.name}</p>
                    <p className="text-xs text-gray-500">
                      {column.total_injections} / {column.estimated_lifetime_injections} injections
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(usagePercent)} text-white border-none`}
                  >
                    {getStatusText(usagePercent)}
                  </Badge>
                </div>
                <Progress value={usagePercent} className="h-2" />
                <p className="text-xs text-gray-400 text-right">
                  {usagePercent.toFixed(1)}% used
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
