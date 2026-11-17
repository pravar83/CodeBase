export interface User {
  id: number;
  email: string;
  userName: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface CreateUser {
  email: string;
  userName: string;
  firstName?: string | null;
  lastName?: string | null;
  roles?: string[];
  password?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  user: User;
}

export interface Dashboard {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersLast30Days: number;
  loginsLast7Days: number;
  usersByRole: { role: string; count: number }[];
  loginsByDay: { date: string; count: number }[];
  recentActivity: {
    id: number;
    action: string;
    userName: string | null;
    entityName: string | null;
    entityId: string | null;
    createdAt: string;
  }[];
}

export interface UpdateUser {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  roles?: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}
