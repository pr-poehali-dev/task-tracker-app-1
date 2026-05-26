import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task, Notification, Page, TaskStatus } from '@/types';

interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  currentPage: Page;

  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;

  addNotification: (userId: string, message: string, taskId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  setPage: (page: Page) => void;
}

const SEED_USERS: User[] = [
  { id: 'u1', name: 'Алекс Космонавт', email: 'alex@task.ru', password: '123456', role: 'admin', createdAt: new Date().toISOString() },
  { id: 'u2', name: 'Мария Звёздная', email: 'maria@task.ru', password: '123456', role: 'member', createdAt: new Date().toISOString() },
  { id: 'u3', name: 'Иван Орбитов', email: 'ivan@task.ru', password: '123456', role: 'member', createdAt: new Date().toISOString() },
];

const SEED_TASKS: Task[] = [
  { id: 't1', title: 'Разработать лендинг', description: 'Создать главную страницу с анимациями и адаптивной вёрсткой', status: 'todo', priority: 'high', assigneeId: 'u2', createdById: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['дизайн', 'фронтенд'] },
  { id: 't2', title: 'Настроить CI/CD пайплайн', description: 'Автоматизировать деплой через GitHub Actions', status: 'inprogress', priority: 'medium', assigneeId: 'u1', createdById: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['devops'] },
  { id: 't3', title: 'Написать документацию API', description: 'Оформить все эндпоинты в Swagger', status: 'todo', priority: 'low', assigneeId: 'u3', createdById: 'u2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['документация'] },
  { id: 't4', title: 'Провести код-ревью', description: 'Проверить Pull Request #42 по новому модулю авторизации', status: 'inprogress', priority: 'high', assigneeId: 'u2', createdById: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['ревью'] },
  { id: 't5', title: 'Оптимизировать базу данных', description: 'Добавить индексы для ускорения запросов', status: 'done', priority: 'medium', assigneeId: 'u1', createdById: 'u3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['бэкенд', 'БД'] },
  { id: 't6', title: 'Тестирование мобильной версии', description: 'Проверить все страницы на iOS и Android', status: 'done', priority: 'low', assigneeId: 'u3', createdById: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['QA', 'мобайл'] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: SEED_USERS,
      tasks: SEED_TASKS,
      notifications: [],
      currentPage: 'board',

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      register: (name, email, password) => {
        if (get().users.find(u => u.email === email)) return false;
        const newUser: User = {
          id: `u${Date.now()}`,
          name,
          email,
          password,
          role: 'member',
          createdAt: new Date().toISOString(),
        };
        set(s => ({ users: [...s.users, newUser], currentUser: newUser }));
        return true;
      },

      logout: () => set({ currentUser: null, currentPage: 'board' }),

      createTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: `t${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(s => ({ tasks: [...s.tasks, task] }));
        if (task.assigneeId && task.assigneeId !== task.createdById) {
          get().addNotification(task.assigneeId, `Тебе назначена задача: «${task.title}»`, task.id);
        }
      },

      updateTask: (id, updates) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          )
        }));
        const task = get().tasks.find(t => t.id === id);
        if (task && updates.assigneeId && updates.assigneeId !== get().currentUser?.id) {
          get().addNotification(updates.assigneeId, `Тебе переназначена задача: «${task.title}»`, id);
        }
        if (task && updates.status && task.assigneeId && task.assigneeId !== get().currentUser?.id) {
          const statusLabel = updates.status === 'done' ? 'выполнена' : updates.status === 'inprogress' ? 'в работе' : 'в очереди';
          get().addNotification(task.assigneeId, `Статус задачи «${task.title}» изменён: ${statusLabel}`, id);
        }
      },

      deleteTask: (id) => {
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
      },

      moveTask: (id, status) => {
        get().updateTask(id, { status });
      },

      addNotification: (userId, message, taskId) => {
        const n: Notification = {
          id: `n${Date.now()}`,
          userId,
          message,
          taskId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ notifications: [n, ...s.notifications] }));
      },

      markNotificationRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
      },

      markAllNotificationsRead: () => {
        const uid = get().currentUser?.id;
        set(s => ({
          notifications: s.notifications.map(n => n.userId === uid ? { ...n, read: true } : n)
        }));
      },

      setPage: (page) => set({ currentPage: page }),
    }),
    { name: 'taskflow-store' }
  )
);
