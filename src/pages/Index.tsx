
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Methods } from '@/components/methods/Methods';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
        return <div className="p-8 text-center text-gray-500">Columns management coming soon...</div>;
      case 'metabolites':
        return <div className="p-8 text-center text-gray-500">Metabolites management coming soon...</div>;
      case 'injections':
        return <div className="p-8 text-center text-gray-500">Injections tracking coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
