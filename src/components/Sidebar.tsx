import { useAppStore } from '@/store/useAppStore';
import { Page } from '@/types';
import Icon from '@/components/ui/icon';

const NAV: { page: Page; label: string; icon: string }[] = [
  { page: 'board', label: 'Доска', icon: 'LayoutDashboard' },
  { page: 'tasks', label: 'Задачи', icon: 'ListTodo' },
  { page: 'team', label: 'Команда', icon: 'Users' },
  { page: 'notifications', label: 'Уведомления', icon: 'Bell' },
  { page: 'profile', label: 'Профиль', icon: 'User' },
];

const avatarColors = ['#00ff87', '#a855f7', '#ff6b35', '#3b82f6', '#ec4899'];

export default function Sidebar() {
  const { currentPage, setPage, currentUser, users, notifications, tasks } = useAppStore();

  if (!currentUser) return null;

  const idx = users.findIndex(u => u.id === currentUser.id);
  const color = avatarColors[idx % avatarColors.length];
  const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inprogressCount = tasks.filter(t => t.status === 'inprogress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0" style={{ background: 'hsl(220,20%,7%)', borderRight: '1px solid hsl(var(--border))' }}>
      <div className="px-5 py-5" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--neon-green)', boxShadow: '0 0 12px rgba(0,255,135,0.4)' }}>
            <Icon name="Zap" size={16} className="text-black" />
          </div>
          <span className="font-display text-lg tracking-widest text-white">TASKFLOW</span>
        </div>
      </div>

      <div className="px-3 py-3" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">Статистика</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'ToDo', count: todoCount, color: '#3b82f6' },
            { label: 'Prog', count: inprogressCount, color: '#f59e0b' },
            { label: 'Done', count: doneCount, color: '#00ff87' },
          ].map(s => (
            <div key={s.label} className="text-center py-1.5 rounded-lg" style={{ background: `${s.color}12` }}>
              <div className="text-base font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1">
        {NAV.map(item => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative"
              style={{
                background: isActive ? 'rgba(0,255,135,0.1)' : 'transparent',
                color: isActive ? 'var(--neon-green)' : 'hsl(var(--muted-foreground))',
                border: isActive ? '1px solid rgba(0,255,135,0.2)' : '1px solid transparent',
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full" style={{ background: 'var(--neon-green)' }} />
              )}
              <Icon name={item.icon} size={16} />
              <span className="font-medium">{item.label}</span>
              {item.page === 'notifications' && unreadCount > 0 && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold text-black"
                  style={{ background: 'var(--neon-green)', minWidth: '18px', textAlign: 'center' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <button
          onClick={() => setPage('profile')}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsl(var(--border))' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
            style={{ background: color }}
          >
            {getInitials(currentUser.name)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{currentUser.name.split(' ')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
          </div>
          <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}
