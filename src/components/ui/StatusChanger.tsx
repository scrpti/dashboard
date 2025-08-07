import React, { useState } from 'react';
import { Check, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { Button, Modal, Badge } from '@/components/ui';
import { Invoice } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

interface StatusChangerProps {
  invoice: Invoice;
  onStatusChange: (invoiceId: number, newStatus: string) => void;
  disabled?: boolean;
}

const StatusChanger: React.FC<StatusChangerProps> = ({
  invoice,
  onStatusChange,
  disabled = false
}) => {
  const { dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isChanging, setIsChanging] = useState(false);

  const statusOptions = [
    {
      value: 'pending',
      label: 'Pendiente',
      icon: <Clock className="h-4 w-4" />,
      color: 'warning',
      description: 'La factura está pendiente de confirmación'
    },
    {
      value: 'confirmed',
      label: 'Confirmada',
      icon: <Check className="h-4 w-4" />,
      color: 'success',
      description: 'La factura ha sido confirmada y está lista para pago'
    },
    {
      value: 'paid',
      label: 'Pagada',
      icon: <CreditCard className="h-4 w-4" />,
      color: 'info',
      description: 'La factura ha sido pagada completamente'
    }
  ];

  const getCurrentStatus = () => {
    return statusOptions.find(status => status.value === invoice.status);
  };

  const handleStatusClick = (newStatus: string) => {
    if (newStatus === invoice.status || disabled) return;
    
    setSelectedStatus(newStatus);
    setIsModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedStatus || selectedStatus === invoice.status) return;
    
    setIsChanging(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onStatusChange(invoice.id, selectedStatus);
      
      const statusOption = statusOptions.find(s => s.value === selectedStatus);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Estado actualizado',
          message: `La factura ahora está "${statusOption?.label.toLowerCase()}"`
        }
      });
      
      setIsModalOpen(false);
      setSelectedStatus('');
    } catch (error) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar el estado de la factura'
        }
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getNextLogicalStatus = () => {
    switch (invoice.status) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'paid';
      case 'paid': return null;
      default: return 'confirmed';
    }
  };

  const nextStatus = getNextLogicalStatus();
  const nextStatusOption = statusOptions.find(s => s.value === nextStatus);
  const currentStatus = getCurrentStatus();

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Current Status Badge */}
        <Badge
          variant={currentStatus?.color as any}
          dot
        >
          {currentStatus?.label}
        </Badge>

        {/* Quick Action Button */}
        {nextStatus && !disabled && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusClick(nextStatus)}
            leftIcon={nextStatusOption?.icon}
            className="text-xs"
          >
            Marcar como {nextStatusOption?.label}
          </Button>
        )}

        {/* Full Status Selector */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          className="text-xs"
        >
          Cambiar Estado
        </Button>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isChanging) {
            setIsModalOpen(false);
            setSelectedStatus('');
          }
        }}
        title="Cambiar Estado de Factura"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false);
                setSelectedStatus('');
              }}
              disabled={isChanging}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmStatusChange}
              loading={isChanging}
              disabled={!selectedStatus || selectedStatus === invoice.status}
            >
              Actualizar Estado
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">{invoice.supplier_name}</h4>
                <p className="text-sm text-slate-600">
                  {invoice.description} - {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: invoice.currency
                  }).format(invoice.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Selecciona el nuevo estado:</h4>
            <div className="grid grid-cols-1 gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  disabled={status.value === invoice.status}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStatus === status.value
                      ? 'border-primary-500 bg-primary-50'
                      : status.value === invoice.status
                      ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      status.color === 'warning' ? 'bg-warning-100 text-warning-600' :
                      status.color === 'success' ? 'bg-success-100 text-success-600' :
                      status.color === 'info' ? 'bg-primary-100 text-primary-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {status.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-slate-900">{status.label}</h5>
                        {status.value === invoice.status && (
                          <Badge variant="outline" size="sm">Estado Actual</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {status.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Flujo de trabajo típico:</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-warning-600">
                <Clock className="h-4 w-4" />
                <span>Pendiente</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-4"></div>
              <div className="flex items-center gap-2 text-success-600">
                <Check className="h-4 w-4" />
                <span>Confirmada</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-4"></div>
              <div className="flex items-center gap-2 text-primary-600">
                <CreditCard className="h-4 w-4" />
                <span>Pagada</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StatusChanger;