import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MessageSquare, ShoppingCart, FileText, ArrowRight, Briefcase, Handshake, MessageCircle, Receipt, TrendingUp, RefreshCw } from 'lucide-react';
import { Stats, Inquiry, Order } from '../../types';
import { getStats, getOrderStatusBreakdown, getInquiryStatusBreakdown, OrderStatusBreakdown, InquiryStatusBreakdown } from '../../api/stats';
import { getInquiries } from '../../api/inquiries';
import { getOrders } from '../../api/orders';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import Skeleton from '../../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const INQUIRY_COLORS = {
  new: '#22c55e',
  contacted: '#3b82f6',
  closed: '#6b7280',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orderBreakdown, setOrderBreakdown] = useState<OrderStatusBreakdown | null>(null);
  const [inquiryBreakdown, setInquiryBreakdown] = useState<InquiryStatusBreakdown | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, orderData, inquiryData, inquiriesData, ordersData] = await Promise.all([
        getStats(),
        getOrderStatusBreakdown(),
        getInquiryStatusBreakdown(),
        getInquiries(),
        getOrders(),
      ]);

      setStats(statsData);
      setOrderBreakdown(orderData);
      setInquiryBreakdown(inquiryData);
      setRecentInquiries(inquiriesData.slice(0, 5));
      setRecentOrders(ordersData.slice(0, 5));
      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please refresh.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const statCards = stats ? [
    { label: 'Total Products', value: stats.products, icon: Package, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', link: '/admin/products' },
    { label: 'New Inquiries', value: stats.newInquiries, icon: MessageSquare, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', link: '/admin/inquiries' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', link: '/admin/orders' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: FileText, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', link: '/admin/blog' },
    { label: 'Services', value: stats.services, icon: Briefcase, gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30', link: '/admin/services' },
    { label: 'Partners', value: stats.partners, icon: Handshake, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', link: '/admin/partners' },
    { label: 'Testimonials', value: stats.testimonials, icon: MessageCircle, gradient: 'from-pink-500 to-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30', link: '/admin/testimonials' },
    { label: 'Invoices', value: stats.invoices, icon: Receipt, gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', link: '/admin/invoices' },
  ] : [];

  const orderChartData = orderBreakdown ? [
    { name: 'Pending', value: orderBreakdown.pending, fill: STATUS_COLORS.pending },
    { name: 'Confirmed', value: orderBreakdown.confirmed, fill: STATUS_COLORS.confirmed },
    { name: 'Delivered', value: orderBreakdown.delivered, fill: STATUS_COLORS.delivered },
    { name: 'Cancelled', value: orderBreakdown.cancelled, fill: STATUS_COLORS.cancelled },
  ] : [];

  const inquiryChartData = inquiryBreakdown ? [
    { name: 'New', value: inquiryBreakdown.new, fill: INQUIRY_COLORS.new },
    { name: 'Contacted', value: inquiryBreakdown.contacted, fill: INQUIRY_COLORS.contacted },
    { name: 'Closed', value: inquiryBreakdown.closed, fill: INQUIRY_COLORS.closed },
  ] : [];

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time data from your database</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Stat Cards — 4-column grid on desktop, 2-column on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats ? statCards.map(card => (
          <Link
            key={card.label}
            to={card.link}
            className={cn(
              'group relative rounded-xl border border-gray-200/80 dark:border-gray-800 p-4 sm:p-5 transition-all hover:shadow-lg hover:-translate-y-0.5',
              card.bg,
            )}
          >
            <div className={cn('w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3 shadow-sm', card.gradient)}>
              <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
            <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )) : (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <Skeleton className="w-10 h-10 mb-3 rounded-lg" />
              <Skeleton className="h-8 w-14 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Orders by Status</h3>
            <p className="text-xs text-gray-400 mb-4">{stats.orders} total orders</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderChartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {orderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Inquiries by Status</h3>
            <p className="text-xs text-gray-400 mb-4">{stats.inquiries} total inquiries</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inquiryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {inquiryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {inquiryChartData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Inquiries</h3>
            <Link to="/admin/inquiries" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentInquiries.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">No inquiries yet</p>
            ) : recentInquiries.map(inq => (
              <div key={inq.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inq.name}</p>
                  <p className="text-xs text-gray-400 truncate">{inq.phone}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                    inq.status === 'new' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : inq.status === 'contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  )}>{inq.status}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(inq.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">No orders yet</p>
            ) : recentOrders.map(order => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.customer_name}</p>
                  <p className="text-xs text-gray-400 truncate">{order.product_name || 'N/A'}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : order.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  )}>{order.status}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
