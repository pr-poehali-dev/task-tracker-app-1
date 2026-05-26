import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import Icon from '@/components/ui/icon';

const COLUMNS: { status: TaskStatus; label: string; color: string; glow: string }[] = [
  { status: 'todo', label: 'To Do', color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
  { status: 'inprogress', label: 'In Progress', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  { status: 'done', label: 'Done', color: '#00ff87', glow: 'rgba(0,255,135,0.2)' },
];

export default function BoardPage() {
  const { tasks, users, moveTask } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const openCreate = (status: TaskStatus) => {
    setDefaultStatus(status);
    setShowModal(true);
  };

  const onDragStart = (taskId: string) => setDragTaskId(taskId);
  const onDragEnd = () => { setDragTaskId(null); setDragOverCol(null); };
  const onDrop = (status: TaskStatus) => {
    if (dragTaskId) moveTask(dragTaskId, status);
    setDragTaskId(null);
    setDragOverCol(null);
  };

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl tracking-widest text-white">ДОСКА ЗАДАЧ</h1>
          <p className="text-muted-foreground text-sm mt-1">{tasks.length} задач в системе</p>
        </div>
        <button
          onClick={() => openCreate('todo')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105"
          style={{ background: 'var(--neon-green)', boxShadow: '0 0 20px rgba(0,255,135,0.3)' }}
        >
          <Icon name="Plus" size={16} />
          Новая задача
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5 h-[calc(100vh-200px)]">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          const isDragOver = dragOverCol === col.status;
          return (
            <div
              key={col.status}
              className="flex flex-col rounded-2xl overflow-hidden transition-all"
              style={{
                background: isDragOver ? `${col.color}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isDragOver ? col.color : 'hsl(var(--border))'}`,
                boxShadow: isDragOver ? `0 0 20px ${col.glow}` : 'none',
              }}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.status); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => onDrop(col.status)}
            >
              <div className="px-4 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color, boxShadow: `0 0 8px ${col.color}` }} />
                  <span className="font-display text-sm tracking-widest" style={{ color: col.color }}>{col.label}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${col.color}18`, color: col.color }}
                  >
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreate(col.status)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: `${col.color}18`, color: col.color }}
                >
                  <Icon name="Plus" size={13} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    onDragEnd={onDragEnd}
                    className={`transition-all ${dragTaskId === task.id ? 'opacity-40 scale-95' : ''}`}
                  >
                    <TaskCard task={task} users={users} />
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div
                    className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:opacity-80"
                    style={{ borderColor: `${col.color}30`, color: `${col.color}50` }}
                    onClick={() => openCreate(col.status)}
                  >
                    <Icon name="Plus" size={20} />
                    <span className="text-xs mt-1">Добавить задачу</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <TaskModal
          users={users}
          defaultStatus={defaultStatus}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
