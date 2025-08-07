'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Invoice, Supplier, DashboardData } from '@/lib/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companyPhone: string;
  role: 'admin' | 'user';
}

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Data
  invoices: Invoice[];
  suppliers: Supplier[];
  dashboardData: DashboardData | null;
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Filters & Search
  invoiceFilters: {
    status: string;
    supplier: string;
    category: string;
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
  };
  
  supplierFilters: {
    searchTerm: string;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  };
  
  // Loading states
  loading: {
    invoices: boolean;
    suppliers: boolean;
    dashboard: boolean;
  };
  
  // Error states
  errors: {
    invoices: string | null;
    suppliers: string | null;
    dashboard: string | null;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

type AppAction =
  // Auth actions
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  
  // Data actions
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: { id: number; updates: Partial<Invoice> } }
  | { type: 'DELETE_INVOICE'; payload: number }
  
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: { id: number; updates: Partial<Supplier> } }
  | { type: 'DELETE_SUPPLIER'; payload: number }
  
  | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData }
  
  // UI actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  
  // Filter actions
  | { type: 'SET_INVOICE_FILTERS'; payload: Partial<AppState['invoiceFilters']> }
  | { type: 'RESET_INVOICE_FILTERS' }
  | { type: 'SET_SUPPLIER_FILTERS'; payload: Partial<AppState['supplierFilters']> }
  | { type: 'RESET_SUPPLIER_FILTERS' }
  
  // Loading actions
  | { type: 'SET_LOADING_STATE'; payload: { key: keyof AppState['loading']; value: boolean } }
  
  // Error actions
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }
  | { type: 'CLEAR_ERRORS' };

