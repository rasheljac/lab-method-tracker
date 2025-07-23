
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FlaskConical, 
  Columns, 
  Pill, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'methods', label: 'Methods', icon: FlaskConical },
    { id: 'columns', label: 'Columns', icon: Columns },
    { id: 'metabolites', label: 'Metabolites', icon: Pill },
    { id: 'injections', label: 'Injections', icon: Activity },
  ];

  return (
    <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="space-y-2 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
