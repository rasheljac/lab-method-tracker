
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Columns3, 
  Atom, 
  Syringe, 
  LogOut,
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'methods', label: 'Methods', icon: FlaskConical },
    { id: 'columns', label: 'Columns', icon: Columns3 },
    { id: 'metabolites', label: 'Metabolites', icon: Atom },
    { id: 'injections', label: 'Injections', icon: Syringe },
  ];

  // Add admin panel to navigation if user is admin
  if (isAdmin) {
    navigationItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
      </div>
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>
    </aside>
  );
};
