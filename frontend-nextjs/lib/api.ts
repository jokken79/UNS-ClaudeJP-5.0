import axios from 'axios';

import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return useAuthStore.getState().token;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only log meaningful errors (not network errors during initial load)
    if (error.response) {
      console.error('Response error:', error.response.status);
    } else if (error.request) {
      console.error('Network error:', error.message);
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  logout: () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getCurrentUser: async (token?: string) => {
    const config = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
    const response = await api.get('/auth/me', config);
    return response.data;
  }
};

// Employee services
export const employeeService = {
  getEmployees: async (params?: any) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getEmployee: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: any) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id: string, data: any) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

// Candidate services
export const candidateService = {
  getCandidates: async (params?: any) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  getCandidate: async (id: string) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  createCandidate: async (data: any) => {
    const response = await api.post('/candidates', data);
    return response.data;
  },

  updateCandidate: async (id: string, data: any) => {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data;
  },

  deleteCandidate: async (id: string) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  approveCandidate: async (id: string) => {
    const response = await api.post(`/candidates/${id}/approve`);
    return response.data;
  },

  rejectCandidate: async (id: string, reason: string) => {
    const response = await api.post(`/candidates/${id}/reject`, { reason });
    return response.data;
  }
};

// Factory services
export const factoryService = {
  getFactories: async (params?: any) => {
    const response = await api.get('/factories', { params });
    return response.data;
  },

  getFactory: async (id: string) => {
    const response = await api.get(`/factories/${id}`);
    return response.data;
  },

  createFactory: async (data: any) => {
    const response = await api.post('/factories', data);
    return response.data;
  },

  updateFactory: async (id: string, data: any) => {
    const response = await api.put(`/factories/${id}`, data);
    return response.data;
  },

  deleteFactory: async (id: string) => {
    const response = await api.delete(`/factories/${id}`);
    return response.data;
  }
};

// Timer Card services
export const timerCardService = {
  getTimerCards: async (params?: any) => {
    const response = await api.get('/timer-cards', { params });
    return response.data;
  },

  getTimerCard: async (id: string) => {
    const response = await api.get(`/timer-cards/${id}`);
    return response.data;
  },

  createTimerCard: async (data: any) => {
    const response = await api.post('/timer-cards', data);
    return response.data;
  },

  updateTimerCard: async (id: string, data: any) => {
    const response = await api.put(`/timer-cards/${id}`, data);
    return response.data;
  },

  deleteTimerCard: async (id: string) => {
    const response = await api.delete(`/timer-cards/${id}`);
    return response.data;
  }
};

// Salary services
export const salaryService = {
  getSalaries: async (params?: any) => {
    const response = await api.get('/salary', { params });
    return response.data;
  },

  getSalary: async (id: string) => {
    const response = await api.get(`/salary/${id}`);
    return response.data;
  },

  calculateSalary: async (data: any) => {
    const response = await api.post('/salary/calculate', data);
    return response.data;
  }
};

// Request services
export const requestService = {
  getRequests: async (params?: any) => {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  getRequest: async (id: string) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  createRequest: async (data: any) => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  approveRequest: async (id: string) => {
    const response = await api.post(`/requests/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: string, reason: string) => {
    const response = await api.post(`/requests/${id}/reject`, { reason });
    return response.data;
  }
};

// Dashboard services
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  }
};

export default api;
