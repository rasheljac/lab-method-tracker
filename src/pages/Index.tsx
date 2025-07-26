
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Methods } from '@/components/methods/Methods';
import { Columns } from '@/components/columns/Columns';
import { Metabolites } from '@/components/metabolites/Metabolites';
import { Injections } from '@/components/injections/Injections';
import { Maintenance } from '@/components/maintenance/Maintenance';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ActivityLogs } from '@/components/activity/ActivityLogs';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'methods':
        return <Methods />;
      case 'columns':
        return <Columns />;
      case 'metabolites':
        return <Metabolites />;
      case 'injections':
        return <Injections />;
      case 'maintenance':
        return <Maintenance />;
      case 'activity-logs':
        return <ActivityLogs />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
            <Header />
          </header>
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