const initialState: AppState = {
  // User & Auth
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Data
  invoices: [],
  suppliers: [],
  dashboardData: null,
  
  // UI State
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  
  // Filters
  invoiceFilters: {
    status: 'all',
    supplier: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  },
  
  supplierFilters: {
    searchTerm: '',
    sortBy: 'total_amount',
    sortOrder: 'DESC'
  },
  
  // Loading states
  loading: {
    invoices: false,
    suppliers: false,
    dashboard: false
  },
  
  // Error states
  errors: {
    invoices: null,
    suppliers: null,
    dashboard: null
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Auth cases
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        theme: state.theme // Preserve theme
      };
    
    // Data cases
    case 'SET_INVOICES':
      return {
        ...state,
        invoices: action.payload
      };
    
    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [action.payload, ...state.invoices]
      };
    
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.payload.id
            ? { ...invoice, ...action.payload.updates }
            : invoice
        )
      };
    
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(invoice => invoice.id !== action.payload)
      };
    
    case 'SET_SUPPLIERS':
      return {
        ...state,
        suppliers: action.payload
      };
    
    case 'ADD_SUPPLIER':
      return {
        ...state,
        suppliers: [action.payload, ...state.suppliers]
      };
    
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(supplier =>
          supplier.id === action.payload.id
            ? { ...supplier, ...action.payload.updates }
            : supplier
        )
      };
    
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(supplier => supplier.id !== action.payload)
      };
    
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        dashboardData: action.payload
      };
    
    // UI cases
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload
      };
    
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            ...action.payload,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false
          },
          ...state.notifications
        ]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    
    // Filter cases
    case 'SET_INVOICE_FILTERS':
      return {
        ...state,
        invoiceFilters: {
          ...state.invoiceFilters,
          ...action.payload
        }
      };
    
    case 'RESET_INVOICE_FILTERS':
      return {
        ...state,
        invoiceFilters: initialState.invoiceFilters
      };
    
    case 'SET_SUPPLIER_FILTERS':
      return {
        ...state,
        supplierFilters: {
          ...state.supplierFilters,
          ...action.payload
        }
      };
    
    case 'RESET_SUPPLIER_FILTERS':
      return {
        ...state,
        supplierFilters: initialState.supplierFilters
      };
    
    // Loading cases
    case 'SET_LOADING_STATE':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };
    
    // Error cases
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value
        }
      };
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: initialState.errors
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('facturia-theme') as 'light' | 'dark';
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('facturia-theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      state.notifications
        .filter(n => !n.read && Date.now() - n.timestamp.getTime() > 5000)
        .forEach(n => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id });
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.notifications]);

  // Initialize user (simulate auth check)
  useEffect(() => {
    const initializeUser = () => {
      // Simulate checking for stored auth token
      const storedUser = localStorage.getItem('facturia-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('facturia-user');
        }
      } else {
        // For demo purposes, set a default user
        const defaultUser: User = {
          id: '1',
          name: 'Mi Empresa SL',
          email: 'admin@miempresa.com',
          companyName: 'Mi Empresa SL',
          companyPhone: '+34644451595',
          role: 'admin'
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: defaultUser });
        localStorage.setItem('facturia-user', JSON.stringify(defaultUser));
      }
    };

    const timer = setTimeout(initializeUser, 500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Action creators (helper functions)
export const appActions = {
  // Auth
  login: (user: User) => ({ type: 'LOGIN_SUCCESS' as const, payload: user }),
  logout: () => ({ type: 'LOGOUT' as const }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),

  // Data
  setInvoices: (invoices: Invoice[]) => ({ type: 'SET_INVOICES' as const, payload: invoices }),
  addInvoice: (invoice: Invoice) => ({ type: 'ADD_INVOICE' as const, payload: invoice }),
  updateInvoice: (id: number, updates: Partial<Invoice>) => ({ 
    type: 'UPDATE_INVOICE' as const, 
    payload: { id, updates } 
  }),
  deleteInvoice: (id: number) => ({ type: 'DELETE_INVOICE' as const, payload: id }),

  setSuppliers: (suppliers: Supplier[]) => ({ type: 'SET_SUPPLIERS' as const, payload: suppliers }),
  addSupplier: (supplier: Supplier) => ({ type: 'ADD_SUPPLIER' as const, payload: supplier }),
  updateSupplier: (id: number, updates: Partial<Supplier>) => ({ 
    type: 'UPDATE_SUPPLIER' as const, 
    payload: { id, updates } 
  }),
  deleteSupplier: (id: number) => ({ type: 'DELETE_SUPPLIER' as const, payload: id }),

  setDashboardData: (data: DashboardData) => ({ type: 'SET_DASHBOARD_DATA' as const, payload: data }),

  // UI
  toggleSidebar: () => ({ type: 'TOGGLE_SIDEBAR' as const }),
  setSidebarOpen: (open: boolean) => ({ type: 'SET_SIDEBAR_OPEN' as const, payload: open }),
  setTheme: (theme: 'light' | 'dark') => ({ type: 'SET_THEME' as const, payload: theme }),

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => ({
    type: 'ADD_NOTIFICATION' as const,
    payload: notification
  }),
  removeNotification: (id: string) => ({ type: 'REMOVE_NOTIFICATION' as const, payload: id }),
  markNotificationRead: (id: string) => ({ type: 'MARK_NOTIFICATION_READ' as const, payload: id }),
  clearNotifications: () => ({ type: 'CLEAR_NOTIFICATIONS' as const }),

  // Filters
  setInvoiceFilters: (filters: Partial<AppState['invoiceFilters']>) => ({
    type: 'SET_INVOICE_FILTERS' as const,
    payload: filters
  }),
  resetInvoiceFilters: () => ({ type: 'RESET_INVOICE_FILTERS' as const }),
  setSupplierFilters: (filters: Partial<AppState['supplierFilters']>) => ({
    type: 'SET_SUPPLIER_FILTERS' as const,
    payload: filters
  }),
  resetSupplierFilters: () => ({ type: 'RESET_SUPPLIER_FILTERS' as const }),

  // Loading & Errors
  setLoadingState: (key: keyof AppState['loading'], value: boolean) => ({
    type: 'SET_LOADING_STATE' as const,
    payload: { key, value }
  }),
  setError: (key: keyof AppState['errors'], value: string | null) => ({
    type: 'SET_ERROR' as const,
    payload: { key, value }
  }),
  clearErrors: () => ({ type: 'CLEAR_ERRORS' as const })
};

export type { AppState, AppAction, User, Notification };