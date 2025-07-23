
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { ColumnLifetimeChart } from './ColumnLifetimeChart';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">Overview of your lab methods and equipment</p>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <ColumnLifetimeChart />
      </div>
    </div>
  );
};
