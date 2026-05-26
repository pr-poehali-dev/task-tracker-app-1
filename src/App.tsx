import { useAppStore } from '@/store/useAppStore';
import AuthPage from '@/components/AuthPage';
import Sidebar from '@/components/Sidebar';
import BoardPage from '@/components/BoardPage';
import TasksPage from '@/components/TasksPage';
import TeamPage from '@/components/TeamPage';
import ProfilePage from '@/components/ProfilePage';
import NotificationsPage from '@/components/NotificationsPage';

export default function App() {
  const { currentUser, currentPage } = useAppStore();

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
