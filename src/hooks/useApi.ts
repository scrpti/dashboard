import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  invoicesApi, 
  analyticsApi, 
  suppliersApi,
  Invoice, 
  Supplier, 
  DashboardData,
  PaginatedResponse,
  ApiResponse 
} from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

// Query Keys
export const queryKeys = {
  invoices: ['invoices'] as const,
  invoicesList: (params: any) => ['invoices', 'list', params] as const,
  invoice: (id: number) => ['invoices', id] as const,
  
  suppliers: ['suppliers'] as const,
  suppliersList: (params: any) => ['suppliers', 'list', params] as const,
  supplier: (id: number) => ['suppliers', id] as const,
  
  analytics: ['analytics'] as const,
  dashboard: (params: any) => ['analytics', 'dashboard', params] as const,
  trends: (params: any) => ['analytics', 'trends', params] as const,
};

// Invoice Hooks
export const useInvoices = (params: {
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
}) => {
  const { dispatch } = useApp();
  
  return useQuery({
    queryKey: queryKeys.invoicesList(params),
    queryFn: async () => {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'invoices', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'invoices', value: null } });
      
      try {
        const response = await invoicesApi.getAll(params);
        if (response.success) {
          dispatch({ type: 'SET_INVOICES', payload: response.data });
          return response;
        } else {
          throw new Error(response.error || 'Error loading invoices');
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'invoices', value: error.message } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'invoices', value: false } });
      }
    },
    enabled: !!params.company_phone,
  });
};

export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { dispatch } = useApp();
  
  return useMutation({
    mutationFn: (invoice: Partial<Invoice>) => invoicesApi.create(invoice),
    onSuccess: (response) => {
      if (response.success) {
        dispatch({ type: 'ADD_INVOICE', payload: response.data });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'success', 
            title: 'Factura creada', 
            message: 'La factura se ha creado correctamente'
          }
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      }
    },
    onError: (error: any) => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          title: 'Error', 
          message: error.message || 'Error al crear la factura'
        }
      });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { dispatch } = useApp();
  
  return useMutation({
    mutationFn: ({ id, invoice }: { id: number; invoice: Partial<Invoice> }) => 
      invoicesApi.update(id, invoice),
    onSuccess: (response, { id }) => {
      if (response.success) {
        dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: response.data } });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'success', 
            title: 'Factura actualizada', 
            message: 'La factura se ha actualizado correctamente'
          }
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
        queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      }
    },
    onError: (error: any) => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          title: 'Error', 
          message: error.message || 'Error al actualizar la factura'
        }
      });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { dispatch } = useApp();
  
  return useMutation({
    mutationFn: (id: number) => invoicesApi.delete(id),
    onSuccess: (response, id) => {
      if (response.success) {
        dispatch({ type: 'DELETE_INVOICE', payload: id });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'success', 
            title: 'Factura eliminada', 
            message: 'La factura se ha eliminado correctamente'
          }
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      }
    },
    onError: (error: any) => {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          title: 'Error', 
          message: error.message || 'Error al eliminar la factura'
        }
      });
    },
  });
};

// Supplier Hooks
export const useSuppliers = (params: {
  company_phone: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  const { dispatch } = useApp();
  
  return useQuery({
    queryKey: queryKeys.suppliersList(params),
    queryFn: async () => {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'suppliers', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'suppliers', value: null } });
      
      try {
        const response = await suppliersApi.getAll(params);
        if (response.success) {
          dispatch({ type: 'SET_SUPPLIERS', payload: response.data });
          return response;
        } else {
          throw new Error(response.error || 'Error loading suppliers');
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'suppliers', value: error.message } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'suppliers', value: false } });
      }
    },
    enabled: !!params.company_phone,
  });
};

// Analytics Hooks
export const useDashboard = (params: {
  company_phone: string;
  period?: '7d' | '30d' | '90d' | '1y';
}) => {
  const { dispatch } = useApp();
  
  return useQuery({
    queryKey: queryKeys.dashboard(params),
    queryFn: async () => {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'dashboard', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'dashboard', value: null } });
      
      try {
        const response = await analyticsApi.getDashboard(params);
        if (response.success) {
          dispatch({ type: 'SET_DASHBOARD_DATA', payload: response.data });
          return response;
        } else {
          throw new Error(response.error || 'Error loading dashboard');
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: { key: 'dashboard', value: error.message } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'dashboard', value: false } });
      }
    },
    enabled: !!params.company_phone,
  });
};

export const useTrends = (params: {
  company_phone: string;
  period?: '6m' | '12m';
}) => {
  return useQuery({
    queryKey: queryKeys.trends(params),
    queryFn: () => analyticsApi.getTrends(params),
    enabled: !!params.company_phone,
  });
};

// Utility Hooks
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateInvoices: () => queryClient.invalidateQueries({ queryKey: queryKeys.invoices }),
    invalidateSuppliers: () => queryClient.invalidateQueries({ queryKey: queryKeys.suppliers }),
    invalidateAnalytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};

export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchInvoices: (params: any) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.invoicesList(params),
        queryFn: () => invoicesApi.getAll(params),
      }),
    prefetchSuppliers: (params: any) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.suppliersList(params),
        queryFn: () => suppliersApi.getAll(params),
      }),
    prefetchDashboard: (params: any) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard(params),
        queryFn: () => analyticsApi.getDashboard(params),
      }),
  };
};