'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, DollarSign, FileText, User, Tag, Hash } from 'lucide-react';
import { Button, Input, Select, Modal } from '@/components/ui';
import { Invoice } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useApi';

interface InvoiceFormData {
  supplier_name: string;
  amount: number;
  currency: string;
  invoice_date: string;
  due_date: string;
  tax_id: string;
  description: string;
  category: string;
  status: 'pending' | 'confirmed' | 'paid';
}

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  mode: 'create' | 'edit';
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  invoice,
  mode = 'create'
}) => {
  const { state } = useApp();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<InvoiceFormData>({
    defaultValues: {
      supplier_name: '',
      amount: 0,
      currency: 'EUR',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      tax_id: '',
      description: '',
      category: '',
      status: 'pending'
    }
  });

  const categories = [
    { value: 'Suministros', label: 'Suministros' },
    { value: 'Servicios', label: 'Servicios' },
    { value: 'Oficina', label: 'Oficina' },
    { value: 'Tecnología', label: 'Tecnología' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Consultoría', label: 'Consultoría' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Seguros', label: 'Seguros' },
    { value: 'Telecomunicaciones', label: 'Telecomunicaciones' },
    { value: 'Otros', label: 'Otros' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'paid', label: 'Pagada' }
  ];

  const currencyOptions = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dólar ($)' },
    { value: 'GBP', label: 'Libra (£)' }
  ];

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && invoice) {
      setValue('supplier_name', invoice.supplier_name);
      setValue('amount', invoice.amount);
      setValue('currency', invoice.currency);
      setValue('invoice_date', invoice.invoice_date);
      setValue('due_date', invoice.due_date || '');
      setValue('tax_id', invoice.tax_id || '');
      setValue('description', invoice.description || '');
      setValue('category', invoice.category || '');
      setValue('status', invoice.status);
    }
  }, [mode, invoice, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Auto-calculate due date (30 days from invoice date)
  const invoiceDate = watch('invoice_date');
  useEffect(() => {
    if (invoiceDate && mode === 'create') {
      const date = new Date(invoiceDate);
      date.setDate(date.getDate() + 30);
      setValue('due_date', date.toISOString().split('T')[0]);
    }
  }, [invoiceDate, setValue, mode]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const invoiceData = {
        ...data,
        company_phone: state.user?.companyPhone || '+34644451595',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (mode === 'create') {
        await createInvoice.mutateAsync(invoiceData);
      } else if (mode === 'edit' && invoice) {
        await updateInvoice.mutateAsync({ 
          id: invoice.id, 
          invoice: invoiceData 
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Nueva Factura' : 'Editar Factura'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            form="invoice-form"
            loading={isSubmitting}
            leftIcon={<FileText className="h-4 w-4" />}
          >
            {mode === 'create' ? 'Crear Factura' : 'Actualizar Factura'}
          </Button>
        </div>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Proveedor"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.supplier_name?.message}
            {...register('supplier_name', {
              required: 'El nombre del proveedor es obligatorio',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres'
              }
            })}
          />
          
          <Input
            label="NIF/CIF del Proveedor"
            leftIcon={<Hash className="h-4 w-4" />}
            error={errors.tax_id?.message}
            helperText="Opcional"
            {...register('tax_id')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Importe"
            type="number"
            step="0.01"
            min="0"
            leftIcon={<DollarSign className="h-4 w-4" />}
            error={errors.amount?.message}
            {...register('amount', {
              required: 'El importe es obligatorio',
              min: {
                value: 0.01,
                message: 'El importe debe ser mayor que 0'
              }
            })}
          />
          
          <Select
            label="Moneda"
            options={currencyOptions}
            error={errors.currency?.message}
            {...register('currency', {
              required: 'La moneda es obligatoria'
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Factura"
            type="date"
            leftIcon={<Calendar className="h-4 w-4" />}
            error={errors.invoice_date?.message}
            {...register('invoice_date', {
              required: 'La fecha de factura es obligatoria'
            })}
          />
          
          <Input
            label="Fecha de Vencimiento"
            type="date"
            leftIcon={<Calendar className="h-4 w-4" />}
            error={errors.due_date?.message}
            helperText="Se calcula automáticamente (+30 días)"
            {...register('due_date')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoría"
            options={categories}
            placeholder="Selecciona una categoría"
            error={errors.category?.message}
            {...register('category', {
              required: 'La categoría es obligatoria'
            })}
          />
          
          <Select
            label="Estado"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status', {
              required: 'El estado es obligatorio'
            })}
          />
        </div>

        <Input
          label="Descripción"
          leftIcon={<Tag className="h-4 w-4" />}
          error={errors.description?.message}
          helperText="Descripción del servicio o producto"
          {...register('description', {
            required: 'La descripción es obligatoria',
            minLength: {
              value: 5,
              message: 'La descripción debe tener al menos 5 caracteres'
            }
          })}
        />

        {/* Preview Section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Vista previa</h4>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Proveedor:</span>
                <span className="ml-2 font-medium">{watch('supplier_name') || 'Sin especificar'}</span>
              </div>
              <div>
                <span className="text-slate-600">Importe:</span>
                <span className="ml-2 font-medium">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: watch('currency') || 'EUR'
                  }).format(watch('amount') || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Categoría:</span>
                <span className="ml-2 font-medium">{watch('category') || 'Sin categoría'}</span>
              </div>
              <div>
                <span className="text-slate-600">Estado:</span>
                <span className="ml-2 font-medium">
                  {statusOptions.find(s => s.value === watch('status'))?.label || 'Pendiente'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceForm;