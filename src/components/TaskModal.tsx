import { useState } from 'react';
import { Task, User, TaskStatus, TaskPriority } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';

interface Props {
  task?: Task;
  users: User[];
  defaultStatus?: TaskStatus;
  onClose: () => void;
}

export default function TaskModal({ task, users, defaultStatus = 'todo', onClose }: Props) {
  const { createTask, updateTask, currentUser } = useAppStore();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId ?? '');
  const [tagsInput, setTagsInput] = useState(task?.tags.join(', ') ?? '');

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (task) {
      updateTask(task.id, { title, description, status, priority, assigneeId: assigneeId || null, tags });
    } else {
      createTask({
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId || null,
        createdById: currentUser!.id,
        tags,
      });
    }
    onClose();
  };

  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo', label: 'To Do', color: '#3b82f6' },
    { value: 'inprogress', label: 'In Progress', color: '#f59e0b' },
    { value: 'done', label: 'Done', color: '#00ff87' },
  ];

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'high', label: 'Высокий', color: '#ff6b35' },
    { value: 'medium', label: 'Средний', color: '#f59e0b' },
    { value: 'low', label: 'Низкий', color: '#3b82f6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 animate-scale-in"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,135,0.06)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg tracking-wide text-white">
            {task ? 'РЕДАКТИРОВАТЬ ЗАДАЧУ' : 'НОВАЯ ЗАДАЧА'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Название *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
              onBlur={e => e.target.style.borderColor = 'hsl(var(--border))'}
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Подробнее о задаче..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
              onBlur={e => e.target.style.borderColor = 'hsl(var(--border))'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Статус</label>
              <div className="flex flex-col gap-1">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: status === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${status === opt.value ? opt.color : 'transparent'}`,
                      color: status === opt.value ? opt.color : 'hsl(var(--muted-foreground))'
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Приоритет</label>
              <div className="flex flex-col gap-1">
                {priorityOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: priority === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${priority === opt.value ? opt.color : 'transparent'}`,
                      color: priority === opt.value ? opt.color : 'hsl(var(--muted-foreground))'
                    }}
                  >
                    <Icon name={opt.value === 'high' ? 'ArrowUp' : opt.value === 'medium' ? 'Minus' : 'ArrowDown'} size={12} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Исполнитель</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            >
              <option value="" style={{ background: 'hsl(220,18%,10%)' }}>Не назначено</option>
              {users.map(u => (
                <option key={u.id} value={u.id} style={{ background: 'hsl(220,18%,10%)' }}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Теги (через запятую)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="дизайн, фронтенд, срочно"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
              onBlur={e => e.target.style.borderColor = 'hsl(var(--border))'}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--foreground))' }}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--neon-green)', boxShadow: title.trim() ? '0 0 15px rgba(0,255,135,0.3)' : 'none' }}
          >
            {task ? 'Сохранить' : 'Создать задачу'}
          </button>
        </div>
      </div>
    </div>
  );
}
