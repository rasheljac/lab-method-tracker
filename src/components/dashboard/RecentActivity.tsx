
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Activity, FlaskConical, Columns, Pill } from 'lucide-react';

export const RecentActivity = () => {
  const { data: recentInjections, isLoading } = useQuery({
    queryKey: ['recent-injections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('injections')
        .select(`
          *,
          methods(name),
          columns(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentMethods } = useQuery({
    queryKey: ['recent-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('methods')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
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
    ...(recentInjections?.slice(0, 5).map(injection => ({
      type: 'injection',
      icon: Activity,
      title: `Injection #${injection.injection_number}`,
      subtitle: `${injection.methods?.name} on ${injection.columns?.name}`,
      time: injection.created_at,
      success: injection.run_successful,
    })) || []),
    ...(recentMethods?.slice(0, 3).map(method => ({
      type: 'method',
      icon: FlaskConical,
      title: `Method created: ${method.name}`,
      subtitle: `${method.ionization_mode} mode`,
      time: method.created_at,
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
                  activity.success === false ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
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
