'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  DollarSign,
  Users,
  FileText,
  Target
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi, DashboardData, formatCurrency, formatDate } from '@/lib/api';

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('90d');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'suppliers'>('overview');

  const company_phone = '+34644451595';

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getDashboard({
        company_phone,
        period
      });
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError(response.error || 'Error cargando analytics');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Error conectando con el servidor');
      
      // Extended fallback data for analytics
      setAnalyticsData({
        period,
        metrics: {
          total_invoices: 156,
          total_amount: 45250.75,
          avg_amount: 290.07,
          unique_suppliers: 28,
          pending_invoices: 22,
          confirmed_invoices: 98,
          paid_invoices: 36,
          overdue_invoices: 8,
          amount_change_percent: 18.5,
          invoices_change_percent: 12.3
        },
        top_categories: [
          { category: 'Suministros', invoice_count: 45, total_amount: 15250.00, avg_amount: 338.89 },
          { category: 'Servicios', invoice_count: 38, total_amount: 12680.50, avg_amount: 333.96 },
          { category: 'Oficina', invoice_count: 32, total_amount: 8920.25, avg_amount: 278.76 },
          { category: 'Tecnología', invoice_count: 25, total_amount: 6890.00, avg_amount: 275.60 },
          { category: 'Transporte', invoice_count: 16, total_amount: 1510.00, avg_amount: 94.38 }
        ],
        top_suppliers: [
          { supplier_name: 'Iberdrola', invoice_count: 12, total_amount: 4890.50, avg_amount: 407.54, last_invoice_date: '2025-08-01' },
          { supplier_name: 'Vodafone España', invoice_count: 10, total_amount: 2145.80, avg_amount: 214.58, last_invoice_date: '2025-07-28' },
          { supplier_name: 'Amazon Business', invoice_count: 15, total_amount: 1980.25, avg_amount: 132.02, last_invoice_date: '2025-07-30' },
          { supplier_name: 'Microsoft', invoice_count: 6, total_amount: 1650.00, avg_amount: 275.00, last_invoice_date: '2025-07-25' },
          { supplier_name: 'Repsol', invoice_count: 8, total_amount: 1420.60, avg_amount: 177.58, last_invoice_date: '2025-07-29' }
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
    subtitle?: string;
  }> = ({ title, value, change, icon, color = 'primary', subtitle }) => (
    <div className="card p-6 hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-50`}>
            <div className={`text-${color}-600`}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {change !== undefined && (
          <div className="flex items-center">
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

  const TabSelector: React.FC = () => (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-8">
        {[
          { key: 'overview', label: 'Vista General', icon: BarChart3 },
          { key: 'trends', label: 'Tendencias', icon: TrendingUp },
          { key: 'categories', label: 'Categorías', icon: Target },
          { key: 'suppliers', label: 'Proveedores', icon: Users }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 loading-skeleton"></div>
            <div className="h-10 w-32 loading-skeleton rounded-lg"></div>
          </div>
          <div className="h-12 w-full loading-skeleton"></div>
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

  const metrics = analyticsData?.metrics;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600">
              Análisis detallado de {period === '7d' ? '7 días' : period === '30d' ? '30 días' : period === '90d' ? '90 días' : 'año'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector />
            <button className="btn-secondary flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(metrics?.total_amount || 0)}
            change={metrics?.amount_change_percent}
            icon={<DollarSign className="h-6 w-6" />}
            color="success"
            subtitle="Últimos 90 días"
          />
          <StatCard
            title="Facturas Procesadas"
            value={metrics?.total_invoices || 0}
            change={metrics?.invoices_change_percent}
            icon={<FileText className="h-6 w-6" />}
            color="primary"
          />
          <StatCard
            title="Promedio por Factura"
            value={formatCurrency(metrics?.avg_amount || 0)}
            icon={<Target className="h-6 w-6" />}
            color="warning"
          />
          <StatCard
            title="Proveedores Activos"
            value={metrics?.unique_suppliers || 0}
            icon={<Users className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div className="px-6 pt-6">
            <TabSelector />
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Evolución Mensual de Gastos
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData?.monthly_trend || []}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}
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
                        <Area 
                          type="monotone" 
                          dataKey="total_amount" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Distribution */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Estado de Facturas
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pendientes', value: metrics?.pending_invoices || 0, color: '#f59e0b' },
                            { name: 'Confirmadas', value: metrics?.confirmed_invoices || 0, color: '#10b981' },
                            { name: 'Pagadas', value: metrics?.paid_invoices || 0, color: '#3b82f6' },
                            { name: 'Vencidas', value: metrics?.overdue_invoices || 0, color: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { color: '#f59e0b' },
                            { color: '#10b981' },
                            { color: '#3b82f6' },
                            { color: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Resumen Rápido
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Facturas Pendientes</span>
                      <span className="font-semibold text-warning-600">{metrics?.pending_invoices || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Facturas Vencidas</span>
                      <span className="font-semibold text-danger-600">{metrics?.overdue_invoices || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Promedio Mensual</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency((metrics?.total_amount || 0) / 6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                {/* Invoice Count Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Número de Facturas por Mes
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData?.monthly_trend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short' })}
                          stroke="#64748b"
                        />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value: any) => [value, 'Facturas']}
                          labelFormatter={(value) => formatDate(value)}
                        />
                        <Bar dataKey="invoice_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Average Amount Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Importe Promedio por Factura
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData?.monthly_trend || []}>
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
                          formatter={(value: any) => [formatCurrency(value), 'Promedio']}
                          labelFormatter={(value) => formatDate(value)}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avg_amount" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Distribución por Categorías
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData?.top_categories || []}
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
                          {(analyticsData?.top_categories || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories Table */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Detalle por Categorías
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Categoría
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Facturas
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(analyticsData?.top_categories || []).map((category, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                {category.category}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {category.invoice_count}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                              {formatCurrency(category.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Análisis de Proveedores
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Proveedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Facturas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Promedio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Última Factura
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(analyticsData?.top_suppliers || []).map((supplier, index) => (
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;