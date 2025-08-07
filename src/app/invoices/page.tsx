'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Euro,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { Button, Badge, Modal, Table, Card, LoadingSpinner } from '@/components/ui';
import StatusChanger from '@/components/ui/StatusChanger';
import { Invoice, formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { useInvoices, useDeleteInvoice } from '@/hooks/useApi';

const InvoicesPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const company_phone = state.user?.companyPhone || '+34644451595';
  
  const { data: invoicesResponse, isLoading, error } = useInvoices({
    company_phone,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50
  });

  const deleteInvoiceMutation = useDeleteInvoice();

  const invoices = invoicesResponse?.data || [];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.category?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [invoices, searchTerm]);

  const handleCreateInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedInvoice) {
      try {
        await deleteInvoiceMutation.mutateAsync(selectedInvoice.id);
        setIsDeleteModalOpen(false);
        setSelectedInvoice(null);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleRowSelect = (invoice: Invoice, selected: boolean) => {
    const newSelection = new Set(selectedInvoices);
    if (selected) {
      newSelection.add(invoice.id);
    } else {
      newSelection.delete(invoice.id);
    }
    setSelectedInvoices(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.size === 0) return;
    
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { 
        type: 'info', 
        title: 'Eliminando facturas', 
        message: `Eliminando ${selectedInvoices.size} facturas...`
      }
    });

    try {
      const deletePromises = Array.from(selectedInvoices).map(id => 
        deleteInvoiceMutation.mutateAsync(id)
      );
      await Promise.all(deletePromises);
      setSelectedInvoices(new Set());
    } catch (error) {
      console.error('Error deleting invoices:', error);
    }
  };

  const handleStatusChange = (invoiceId: number, newStatus: string) => {
    dispatch({ 
      type: 'UPDATE_INVOICE', 
      payload: { 
        id: invoiceId, 
        updates: { 
          status: newStatus as any,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'confirmed' && { confirmed_at: new Date().toISOString() })
        } 
      } 
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Proveedor', 'Descripción', 'Fecha', 'Importe', 'Estado', 'Categoría'],
      ...filteredInvoices.map(invoice => [
        invoice.supplier_name,
        invoice.description || '',
        formatDate(invoice.invoice_date),
        invoice.amount.toString(),
        getStatusText(invoice.status),
        invoice.category || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facturas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { 
        type: 'success', 
        title: 'Exportación completada', 
        message: 'Las facturas se han exportado correctamente'
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'supplier_name',
      label: 'Proveedor',
      sortable: true,
      render: (value: string, invoice: Invoice) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900">
              {value}
            </div>
            <div className="text-sm text-slate-500">
              {invoice.tax_id}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string, invoice: Invoice) => (
        <div>
          <div className="text-sm text-slate-900">
            {value}
          </div>
          <div className="text-sm text-slate-500">
            {invoice.category}
          </div>
        </div>
      )
    },
    {
      key: 'invoice_date',
      label: 'Fecha',
      sortable: true,
      render: (value: string, invoice: Invoice) => (
        <div>
          <div className="text-sm text-slate-900">
            {formatDate(value)}
          </div>
          {invoice.due_date && (
            <div className="text-sm text-slate-500">
              Vence: {formatDate(invoice.due_date)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Importe',
      sortable: true,
      render: (value: number, invoice: Invoice) => (
        <div className="text-sm font-semibold text-slate-900">
          {formatCurrency(value, invoice.currency)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: string, invoice: Invoice) => (
        <StatusChanger
          invoice={invoice}
          onStatusChange={handleStatusChange}
        />
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, invoice: Invoice) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditInvoice(invoice)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteInvoice(invoice)}
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
            <h1 className="text-2xl font-bold text-slate-900">Facturas</h1>
            <p className="text-slate-600">
              Gestión de todas las facturas de la empresa
            </p>
          </div>
          <Button 
            onClick={handleCreateInvoice}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nueva Factura
          </Button>
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
                  placeholder="Buscar facturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-auto min-w-32"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="paid">Pagadas</option>
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
          {selectedInvoices.size > 0 && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-primary-700">
                {selectedInvoices.size} factura{selectedInvoices.size > 1 ? 's' : ''} seleccionada{selectedInvoices.size > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedInvoices(new Set())}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleBulkDelete}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  loading={deleteInvoiceMutation.isPending}
                >
                  Eliminar seleccionadas
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Invoices Table */}
        <Table
          data={filteredInvoices}
          columns={columns}
          loading={isLoading}
          emptyState={
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No se encontraron facturas
              </h3>
              <p className="mt-2 text-slate-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Prueba con otros filtros de búsqueda'
                  : 'Comienza creando tu primera factura'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  className="mt-4"
                  onClick={handleCreateInvoice}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Nueva Factura
                </Button>
              )}
            </div>
          }
          selectedRows={selectedInvoices}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          rowKey="id"
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-primary-50 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Total Facturas</p>
                <p className="text-lg font-semibold text-slate-900">{filteredInvoices.length}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-warning-50 rounded-lg">
                <Clock className="h-5 w-5 text-warning-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Pendientes</p>
                <p className="text-lg font-semibold text-slate-900">
                  {filteredInvoices.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-success-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Pagadas</p>
                <p className="text-lg font-semibold text-slate-900">
                  {filteredInvoices.filter(inv => inv.status === 'paid').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-slate-50 rounded-lg">
                <Euro className="h-5 w-5 text-slate-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Importe Total</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Modals */}
        <InvoiceForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          mode="create"
        />

        <InvoiceForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedInvoice(null);
          }}
          mode="edit"
          invoice={selectedInvoice}
        />

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedInvoice(null);
          }}
          title="Eliminar Factura"
          footer={
            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedInvoice(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger"
                onClick={confirmDelete}
                loading={deleteInvoiceMutation.isPending}
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
                <AlertCircle className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  ¿Estás seguro?
                </h3>
                <p className="text-sm text-slate-600">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            
            {selectedInvoice && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Proveedor:</span>
                    <p>{selectedInvoice.supplier_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Importe:</span>
                    <p>{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Descripción:</span>
                    <p>{selectedInvoice.description}</p>
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

export default InvoicesPage;