
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FlaskConical, Columns, Pill, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      return data?.[0];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Methods',
      value: stats?.total_methods || 0,
      description: 'LCMS methods created',
      icon: FlaskConical,
      color: 'text-blue-600',
    },
    {
      title: 'Active Columns',
      value: stats?.active_columns || 0,
      description: 'Columns in use',
      icon: Columns,
      color: 'text-green-600',
    },
    {
      title: 'Metabolites',
      value: stats?.total_metabolites || 0,
      description: 'Tracked compounds',
      icon: Pill,
      color: 'text-purple-600',
    },
    {
      title: 'Total Injections',
      value: stats?.total_injections || 0,
      description: 'Samples analyzed',
      icon: Activity,
      color: 'text-orange-600',
    },
    {
      title: 'Column Usage',
      value: `${(stats?.avg_column_usage || 0).toFixed(1)}%`,
      description: 'Average column lifetime used',
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      title: 'Total Columns',
      value: stats?.total_columns || 0,
      description: 'All columns (active + retired)',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription className="text-xs text-muted-foreground">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
