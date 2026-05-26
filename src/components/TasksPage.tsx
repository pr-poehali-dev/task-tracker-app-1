import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TaskStatus, TaskPriority } from '@/types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import Icon from '@/components/ui/icon';

const statusLabels: Record<TaskStatus, string> = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const priorityLabels: Record<TaskPriority, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };

export default function TasksPage() {
  const { tasks, users } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchAssignee = filterAssignee === 'all' || t.assigneeId === filterAssignee;
    return matchSearch && matchStatus && matchPriority && matchAssignee;
  });

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterAssignee('all');
  };

  const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl tracking-widest text-white">ВСЕ ЗАДАЧИ</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} из {tasks.length} задач</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105"
          style={{ background: 'var(--neon-green)', boxShadow: '0 0 20px rgba(0,255,135,0.3)' }}
        >
          <Icon name="Plus" size={16} />
          Новая задача
        </button>
      </div>

      <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию, описанию, тегам..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
            onBlur={e => e.target.style.borderColor = 'hsl(var(--border))'}
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')}
          className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        >
          <option value="all" style={{ background: 'hsl(220,18%,10%)' }}>Все статусы</option>
          {(Object.keys(statusLabels) as TaskStatus[]).map(s => (
            <option key={s} value={s} style={{ background: 'hsl(220,18%,10%)' }}>{statusLabels[s]}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value as TaskPriority | 'all')}
          className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        >
          <option value="all" style={{ background: 'hsl(220,18%,10%)' }}>Все приоритеты</option>
          {(Object.keys(priorityLabels) as TaskPriority[]).map(p => (
            <option key={p} value={p} style={{ background: 'hsl(220,18%,10%)' }}>{priorityLabels[p]}</option>
          ))}
        </select>

        <select
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        >
          <option value="all" style={{ background: 'hsl(220,18%,10%)' }}>Все исполнители</option>
          {users.map(u => (
            <option key={u.id} value={u.id} style={{ background: 'hsl(220,18%,10%)' }}>{u.name}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs transition-all hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
          >
            <Icon name="X" size={12} />
            Сбросить
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsl(var(--border))' }}>
            <Icon name="SearchX" size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Задач не найдено</p>
          <p className="text-xs text-muted-foreground mt-1">Попробуй изменить параметры поиска</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} users={users} />
          ))}
        </div>
      )}

      {showModal && <TaskModal users={users} onClose={() => setShowModal(false)} />}
    </div>
  );
}
