import func2url from '../../backend/func2url.json';

const URLS = func2url as Record<string, string>;

function getToken(): string | null {
  return localStorage.getItem('tf_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'X-Auth-Token': token } : {};
}

async function req(fn: string, method: string, body?: unknown, headers?: Record<string, string>) {
  const res = await fetch(URLS[fn], {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (typeof data === 'string') {
    try { data = JSON.parse(data as string); } catch { /* keep as string */ }
  }
  return { status: res.status, data };
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    req('auth', 'POST', { action: 'register', name, email, password }),
  login: (email: string, password: string) =>
    req('auth', 'POST', { action: 'login', email, password }),
  me: () => req('auth', 'GET'),
  logout: () => req('auth', 'DELETE'),

  // Users
  getUsers: () => req('users', 'GET'),

  // Tasks
  getTasks: () => req('tasks', 'GET'),
  createTask: (body: unknown) => req('tasks', 'POST', body),
  updateTask: (id: string, body: unknown) => req('tasks', 'PUT', body, { 'X-Task-Id': id }),
  deleteTask: (id: string) => req('tasks', 'DELETE', { id }),

  // Notifications
  getNotifications: () => req('notifications', 'GET'),
  markRead: (id: string) => req('notifications', 'PUT', { id }),
  markAllRead: () => req('notifications', 'PUT', { all: true }),
};
