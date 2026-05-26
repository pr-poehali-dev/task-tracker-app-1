import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task, Notification, Page, TaskStatus } from '@/types';
import { api } from '@/api/client';

interface AppState {
  currentUser: User | null;
  token: string | null;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  currentPage: Page;
  loading: boolean;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;

  fetchTasks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchNotifications: () => Promise<void>;

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: TaskStatus) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  setPage: (page: Page) => void;
}

function mapTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string) || '',
    status: r.status as TaskStatus,
    priority: r.priority as Task['priority'],
    assigneeId: (r.assignee_id as string) || null,
    createdById: r.created_by_id as string,
    tags: (r.tags as string[]) || [],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function mapUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    password: '',
    role: r.role as User['role'],
    createdAt: r.created_at as string,
  };
}

function mapNotification(r: Record<string, unknown>): Notification {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    message: r.message as string,
    taskId: (r.task_id as string) || undefined,
    read: r.is_read as boolean,
    createdAt: r.created_at as string,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      users: [],
      tasks: [],
      notifications: [],
      currentPage: 'board',
      loading: false,

      init: async () => {
        const token = localStorage.getItem('tf_token');
        if (!token) return;
        const { status, data } = await api.me();
        if (status === 200 && (data as Record<string, unknown>).user) {
          const d = data as Record<string, unknown>;
          set({ currentUser: mapUser(d.user as Record<string, unknown>), token });
          await Promise.all([get().fetchTasks(), get().fetchUsers(), get().fetchNotifications()]);
        } else {
          localStorage.removeItem('tf_token');
        }
      },

      login: async (email, password) => {
        const { status, data } = await api.login(email, password);
        if (status === 200) {
          const d = data as Record<string, unknown>;
          localStorage.setItem('tf_token', d.token as string);
          set({ currentUser: mapUser(d.user as Record<string, unknown>), token: d.token as string });
          await Promise.all([get().fetchTasks(), get().fetchUsers(), get().fetchNotifications()]);
          return null;
        }
        return (data as Record<string, unknown>).error as string || 'Ошибка входа';
      },

      register: async (name, email, password) => {
        const { status, data } = await api.register(name, email, password);
        if (status === 201) {
          const d = data as Record<string, unknown>;
          localStorage.setItem('tf_token', d.token as string);
          set({ currentUser: mapUser(d.user as Record<string, unknown>), token: d.token as string });
          await Promise.all([get().fetchTasks(), get().fetchUsers(), get().fetchNotifications()]);
          return null;
        }
        return (data as Record<string, unknown>).error as string || 'Ошибка регистрации';
      },

      logout: async () => {
        await api.logout();
        localStorage.removeItem('tf_token');
        set({ currentUser: null, token: null, tasks: [], users: [], notifications: [], currentPage: 'board' });
      },

      fetchTasks: async () => {
        const { status, data } = await api.getTasks();
        if (status === 200) set({ tasks: (data as unknown[]).map(r => mapTask(r as Record<string, unknown>)) });
      },

      fetchUsers: async () => {
        const { status, data } = await api.getUsers();
        if (status === 200) set({ users: (data as unknown[]).map(r => mapUser(r as Record<string, unknown>)) });
      },

      fetchNotifications: async () => {
        const { status, data } = await api.getNotifications();
        if (status === 200) set({ notifications: (data as unknown[]).map(r => mapNotification(r as Record<string, unknown>)) });
      },

      createTask: async (taskData) => {
        const { status, data } = await api.createTask({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee_id: taskData.assigneeId || null,
          tags: taskData.tags,
        });
        if (status === 201) {
          const task = mapTask(data as Record<string, unknown>);
          set(s => ({ tasks: [task, ...s.tasks] }));
          await get().fetchNotifications();
        }
      },

      updateTask: async (id, updates) => {
        const body: Record<string, unknown> = {};
        if (updates.title !== undefined) body.title = updates.title;
        if (updates.description !== undefined) body.description = updates.description;
        if (updates.status !== undefined) body.status = updates.status;
        if (updates.priority !== undefined) body.priority = updates.priority;
        if (updates.assigneeId !== undefined) body.assignee_id = updates.assigneeId || null;
        if (updates.tags !== undefined) body.tags = updates.tags;

        const { status, data } = await api.updateTask(id, body);
        if (status === 200) {
          const task = mapTask(data as Record<string, unknown>);
          set(s => ({ tasks: s.tasks.map(t => t.id === id ? task : t) }));
          await get().fetchNotifications();
        }
      },

      deleteTask: async (id) => {
        const { status } = await api.deleteTask(id);
        if (status === 200) {
          set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
        }
      },

      moveTask: async (id, status) => {
        await get().updateTask(id, { status });
      },

      markNotificationRead: async (id) => {
        await api.markRead(id);
        set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
      },

      markAllNotificationsRead: async () => {
        await api.markAllRead();
        const uid = get().currentUser?.id;
        set(s => ({ notifications: s.notifications.map(n => n.userId === uid ? { ...n, read: true } : n) }));
      },

      setPage: (page) => set({ currentPage: page }),
    }),
    { name: 'taskflow-store', partialize: (s) => ({ currentPage: s.currentPage }) }
  )
);
