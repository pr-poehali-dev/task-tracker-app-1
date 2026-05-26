import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import AuthPage from '@/components/AuthPage';
import Sidebar from '@/components/Sidebar';
import BoardPage from '@/components/BoardPage';
import TasksPage from '@/components/TasksPage';
import TeamPage from '@/components/TeamPage';
import ProfilePage from '@/components/ProfilePage';
import NotificationsPage from '@/components/NotificationsPage';
import Icon from '@/components/ui/icon';

export default function App() {
  const { currentUser, currentPage, init } = useAppStore();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    init().finally(() => setBooting(false));
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center pulse-glow" style={{ background: 'var(--neon-green)' }}>
            <Icon name="Zap" size={22} className="text-black" />
          </div>
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'board': return <BoardPage />;
      case 'tasks': return <TasksPage />;
      case 'team': return <TeamPage />;
      case 'profile': return <ProfilePage />;
      case 'notifications': return <NotificationsPage />;
      default: return <BoardPage />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen" style={{ background: 'hsl(var(--background))' }}>
        <div className="animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}