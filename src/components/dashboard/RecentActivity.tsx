
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Activity, FlaskConical, Wrench, Package } from 'lucide-react';

export const RecentActivity = () => {
  const { data: recentBatches, isLoading } = useQuery({
    queryKey: ['recent-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('injections')
        .select(`
          batch_id,
          batch_size,
          created_at,
          methods(name),
          columns(name),
          run_successful
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by batch_id and get the latest entry for each batch
      const batchMap = new Map();
      data.forEach(injection => {
        const batchId = injection.batch_id;
        if (!batchMap.has(batchId) || new Date(injection.created_at) > new Date(batchMap.get(batchId).created_at)) {
          batchMap.set(batchId, injection);
        }
      });
      
      return Array.from(batchMap.values()).slice(0, 5);
    },
  });

  const { data: recentMethods } = useQuery({
    queryKey: ['recent-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('methods')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentMaintenance } = useQuery({
    queryKey: ['recent-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = [
    ...(recentBatches?.map(batch => ({
      type: 'batch',
      icon: Package,
      title: `Injection Batch (${batch.batch_size} injections)`,
      subtitle: `${batch.methods?.name} on ${batch.columns?.name}`,
      time: batch.created_at,
      success: batch.run_successful,
    })) || []),
    ...(recentMethods?.map(method => ({
      type: 'method',
      icon: FlaskConical,
      title: `Method created: ${method.name}`,
      subtitle: `${method.ionization_mode} mode`,
      time: method.created_at,
      success: true,
    })) || []),
    ...(recentMaintenance?.map(maintenance => ({
      type: 'maintenance',
      icon: Wrench,
      title: `Maintenance: ${maintenance.title}`,
      subtitle: `${maintenance.maintenance_type} maintenance`,
      time: maintenance.created_at,
      success: true,
    })) || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.success === false ? 'bg-red-100 text-red-600' : 
                  activity.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'batch' ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activity.subtitle}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
