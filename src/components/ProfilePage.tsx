import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';

const avatarColors = ['#00ff87', '#a855f7', '#ff6b35', '#3b82f6', '#ec4899'];

export default function ProfilePage() {
  const { currentUser, users, tasks, logout } = useAppStore();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const idx = users.findIndex(u => u.id === currentUser.id);
  const color = avatarColors[idx % avatarColors.length];

  const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const stats = [
    { label: 'Всего задач', value: myTasks.length, color: '#3b82f6' },
    { label: 'В работе', value: myTasks.filter(t => t.status === 'inprogress').length, color: '#f59e0b' },
    { label: 'Выполнено', value: myTasks.filter(t => t.status === 'done').length, color: '#00ff87' },
    { label: 'Создано мной', value: tasks.filter(t => t.createdById === currentUser.id).length, color: '#a855f7' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl tracking-widest text-white mb-8">ПРОФИЛЬ</h1>

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-6 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-black flex-shrink-0"
            style={{ background: color, boxShadow: `0 0 25px ${color}50` }}
          >
            {getInitials(currentUser.name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{currentUser.name}</h2>
            <p className="text-muted-foreground">{currentUser.email}</p>
            <span
              className="text-xs px-3 py-1 rounded-full mt-2 inline-block font-medium"
              style={currentUser.role === 'admin'
                ? { background: 'rgba(168,85,247,0.15)', color: 'var(--neon-purple)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}
            >
              {currentUser.role === 'admin' ? '⚡ Администратор' : 'Участник'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Имя</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
              onBlur={e => e.target.style.borderColor = 'hsl(var(--border))'}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={currentUser.email}
              readOnly
              className="w-full px-4 py-3 rounded-xl text-sm cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Роль</label>
            <input
              type="text"
              value={currentUser.role === 'admin' ? 'Администратор' : 'Участник'}
              readOnly
              className="w-full px-4 py-3 rounded-xl text-sm cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
            style={{
              background: saved ? '#3b82f6' : 'var(--neon-green)',
              boxShadow: saved ? '0 0 15px rgba(59,130,246,0.3)' : '0 0 15px rgba(0,255,135,0.3)'
            }}
          >
            {saved ? '✓ Сохранено' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 className="font-semibold text-white mb-1">Выйти из аккаунта</h3>
        <p className="text-muted-foreground text-sm mb-4">Ты будешь перенаправлен на страницу входа.</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
        >
          <Icon name="LogOut" size={15} />
          Выйти
        </button>
      </div>
    </div>
  );
}
