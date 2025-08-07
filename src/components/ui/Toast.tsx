import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };

  const styles = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800'
  };

  const iconStyles = {
    success: 'text-success-600',
    error: 'text-danger-600',
    warning: 'text-warning-600',
    info: 'text-primary-600'
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${styles[type]} transform transition-all duration-300 ease-in-out`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${iconStyles[type]}`}>
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm mt-1 opacity-90">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
          >
            <span className="sr-only">Cerrar</span>
            <X className="h-4 w-4 opacity-60 hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleRemoveToast = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {state.notifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => handleRemoveToast(notification.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default Toast;