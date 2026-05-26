export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}

export type Page = 'board' | 'tasks' | 'team' | 'profile' | 'notifications';
