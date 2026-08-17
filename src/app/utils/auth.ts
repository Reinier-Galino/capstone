export type UserRole = 'admin' | 'customer' | 'designer' | 'supervisor' | 'staff';

export interface AppUser {
  username: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  specialization?: string;
}

export const hashPassword = (password: string) => {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `mofil-${Math.abs(hash)}`;
};

export const getStoredUsers = (): AppUser[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const saveStoredUsers = (users: AppUser[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCurrentUser = (): { username: string; email?: string; role: UserRole } | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: { username: string; email?: string; role: UserRole }) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('userRole', user.role);
};

export const getUserRole = (): UserRole | null => {
  return (localStorage.getItem('userRole') as UserRole) || null;
};

export const getAuditLogs = (): string[] => {
  return JSON.parse(localStorage.getItem('auditLogs') || '[]');
};

export const addAuditLog = (message: string) => {
  const logs = getAuditLogs();
  logs.unshift(`${new Date().toLocaleString()}: ${message}`);
  localStorage.setItem('auditLogs', JSON.stringify(logs.slice(0, 50)));
};

// Ensure default accounts exist so staff can log in without seeding sample data
export const ensureDefaultAccounts = () => {
  const users = getStoredUsers();
  let changed = false;
  if (!users.find(u => u.username === 'staff')) {
    users.push({ username: 'staff', email: 'staff@mofil.local', passwordHash: hashPassword('staff123'), role: 'staff' } as any);
    changed = true;
  }
  if (!users.find(u => u.username === 'supervisor')) {
    users.push({ username: 'supervisor', email: 'supervisor@mofil.local', passwordHash: hashPassword('super123'), role: 'supervisor' } as any);
    changed = true;
  }
  if (changed) saveStoredUsers(users);
};
