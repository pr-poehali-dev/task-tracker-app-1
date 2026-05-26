import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';

export default function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead, tasks } = useAppStore();

  const myNotifs = notifications.filter(n => n.userId === currentUser?.id);
  const unread = myNotifs.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl tracking-widest text-white">УВЕДОМЛЕНИЯ</h1>
          {unread > 0 && (
            <p className="text-sm mt-1" style={{ color: 'var(--neon-green)' }}>{unread} непрочитанных</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.25)', color: 'var(--neon-green)' }}
          >
            <Icon name="CheckCheck" size={14} />
            Прочитать все
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsl(var(--border))' }}>
            <Icon name="Bell" size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Уведомлений пока нет</p>
          <p className="text-xs text-muted-foreground mt-1">Здесь будут появляться назначения и изменения задач</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifs.map(n => {
            const task = n.taskId ? tasks.find(t => t.id === n.taskId) : null;
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className="rounded-xl p-4 cursor-pointer transition-all hover:opacity-90"
                style={{
                  background: n.read ? 'hsl(var(--card))' : 'rgba(0,255,135,0.05)',
                  border: `1px solid ${n.read ? 'hsl(var(--border))' : 'rgba(0,255,135,0.2)'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,135,0.12)' }}
                  >
                    <Icon name="Bell" size={14} style={{ color: n.read ? 'hsl(var(--muted-foreground))' : 'var(--neon-green)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {n.message}
                    </p>
                    {task && (
                      <p className="text-xs mt-1" style={{ color: 'var(--neon-purple)' }}>
                        → {task.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {new Date(n.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--neon-green)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
