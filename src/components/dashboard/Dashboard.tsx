
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { ColumnLifetimeChart } from './ColumnLifetimeChart';
import { PdfExportButton } from './PdfExportButton';

export const Dashboard = () => {
  // Fetch dashboard stats for PDF export
  const { data: stats } = useQuery({
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

  // Fetch columns data for PDF export
  const { data: columns } = useQuery({
    queryKey: ['columns-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .order('total_injections', { ascending: false });
      
      if (error) throw error;
      
      // Transform data for PDF export
      return data.map(column => ({
        id: column.id,
        name: column.name,
        total_injections: column.total_injections,
        estimated_lifetime_injections: column.estimated_lifetime_injections,
        manufacturer: column.manufacturer || 'Unknown',
        dimensions: column.dimensions || 'Unknown',
        status: column.status || 'active',
        usage_percent: (column.total_injections / column.estimated_lifetime_injections) * 100
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">Overview of your lab methods and equipment</p>
        </div>
        <PdfExportButton stats={stats} columns={columns} />
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <ColumnLifetimeChart />
      </div>
    </div>
  );
};
