
import { useUserRole } from '@/hooks/useUserRole';
import { BarChart3, FlaskConical, Columns, Pill, Activity, Shield, Wrench } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { isAdmin } = useUserRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FlaskConical className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sidebar-foreground">LCMS Tracker</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
