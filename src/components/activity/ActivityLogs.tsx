
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Activity, FlaskConical, Wrench, Package, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 20;

export const ActivityLogs = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activity-logs', currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      
      // Fetch batches (injections grouped by batch_id)
      const { data: batchData, error: batchError } = await supabase
        .from('injections')
        .select(`
          batch_id,
          batch_size,
          created_at,
          methods(name),
          columns(name),
          run_successful
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      if (batchError) throw batchError;

      // Fetch methods
      const { data: methodData, error: methodError } = await supabase
        .from('methods')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      if (methodError) throw methodError;

      // Fetch maintenance logs
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      if (maintenanceError) throw maintenanceError;

      // Fetch columns
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      if (columnError) throw columnError;

      // Fetch metabolites
      const { data: metaboliteData, error: metaboliteError } = await supabase
        .from('metabolites')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      if (metaboliteError) throw metaboliteError;

      // Group batches by batch_id
      const batchMap = new Map();
      batchData?.forEach(injection => {
        const batchId = injection.batch_id;
        if (!batchMap.has(batchId) || new Date(injection.created_at) > new Date(batchMap.get(batchId).created_at)) {
          batchMap.set(batchId, injection);
        }
      });

      // Combine all activities
      const allActivities = [
        ...(Array.from(batchMap.values()).map(batch => ({
          type: 'injection',
          icon: Package,
          title: `Injection Batch (${batch.batch_size} injections)`,
          subtitle: `${batch.methods?.name} on ${batch.columns?.name}`,
          time: batch.created_at,
          success: batch.run_successful,
          action: 'created'
        })) || []),
        ...(methodData?.map(method => ({
          type: 'method',
          icon: FlaskConical,
          title: `Method: ${method.name}`,
          subtitle: `${method.ionization_mode} mode`,
          time: method.created_at,
          success: true,
          action: 'created'
        })) || []),
        ...(maintenanceData?.map(maintenance => ({
          type: 'maintenance',
          icon: Wrench,
          title: `Maintenance: ${maintenance.title}`,
          subtitle: `${maintenance.maintenance_type} maintenance`,
          time: maintenance.created_at,
          success: true,
          action: 'logged'
        })) || []),
        ...(columnData?.map(column => ({
          type: 'column',
          icon: Package,
          title: `Column: ${column.name}`,
          subtitle: `${column.manufacturer} - ${column.part_number}`,
          time: column.created_at,
          success: true,
          action: 'created'
        })) || []),
        ...(metaboliteData?.map(metabolite => ({
          type: 'metabolite',
          icon: FlaskConical,
          title: `Metabolite: ${metabolite.name}`,
          subtitle: `MW: ${metabolite.molecular_weight || 'N/A'}`,
          time: metabolite.created_at,
          success: true,
          action: 'created'
        })) || []),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      return allActivities;
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ['activity-logs-count'],
    queryFn: async () => {
      const [
        { count: injectionsCount },
        { count: methodsCount },
        { count: maintenanceCount },
        { count: columnsCount },
        { count: metabolitesCount }
      ] = await Promise.all([
        supabase.from('injections').select('*', { count: 'exact', head: true }),
        supabase.from('methods').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_logs').select('*', { count: 'exact', head: true }),
        supabase.from('columns').select('*', { count: 'exact', head: true }),
        supabase.from('metabolites').select('*', { count: 'exact', head: true })
      ]);

      return (injectionsCount || 0) + (methodsCount || 0) + (maintenanceCount || 0) + (columnsCount || 0) + (metabolitesCount || 0);
    },
  });

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return Plus;
      case 'updated':
        return Edit;
      case 'deleted':
        return Trash2;
      default:
        return Activity;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Activity Logs</h2>
          <p className="text-gray-600 mt-2">Complete history of all lab activities</p>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Activity Logs</h2>
          <p className="text-gray-600 mt-2">Complete history of all lab activities</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading activity logs</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Activity Logs</h2>
        <p className="text-gray-600 mt-2">Complete history of all lab activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities?.map((activity, index) => {
              const Icon = activity.icon;
              const ActionIcon = getActionIcon(activity.action);
              return (
                <div key={`${activity.type}-${index}`} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.success === false ? 'bg-red-100 text-red-600' : 
                    activity.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                    activity.type === 'injection' ? 'bg-green-100 text-green-600' :
                    activity.type === 'column' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'metabolite' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-1">
                        <ActionIcon className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500 capitalize">{activity.action}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.subtitle}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    <div>{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</div>
                    <div className="text-xs text-gray-300">
                      {new Date(activity.time).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i + 1));
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
