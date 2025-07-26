
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUserRole } from '@/hooks/useUserRole'
import { 
  BarChart3, 
  FlaskConical, 
  Columns, 
  Pill, 
  Activity, 
  Shield, 
  Wrench,
  ScrollText
} from 'lucide-react'

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { isAdmin } = useUserRole()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'methods', label: 'Methods', icon: FlaskConical },
    { id: 'columns', label: 'Columns', icon: Columns },
    { id: 'metabolites', label: 'Metabolites', icon: Pill },
    { id: 'injections', label: 'Injections', icon: Activity },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'activity-logs', label: 'Activity Logs', icon: ScrollText },
  ]

  // Add admin panel if user is admin
  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield })
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/1057252a-23f8-45ab-8d12-30e8d2ce821a.png" 
            alt="Kapelczak Logo" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Kapelczak</h1>
            <p className="text-xs text-gray-600">MS Visualizer</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
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
      <SidebarFooter>
        <div className="p-4 text-xs text-gray-500">
          © 2025 Kapelczak Lab Systems
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
