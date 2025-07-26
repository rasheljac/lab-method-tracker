
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

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

interface GuardColumnTimelineProps {
  guardColumns: GuardColumn[];
}

export const GuardColumnTimeline = ({ guardColumns }: GuardColumnTimelineProps) => {
  if (!guardColumns || guardColumns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Guard Column History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No guard column changes recorded yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Guard Column History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {guardColumns.map((guardColumn, index) => {
            const isActive = !guardColumn.removed_date;
            const injectionCount = guardColumn.removal_injection_count 
              ? guardColumn.removal_injection_count - guardColumn.installation_injection_count
              : null;

            return (
              <div key={guardColumn.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {index < guardColumns.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {guardColumn.part_number}
                        </h4>
                        {isActive && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(guardColumn.installed_date).toLocaleDateString()}
                        {guardColumn.removed_date && (
                          <>
                            <ArrowRight className="inline h-3 w-3 mx-2" />
                            {new Date(guardColumn.removed_date).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {guardColumn.batch_number && (
                        <div>
                          <span className="text-gray-600">Batch:</span>
                          <div className="font-medium">{guardColumn.batch_number}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Install Injection:</span>
                        <div className="font-medium">{guardColumn.installation_injection_count}</div>
                      </div>
                      {guardColumn.removal_injection_count && (
                        <div>
                          <span className="text-gray-600">Remove Injection:</span>
                          <div className="font-medium">{guardColumn.removal_injection_count}</div>
                        </div>
                      )}
                      {injectionCount && (
                        <div>
                          <span className="text-gray-600">Total Injections:</span>
                          <div className="font-medium">{injectionCount}</div>
                        </div>
                      )}
                    </div>
                    
                    {guardColumn.notes && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <div className="text-gray-800 mt-1">{guardColumn.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
