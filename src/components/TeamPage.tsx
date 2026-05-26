import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';
import Icon from '@/components/ui/icon';

const avatarColors = ['#00ff87', '#a855f7', '#ff6b35', '#3b82f6', '#ec4899'];

export default function TeamPage() {
  const { users, tasks, currentUser } = useAppStore();
  const [showInvite, setShowInvite] = useState(false);

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const getUserStats = (userId: string) => ({
    total: tasks.filter(t => t.assigneeId === userId).length,
    done: tasks.filter(t => t.assigneeId === userId && t.status === 'done').length,
    inprogress: tasks.filter(t => t.assigneeId === userId && t.status === 'inprogress').length,
    todo: tasks.filter(t => t.assigneeId === userId && t.status === 'todo').length,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl tracking-widest text-white">КОМАНДА</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} участников</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105"
          style={{ background: 'var(--neon-green)', boxShadow: '0 0 20px rgba(0,255,135,0.3)' }}
        >
          <Icon name="UserPlus" size={16} />
          Пригласить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user, i) => {
          const stats = getUserStats(user.id);
          const color = avatarColors[i % avatarColors.length];
          const isMe = user.id === currentUser?.id;
          const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

          return (
            <div
              key={user.id}
              className="rounded-2xl p-5 transition-all card-hover relative"
              style={{
                background: 'hsl(var(--card))',
                border: `1px solid ${isMe ? 'rgba(0,255,135,0.3)' : 'hsl(var(--border))'}`,
                boxShadow: isMe ? '0 0 20px rgba(0,255,135,0.08)' : 'none'
              }}
            >
              {isMe && (
                <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,255,135,0.15)', color: 'var(--neon-green)' }}>
                  Это ты
                </div>
              )}

              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-black flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 15px ${color}50` }}
                >
                  {getInitials(user.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">{user.name}</h3>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium"
                    style={user.role === 'admin'
                      ? { background: 'rgba(168,85,247,0.15)', color: 'var(--neon-purple)' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}
                  >
                    {user.role === 'admin' ? '⚡ Администратор' : 'Участник'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Прогресс задач</span>
                  <span style={{ color: 'var(--neon-green)' }}>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--neon-green), var(--neon-purple))' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'To Do', count: stats.todo, color: '#3b82f6' },
                  { label: 'В работе', count: stats.inprogress, color: '#f59e0b' },
                  { label: 'Готово', count: stats.done, color: '#00ff87' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: `${s.color}10` }}>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 animate-scale-in"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-display text-lg tracking-wide text-white mb-2">ПРИГЛАСИТЬ УЧАСТНИКА</h2>
            <p className="text-muted-foreground text-sm mb-6">Поделись ссылкой или попроси участника зарегистрироваться на платформе.</p>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)' }}>
              <p className="text-xs text-muted-foreground mb-1">Ссылка для регистрации</p>
              <p className="text-sm font-mono" style={{ color: 'var(--neon-green)' }}>{window.location.origin}</p>
            </div>
            <button
              onClick={() => setShowInvite(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black"
              style={{ background: 'var(--neon-green)' }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
