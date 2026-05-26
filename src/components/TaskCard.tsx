import { useState } from 'react';
import { Task, User } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';
import TaskModal from './TaskModal';

interface Props {
  task: Task;
  users: User[];
}

const priorityConfig = {
  high: { label: 'Высокий', color: '#ff6b35', bg: 'rgba(255,107,53,0.12)' },
  medium: { label: 'Средний', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low: { label: 'Низкий', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
};

export default function TaskCard({ task, users }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteTask, currentUser } = useAppStore();
  const assignee = users.find(u => u.id === task.assigneeId);
  const priority = priorityConfig[task.priority];

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['#00ff87', '#a855f7', '#ff6b35', '#3b82f6', '#ec4899'];
  const colorIdx = task.assigneeId ? task.assigneeId.charCodeAt(task.assigneeId.length - 1) % avatarColors.length : 0;

  return (
    <>
      <div
        className="rounded-xl p-4 cursor-pointer card-hover group relative"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        onClick={() => setShowModal(true)}
      >
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowModal(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:text-white"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}
          >
            <Icon name="Pencil" size={12} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:text-red-400"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}
          >
            <Icon name="Trash2" size={12} />
          </button>
        </div>

        <div className="flex items-start gap-2 mb-3 pr-16">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: priority.bg, color: priority.color }}
          >
            {priority.label}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug">{task.title}</h3>
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: 'var(--neon-purple)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          {assignee ? (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{ background: avatarColors[colorIdx], fontSize: '9px' }}
              >
                {getInitials(assignee.name)}
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">{assignee.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Не назначено</span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {showDeleteConfirm && (
          <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 z-10"
            style={{ background: 'rgba(10,12,16,0.95)', border: '1px solid rgba(239,68,68,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <Icon name="Trash2" size={20} className="text-red-400" />
            <p className="text-sm font-medium text-center px-4">Удалить задачу?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'hsl(var(--foreground))' }}
              >
                Отмена
              </button>
              <button
                onClick={() => { deleteTask(task.id); setShowDeleteConfirm(false); }}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ background: 'rgba(239,68,68,0.8)' }}
              >
                Удалить
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={task} users={users} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
