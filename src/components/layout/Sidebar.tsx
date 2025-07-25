import { useUserRole } from '@/hooks/useUserRole';
import { BarChart3, FlaskConical, Columns, Pill, Activity, Shield, Wrench } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { isAdmin } = useUserRole();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'methods', label: 'Methods', icon: FlaskConical },
    { id: 'columns', label: 'Columns', icon: Columns },
    { id: 'metabolites', label: 'Metabolites', icon: Pill },
    { id: 'injections', label: 'Injections', icon: Activity },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  // Add admin panel if user is admin
  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">LCMS Tracker</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
              activeTab === item.id ? 'border-r-2 border-blue-500 bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
