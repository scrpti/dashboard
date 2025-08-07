'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, Hash, MapPin, Star, Building } from 'lucide-react';
import { Button, Input, Select, Modal } from '@/components/ui';
import { Supplier } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface SupplierFormData {
  name: string;
  tax_id: string;
  phone: string;
  email: string;
  rating?: number;
}

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  mode: 'create' | 'edit';
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  isOpen,
  onClose,
  supplier,
  mode = 'create'
}) => {
  const { state, dispatch } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<SupplierFormData>({
    defaultValues: {
      name: '',
      tax_id: '',
      phone: '',
      email: '',
      rating: undefined
    }
  });

  const ratingOptions = [
    { value: '1', label: '⭐ (1 estrella)' },
    { value: '2', label: '⭐⭐ (2 estrellas)' },
    { value: '3', label: '⭐⭐⭐ (3 estrellas)' },
    { value: '4', label: '⭐⭐⭐⭐ (4 estrellas)' },
    { value: '5', label: '⭐⭐⭐⭐⭐ (5 estrellas)' }
  ];

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && supplier) {
      setValue('name', supplier.name);
      setValue('tax_id', supplier.tax_id || '');
      setValue('phone', supplier.phone || '');
      setValue('email', supplier.email || '');
      setValue('rating', supplier.rating || undefined);
    }
  }, [mode, supplier, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    
    try {
      const supplierData = {
        ...data,
        rating: data.rating ? Number(data.rating) : undefined,
        total_invoices: supplier?.total_invoices || 0,
        total_amount: supplier?.total_amount || 0,
        activity_status: supplier?.activity_status || 'active' as const
      };

      if (mode === 'create') {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newSupplier: Supplier = {
          id: Date.now(),
          ...supplierData,
          last_invoice_date: undefined
        };
        
        dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'success', 
            title: 'Proveedor creado', 
            message: 'El proveedor se ha creado correctamente'
          }
        });
      } else if (mode === 'edit' && supplier) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ 
          type: 'UPDATE_SUPPLIER', 
          payload: { id: supplier.id, updates: supplierData } 
        });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { 
            type: 'success', 
            title: 'Proveedor actualizado', 
            message: 'El proveedor se ha actualizado correctamente'
          }
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          title: 'Error', 
          message: 'Error al guardar el proveedor'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Email inválido';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[+]?[0-9\s\-()]{9,}$/;
    return phoneRegex.test(phone) || 'Teléfono inválido';
  };

  const validateTaxId = (taxId: string) => {
    if (!taxId) return true; // Optional field
    // Basic validation for Spanish NIF/CIF
    const taxIdRegex = /^[A-Z]?[0-9]{8}[A-Z0-9]$/i;
    return taxIdRegex.test(taxId) || 'NIF/CIF inválido';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
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
            form="supplier-form"
            loading={isSubmitting}
            leftIcon={<Building className="h-4 w-4" />}
          >
            {mode === 'create' ? 'Crear Proveedor' : 'Actualizar Proveedor'}
          </Button>
        </div>
      }
    >
      <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Proveedor"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name', {
              required: 'El nombre del proveedor es obligatorio',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres'
              }
            })}
          />
          
          <Input
            label="NIF/CIF"
            leftIcon={<Hash className="h-4 w-4" />}
            error={errors.tax_id?.message}
            helperText="Opcional - Formato: A12345678 o 12345678A"
            {...register('tax_id', {
              validate: validateTaxId
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            type="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            helperText="Opcional - Incluir código de país: +34"
            {...register('phone', {
              validate: validatePhone
            })}
          />
          
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            helperText="Opcional"
            {...register('email', {
              validate: validateEmail
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Valoración"
            options={ratingOptions}
            placeholder="Selecciona una valoración"
            error={errors.rating?.message}
            helperText="Opcional - Calidad del servicio"
            {...register('rating')}
          />
          
          <div className="flex flex-col justify-end">
            <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
              <p className="font-medium">Información calculada automáticamente:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Total de facturas</li>
                <li>• Importe total facturado</li>
                <li>• Estado de actividad</li>
                <li>• Fecha de última factura</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information Preview */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Vista previa del contacto</h4>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-slate-900 truncate">
                  {watch('name') || 'Nombre del proveedor'}
                </h5>
                {watch('tax_id') && (
                  <p className="text-sm text-slate-600">
                    NIF/CIF: {watch('tax_id')}
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  {watch('phone') && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="h-3 w-3 mr-2" />
                      {watch('phone')}
                    </div>
                  )}
                  {watch('email') && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-3 w-3 mr-2" />
                      {watch('email')}
                    </div>
                  )}
                  {watch('rating') && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Star className="h-3 w-3 mr-2 fill-current text-yellow-400" />
                      {watch('rating')} estrella{Number(watch('rating')) !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {mode === 'edit' && supplier && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-slate-900 mb-3">Información adicional</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Total Facturas</span>
                <p className="font-semibold text-slate-900">{supplier.total_invoices}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Importe Total</span>
                <p className="font-semibold text-slate-900">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(supplier.total_amount)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Estado</span>
                <p className={`font-semibold ${
                  supplier.activity_status === 'active' ? 'text-success-600' :
                  supplier.activity_status === 'low_activity' ? 'text-warning-600' :
                  'text-slate-600'
                }`}>
                  {supplier.activity_status === 'active' ? 'Activo' :
                   supplier.activity_status === 'low_activity' ? 'Poca actividad' :
                   'Inactivo'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Última Factura</span>
                <p className="font-semibold text-slate-900">
                  {supplier.last_invoice_date 
                    ? new Date(supplier.last_invoice_date).toLocaleDateString('es-ES')
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default SupplierForm;