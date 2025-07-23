
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Method Tracker</h1>
          <p className="text-sm text-gray-600">LCMS Method & Column Management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
