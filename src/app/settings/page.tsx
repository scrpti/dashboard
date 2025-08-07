'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Database,
  Mail,
  Phone,
  Building,
  Globe,
  Palette,
  Download,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Input, Card } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';

const SettingsPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'data' | 'preferences'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    invoiceReminders: true,
    paymentAlerts: true,
    monthlyReports: false
  });

  const [profile, setProfile] = useState({
    companyName: state.user?.companyName || 'Mi Empresa SL',
    taxId: 'B12345678',
    email: state.user?.email || 'admin@miempresa.com',
    phone: state.user?.companyPhone || '+34644451595',
    address: 'Calle Principal 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'España'
  });

  const [preferences, setPreferences] = useState({
    language: 'es',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    theme: state.theme || 'light',
    timezone: 'Europe/Madrid'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
    { id: 'data', label: 'Datos', icon: Database },
    { id: 'preferences', label: 'Preferencias', icon: Settings }
  ];

  const handleSave = async (section: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (section === 'profile') {
        // Update user in global state
        if (state.user) {
          dispatch({ 
            type: 'SET_USER', 
            payload: {
              ...state.user,
              name: profile.companyName,
              email: profile.email,
              companyName: profile.companyName,
              companyPhone: profile.phone
            }
          });
        }
      } else if (section === 'preferences') {
        // Update theme in global state
        dispatch({ type: 'SET_THEME', payload: preferences.theme as any });
      }

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Configuración guardada',
          message: `Los cambios de ${section} se han guardado correctamente`
        }
      });
    } catch (error) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pudieron guardar los cambios'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'info',
        title: 'Exportando datos',
        message: 'Preparando la exportación de datos...'
      }
    });

    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = {
        invoices: state.invoices,
        suppliers: state.suppliers,
        user: state.user,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facturia_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Datos exportados',
          message: 'Los datos se han exportado correctamente'
        }
      });
    } catch (error) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error en exportación',
          message: 'No se pudieron exportar los datos'
        }
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'info',
            title: 'Importando datos',
            message: 'Importando datos del archivo...'
          }
        });

        // Simulate import delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (data.invoices) {
          dispatch({ type: 'SET_INVOICES', payload: data.invoices });
        }
        if (data.suppliers) {
          dispatch({ type: 'SET_SUPPLIERS', payload: data.suppliers });
        }

        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'success',
            title: 'Datos importados',
            message: 'Los datos se han importado correctamente'
          }
        });
      } catch (error) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'error',
            title: 'Error en importación',
            message: 'El archivo no es válido o está corrupto'
          }
        });
      }
    };
    input.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600">
            Gestiona la configuración de tu cuenta y preferencias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Información de la Empresa
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nombre de la Empresa
                        </label>
                        <input
                          type="text"
                          value={profile.companyName}
                          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          NIF/CIF
                        </label>
                        <input
                          type="text"
                          value={profile.taxId}
                          onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          value={profile.postalCode}
                          onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSave('profile')}
                        loading={isLoading}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Configuración de Notificaciones
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">Notificaciones por Email</p>
                            <p className="text-sm text-slate-600">Recibir notificaciones por correo electrónico</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">Notificaciones SMS</p>
                            <p className="text-sm text-slate-600">Recibir notificaciones por mensaje de texto</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">Recordatorios de Facturas</p>
                            <p className="text-sm text-slate-600">Recordatorios de facturas pendientes</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.invoiceReminders}
                            onChange={(e) => setNotifications({ ...notifications, invoiceReminders: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium text-slate-900">Alertas de Pago</p>
                            <p className="text-sm text-slate-600">Notificaciones de pagos y vencimientos</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.paymentAlerts}
                            onChange={(e) => setNotifications({ ...notifications, paymentAlerts: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSave('notifications')}
                        loading={isLoading}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Configuración de Seguridad
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Change Password */}
                      <div className="border border-slate-200 rounded-lg p-4">
                        <h3 className="font-medium text-slate-900 mb-4">Cambiar Contraseña</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Contraseña Actual
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={security.currentPassword}
                                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                className="input-field pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={security.newPassword}
                              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                              className="input-field"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Confirmar Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={security.confirmPassword}
                              onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Two Factor Authentication */}
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-slate-900">Autenticación de Dos Factores</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              Añade una capa extra de seguridad a tu cuenta
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={security.twoFactorEnabled}
                              onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSave('security')}
                        loading={isLoading}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Facturación y Suscripción
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="card-hover p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Plan Actual</h3>
                            <p className="text-slate-600">Plan Professional</p>
                            <p className="text-2xl font-bold text-primary-600 mt-2">€29.99/mes</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
                              Activo
                            </span>
                            <p className="text-sm text-slate-600 mt-2">
                              Próxima facturación: 15 Sep 2025
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-lg p-4">
                          <h4 className="font-medium text-slate-900 mb-2">Método de Pago</h4>
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-slate-600" />
                            <div>
                              <p className="text-sm text-slate-900">•••• •••• •••• 4242</p>
                              <p className="text-xs text-slate-600">Visa - Vence 12/27</p>
                            </div>
                          </div>
                          <button className="text-sm text-primary-600 hover:text-primary-700 mt-2">
                            Cambiar método de pago
                          </button>
                        </div>
                        
                        <div className="border border-slate-200 rounded-lg p-4">
                          <h4 className="font-medium text-slate-900 mb-2">Dirección de Facturación</h4>
                          <div className="text-sm text-slate-600">
                            <p>{profile.companyName}</p>
                            <p>{profile.address}</p>
                            <p>{profile.city}, {profile.postalCode}</p>
                            <p>{profile.country}</p>
                          </div>
                          <button className="text-sm text-primary-600 hover:text-primary-700 mt-2">
                            Actualizar dirección
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Gestión de Datos
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg p-4">
                        <h3 className="font-medium text-slate-900 mb-2">Exportar Datos</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Descarga una copia de todos tus datos en formato JSON
                        </p>
                        <Button
                          onClick={handleExportData}
                          variant="secondary"
                          leftIcon={<Download className="h-4 w-4" />}
                        >
                          Exportar Datos
                        </Button>
                      </div>
                      
                      <div className="border border-slate-200 rounded-lg p-4">
                        <h3 className="font-medium text-slate-900 mb-2">Importar Datos</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Importa datos desde un archivo CSV o JSON
                        </p>
                        <Button
                          onClick={handleImportData}
                          variant="secondary"
                          leftIcon={<Upload className="h-4 w-4" />}
                        >
                          Importar Datos
                        </Button>
                      </div>
                      
                      <div className="border border-danger-200 rounded-lg p-4 bg-danger-50">
                        <h3 className="font-medium text-danger-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Zona de Peligro
                        </h3>
                        <p className="text-sm text-danger-700 mb-4">
                          Estas acciones son irreversibles. Procede con precaución.
                        </p>
                        <div className="space-y-2">
                          <button className="text-sm text-danger-600 hover:text-danger-700 font-medium">
                            Eliminar todos los datos
                          </button>
                          <br />
                          <button className="text-sm text-danger-600 hover:text-danger-700 font-medium">
                            Cerrar cuenta permanentemente
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Preferencias de la Aplicación
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Idioma
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          className="input-field"
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Moneda
                        </label>
                        <select
                          value={preferences.currency}
                          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                          className="input-field"
                        >
                          <option value="EUR">Euro (€)</option>
                          <option value="USD">Dólar ($)</option>
                          <option value="GBP">Libra (£)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Formato de Fecha
                        </label>
                        <select
                          value={preferences.dateFormat}
                          onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                          className="input-field"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Zona Horaria
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                          className="input-field"
                        >
                          <option value="Europe/Madrid">Madrid (GMT+1)</option>
                          <option value="Europe/London">Londres (GMT+0)</option>
                          <option value="America/New_York">Nueva York (GMT-5)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tema
                        </label>
                        <select
                          value={preferences.theme}
                          onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
                          className="input-field"
                        >
                          <option value="light">Claro</option>
                          <option value="dark">Oscuro</option>
                          <option value="auto">Automático</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSave('preferences')}
                        loading={isLoading}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;