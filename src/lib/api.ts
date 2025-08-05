// src/lib/api.ts - Cliente API para Next.js
import axios, { AxiosResponse } from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios con configuración por defecto
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests (añadir auth, logs, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Añadir token JWT si existe
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses (manejo de errores, logs, etc.)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    
    // Manejo de errores comunes
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Tipos TypeScript para las respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Tipos para entidades principales
export interface Invoice {
  id: number;
  company_phone: string;
  supplier_name: string;
  amount: number;
  currency: string;
  invoice_date: string;
  due_date?: string;
  tax_id?: string;
  description?: string;
  category?: string;
  status: 'pending' | 'confirmed' | 'paid';
  created_at: string;
  confirmed_at?: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  tax_id?: string;
  phone?: string;
  email?: string;
  rating?: number;
  total_invoices: number;
  total_amount: number;
  last_invoice_date?: string;
  activity_status: 'active' | 'low_activity' | 'inactive';
}

export interface DashboardMetrics {
  total_invoices: number;
  total_amount: number;
  avg_amount: number;
  unique_suppliers: number;
  pending_invoices: number;
  confirmed_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  amount_change_percent: number;
  invoices_change_percent: number;
}

export interface CategoryData {
  category: string;
  invoice_count: number;
  total_amount: number;
  avg_amount: number;
}

export interface SupplierData {
  supplier_name: string;
  invoice_count: number;
  total_amount: number;
  avg_amount: number;
  last_invoice_date: string;
}

export interface MonthlyTrend {
  month: string;
  invoice_count: number;
  total_amount: number;
  avg_amount: number;
}

export interface DashboardData {
  period: string;
  metrics: DashboardMetrics;
  top_categories: CategoryData[];
  top_suppliers: SupplierData[];
  monthly_trend: MonthlyTrend[];
  generated_at: string;
}

// Funciones de la API

// **Facturas**
export const invoicesApi = {
  // Listar facturas con filtros
  getAll: async (params: {
    company_phone: string;
    status?: string;
    category?: string;
    supplier?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get('/invoices', { params });
    return response.data;
  },

  // Obtener factura específica
  getById: async (id: number): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  // Crear nueva factura
  create: async (invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.post('/invoices', invoice);
    return response.data;
  },

  // Actualizar factura
  update: async (id: number, invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.put(`/invoices/${id}`, invoice);
    return response.data;
  },

  // Cambiar estado de factura
  updateStatus: async (id: number, status: string): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  // Eliminar factura
  delete: async (id: number): Promise<ApiResponse<{ id: number }>> => {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response.data;
  },
};

// **Analytics**
export const analyticsApi = {
  // Dashboard principal
  getDashboard: async (params: {
    company_phone: string;
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<ApiResponse<DashboardData>> => {
    const response = await apiClient.get('/analytics/dashboard', { params });
    return response.data;
  },

  // Resumen mensual
  getMonthly: async (params: {
    company_phone: string;
    year?: number;
    month?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/monthly', { params });
    return response.data;
  },

  // Tendencias
  getTrends: async (params: {
    company_phone: string;
    period?: '6m' | '12m';
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/trends', { params });
    return response.data;
  },

  // Predicciones
  getPredictions: async (params: {
    company_phone: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/predictions', { params });
    return response.data;
  },

  // Cash flow
  getCashflow: async (params: {
    company_phone: string;
    months?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/cashflow', { params });
    return response.data;
  },
};

// **Proveedores**
export const suppliersApi = {
  // Listar proveedores
  getAll: async (params: {
    company_phone: string;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  // Top proveedores con analytics
  getTopAnalytics: async (params: {
    company_phone: string;
    period?: '1m' | '3m' | '6m' | '12m';
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/suppliers/analytics/top', { params });
    return response.data;
  },
};

// **Health Check**
export const healthApi = {
  // Health check básico
  check: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Métricas del sistema
  getMetrics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/health/metrics');
    return response.data;
  },
};

// **Utilidades**
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace unos segundos';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(dateString);
};

// Status helpers
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'text-warning-600 bg-warning-50';
    case 'confirmed': return 'text-success-600 bg-success-50';
    case 'paid': return 'text-primary-600 bg-primary-50';
    default: return 'text-slate-600 bg-slate-50';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'confirmed': return 'Confirmada';
    case 'paid': return 'Pagada';
    default: return status;
  }
};

export default apiClient;