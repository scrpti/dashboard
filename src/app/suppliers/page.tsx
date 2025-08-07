'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  TrendingUp,
  FileText,
  AlertTriangle,
  Building
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SupplierForm from '@/components/forms/SupplierForm';
import { Button, Badge, Modal, Table, Card, LoadingSpinner } from '@/components/ui';
import { Supplier, formatCurrency, formatDate } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { useSuppliers } from '@/hooks/useApi';

const SuppliersPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total_amount' | 'total_invoices' | 'last_invoice_date'>('total_amount');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<number>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const company_phone = state.user?.companyPhone || '+34644451595';
  
  const { data: suppliersResponse, isLoading, error } = useSuppliers({
    company_phone,
    sort_by: sortBy,
    sort_order: sortOrder,
    limit: 50,
    search: searchTerm || undefined
  });

  const suppliers = suppliersResponse?.data || [];

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.tax_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [suppliers, searchTerm]);

  const handleCreateSupplier = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSupplier) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ type: 'DELETE_SUPPLIER', payload: selectedSupplier.id });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'success', 
            title: 'Proveedor eliminado', 
            message: 'El proveedor se ha eliminado correctamente'
          }
        });
        
        setIsDeleteModalOpen(false);
        setSelectedSupplier(null);
      } catch (error) {
        console.error('Error deleting supplier:', error);
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'error', 
            title: 'Error', 
            message: 'Error al eliminar el proveedor'
          }
        });
      }
    }
  };

  const handleRowSelect = (supplier: Supplier, selected: boolean) => {
    const newSelection = new Set(selectedSuppliers);
    if (selected) {
      newSelection.add(supplier.id);
    } else {
      newSelection.delete(supplier.id);
    }
    setSelectedSuppliers(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedSuppliers(new Set(filteredSuppliers.map(sup => sup.id)));
    } else {
      setSelectedSuppliers(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSuppliers.size === 0) return;
    
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { 
        type: 'info', 
        title: 'Eliminando proveedores', 
        message: `Eliminando ${selectedSuppliers.size} proveedores...`
      }
    });

    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      selectedSuppliers.forEach(id => {
        dispatch({ type: 'DELETE_SUPPLIER', payload: id });
      });
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'success', 
          title: 'Proveedores eliminados', 
          message: `Se han eliminado ${selectedSuppliers.size} proveedores`
        }
      });
      
      setSelectedSuppliers(new Set());
    } catch (error) {
      console.error('Error deleting suppliers:', error);
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          title: 'Error', 
          message: 'Error al eliminar los proveedores'
        }
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nombre', 'NIF/CIF', 'Teléfono', 'Email', 'Total Facturas', 'Importe Total', 'Valoración', 'Estado'],
      ...filteredSuppliers.map(supplier => [
        supplier.name,
        supplier.tax_id || '',
        supplier.phone || '',
        supplier.email || '',
        supplier.total_invoices.toString(),
        supplier.total_amount.toString(),
        supplier.rating?.toString() || '',
        supplier.activity_status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proveedores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { 
        type: 'success', 
        title: 'Exportación completada', 
        message: 'Los proveedores se han exportado correctamente'
      }
    });
  };

  const getActivityStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'low_activity': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getActivityStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'low_activity': return 'Poca actividad';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-slate-400 text-sm">Sin valorar</span>;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-slate-300'
            }`} 
          />
        ))}
        <span className="ml-1 text-sm text-slate-600">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Proveedor',
      sortable: true,
      render: (value: string, supplier: Supplier) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building className="h-5 w-5 text-slate-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900">
              {value}
            </div>
            <div className="text-sm text-slate-500">
              {supplier.tax_id || 'Sin NIF/CIF'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (_: any, supplier: Supplier) => (
        <div className="space-y-1">
          {supplier.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="h-3 w-3 mr-1" />
              {supplier.phone}
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center text-sm text-slate-600">
              <Mail className="h-3 w-3 mr-1" />
              {supplier.email}
            </div>
          )}
          {!supplier.phone && !supplier.email && (
            <span className="text-sm text-slate-400">Sin contacto</span>
          )}
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Valoración',
      render: (value: number | undefined) => renderStars(value)
    },
    {
      key: 'total_invoices',
      label: 'Facturas',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-semibold text-slate-900">
          {value}
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Importe Total',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-semibold text-slate-900">
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'activity_status',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={getActivityStatusVariant(value)}>
          {getActivityStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'last_invoice_date',
      label: 'Última Factura',
      sortable: true,
      render: (value: string | undefined) => (
        <div className="text-sm text-slate-900">
          {value ? formatDate(value) : 'Nunca'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, supplier: Supplier) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSupplier(supplier)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSupplier(supplier)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Eliminar
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
            <p className="text-slate-600">
              Gestión y análisis de proveedores
            </p>
          </div>
          <Button 
            onClick={handleCreateSupplier}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nuevo Proveedor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-primary-50 rounded-lg">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Total Proveedores</p>
                <p className="text-lg font-semibold text-slate-900">{filteredSuppliers.length}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-success-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Activos</p>
                <p className="text-lg font-semibold text-slate-900">
                  {filteredSuppliers.filter(s => s.activity_status === 'active').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-warning-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Poca Actividad</p>
                <p className="text-lg font-semibold text-slate-900">
                  {filteredSuppliers.filter(s => s.activity_status === 'low_activity').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-slate-50 rounded-lg">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Total Facturas</p>
                <p className="text-lg font-semibold text-slate-900">
                  {filteredSuppliers.reduce((sum, s) => sum + s.total_invoices, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="input-field w-auto min-w-48"
              >
                <option value="total_amount-DESC">Mayor importe</option>
                <option value="total_amount-ASC">Menor importe</option>
                <option value="total_invoices-DESC">Más facturas</option>
                <option value="total_invoices-ASC">Menos facturas</option>
                <option value="name-ASC">Nombre A-Z</option>
                <option value="name-DESC">Nombre Z-A</option>
                <option value="last_invoice_date-DESC">Más reciente</option>
                <option value="last_invoice_date-ASC">Más antiguo</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="secondary"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filtros
              </Button>
              <Button 
                variant="secondary"
                onClick={handleExport}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exportar
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSuppliers.size > 0 && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-primary-700">
                {selectedSuppliers.size} proveedor{selectedSuppliers.size > 1 ? 'es' : ''} seleccionado{selectedSuppliers.size > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedSuppliers(new Set())}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleBulkDelete}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Eliminar seleccionados
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Suppliers Table */}
        <Table
          data={filteredSuppliers}
          columns={columns}
          loading={isLoading}
          emptyState={
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No se encontraron proveedores
              </h3>
              <p className="mt-2 text-slate-600">
                {searchTerm 
                  ? 'Prueba con otros términos de búsqueda'
                  : 'Comienza añadiendo tu primer proveedor'
                }
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4"
                  onClick={handleCreateSupplier}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Nuevo Proveedor
                </Button>
              )}
            </div>
          }
          selectedRows={selectedSuppliers}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          rowKey="id"
        />

        {/* Modals */}
        <SupplierForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          mode="create"
        />

        <SupplierForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSupplier(null);
          }}
          mode="edit"
          supplier={selectedSupplier}
        />

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedSupplier(null);
          }}
          title="Eliminar Proveedor"
          footer={
            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedSupplier(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger"
                onClick={confirmDelete}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Eliminar
              </Button>
            </div>
          }
        >
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  ¿Estás seguro?
                </h3>
                <p className="text-sm text-slate-600">
                  Esta acción no se puede deshacer. También se eliminarán todas las facturas relacionadas.
                </p>
              </div>
            </div>
            
            {selectedSupplier && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span>
                    <p>{selectedSupplier.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Facturas:</span>
                    <p>{selectedSupplier.total_invoices}</p>
                  </div>
                  <div>
                    <span className="font-medium">Importe Total:</span>
                    <p>{formatCurrency(selectedSupplier.total_amount)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span>
                    <p>{getActivityStatusText(selectedSupplier.activity_status)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SuppliersPage;