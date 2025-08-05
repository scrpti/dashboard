'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Euro, 
  Users, 
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi, DashboardData, formatCurrency, formatDate } from '@/lib/api';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [error, setError] = useState<string | null>(null);

  // Datos hardcodeados para demostración (reemplazar con API real)
  const company_phone = '+34644451595';

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getDashboard({
        company_phone,
        period
      });
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Error cargando datos');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error conectando con el servidor');
      
      // Datos de fallback para demostración
      setDashboardData({
        period,
        metrics: {
          total_invoices: 45,
          total_amount: 12450.75,
          avg_amount: 276.68,
          unique_suppliers: 12,
          pending_invoices: 8,
          confirmed_invoices: 32,
          paid_invoices: 5,
          overdue_invoices: 3,
          amount_change_percent: 15.2,
          invoices_change_percent: 8.5
        },
        top_categories: [
          { category: 'Suministros', invoice_count: 15, total_amount: 4250.00, avg_amount: 283.33 },
          { category: 'Servicios', invoice_count: 12, total_amount: 3680.50, avg_amount: 306.71 },
          { category: 'Oficina', invoice_count: 8, total_amount: 1890.25, avg_amount: 236.28 },
          { category: 'Tecnología', invoice_count: 6, total_amount: 1620.00, avg_amount: 270.00 },
          { category: 'Transporte', invoice_count: 4, total_amount: 1010.00, avg_amount: 252.50 }
        ],
        top_suppliers: [
          { supplier_name: 'Iberdrola', invoice_count: 6, total_amount: 1890.50, avg_amount: 315.08, last_invoice_date: '2025-08-01' },
          { supplier_name: 'Vodafone España', invoice_count: 4, total_amount: 1245.80, avg_amount: 311.45, last_invoice_date: '2025-07-28' },
          { supplier_name: 'Office Depot', invoice_count: 8, total_amount: 980.25, avg_amount: 122.53, last_invoice_date: '2025-07-30' }
        ],
        monthly_trend: [
          { month: '2025-02-01', invoice_count: 28, total_amount: 8950.25, avg_amount: 319.65 },
          { month: '2025-03-01', invoice_count: 32, total_amount: 10240.80, avg_amount: 320.03 },
          { month: '2025-04-01', invoice_count: 35, total_amount: 11890.45, avg_amount: 339.73 },
          { month: '2025-05-01', invoice_count: 29, total_amount: 9560.30, avg_amount: 329.67 },
          { month: '2025-06-01', invoice_count: 38, total_amount: 12890.75, avg_amount: 339.23 },
          { month: '2025-07-01', invoice_count: 45, total_amount: 15450.90, avg_amount: 343.35 }
        ],
        generated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'primary' }) => (
    <div className="card p-6 hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-50`}>
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-success-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-danger-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                change >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PeriodSelector: React.FC = () => (
    <div className="flex rounded-lg bg-slate-100 p-1">
      {[
        { key: '7d', label: '7d' },
        { key: '30d', label: '30d' },
        { key: '90d', label: '90d' },
        { key: '1y', label: '1a' }
      ].map((option) => (
        <button
          key={option.key}
          onClick={() => setPeriod(option.key as any)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            period === option.key
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 loading-skeleton"></div>
            <div className="h-10 w-32 loading-skeleton rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 loading-skeleton rounded-lg"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 w-20 loading-skeleton"></div>
                    <div className="h-6 w-16 loading-skeleton"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-warning-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Error cargando datos</h3>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 btn-primary"
          >
            Reintentar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = dashboardData?.metrics;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">
              Resumen de los últimos {period === '7d' ? '7 días' : period === '30d' ? '30 días' : period === '90d' ? '90 días' : 'año'}
            </p>
          </div>
          <PeriodSelector />
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Facturas"
            value={metrics?.total_invoices || 0}
            change={metrics?.invoices_change_percent}
            icon={<FileText className="h-6 w-6" />}
            color="primary"
          />
          <StatCard
            title="Importe Total"
            value={formatCurrency(metrics?.total_amount || 0)}
            change={metrics?.amount_change_percent}
            icon={<Euro className="h-6 w-6" />}
            color="success"
          />
          <StatCard
            title="Proveedores"
            value={metrics?.unique_suppliers || 0}
            icon={<Users className="h-6 w-6" />}
            color="warning"
          />
          <StatCard
            title="Pendientes"
            value={metrics?.pending_invoices || 0}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="danger"
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia mensual */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Tendencia de Gastos
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.monthly_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short' })}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Importe']}
                    labelFormatter={(value) => formatDate(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_amount" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución por categorías */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Gastos por Categoría
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.top_categories || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total_amount"
                    nameKey="category"
                    label={({ category, total_amount }) => 
                      `${category}: ${formatCurrency(total_amount)}`
                    }
                  >
                    {(dashboardData?.top_categories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top proveedores */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Principales Proveedores
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Facturas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Última Factura
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(dashboardData?.top_suppliers || []).map((supplier, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {supplier.supplier_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {supplier.invoice_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(supplier.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatCurrency(supplier.avg_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(supplier.last_invoice_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;