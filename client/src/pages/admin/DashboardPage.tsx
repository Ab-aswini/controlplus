import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MessageSquare, ShoppingCart, FileText, ArrowRight } from 'lucide-react';
import { Stats, Inquiry, Order } from '../../types';
import { getStats, getOrderStatusBreakdown, getInquiryStatusBreakdown, OrderStatusBreakdown, InquiryStatusBreakdown } from '../../api/stats';
import { getInquiries } from '../../api/inquiries';
import { getOrders } from '../../api/orders';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import Skeleton from '../../components/ui/Skeleton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [statsData, orderData, inquiryData, inquiriesData, ordersData] = await Promise.all([
          getStats(),
          getOrderStatusBreakdown(),
          getInquiryStatusBreakdown(),
          getInquiries(),
          getOrders(),
        ]);

        if (mounted) {
          setStats(statsData);
          setOrderBreakdown(orderData);
          setInquiryBreakdown(inquiryData);
          setRecentInquiries(inquiriesData.slice(0, 5));
          setRecentOrders(ordersData.slice(0, 5));
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        if (mounted) setError('Failed to load dashboard data. Please refresh.');
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  const statCards = stats ? [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-100 dark:bg-blue-950 text-blue-600', link: '/admin/products' },
    { label: 'New Inquiries', value: stats.newInquiries, icon: MessageSquare, color: 'bg-green-100 dark:bg-green-950 text-green-600', link: '/admin/inquiries' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, color: 'bg-amber-100 dark:bg-amber-950 text-amber-600', link: '/admin/orders' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'bg-purple-100 dark:bg-purple-950 text-purple-600', link: '/admin/blog' },
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
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats ? statCards.map(card => (
          <Link key={card.label} to={card.link} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', card.color)}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{card.label}</div>
          </Link>
        )) : (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <Skeleton className="w-10 h-10 mb-3" />
              <Skeleton className="h-7 w-12 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        )}
      </div>

      {/* Charts - Real Data */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 h-80">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={orderChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {orderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 h-80">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Inquiries by Status</h3>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={inquiryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {inquiryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Inquiries</h3>
            <Link to="/admin/inquiries" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentInquiries.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 text-center">No inquiries yet</p>
            ) : recentInquiries.map(inq => (
              <div key={inq.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inq.name}</p>
                  <p className="text-xs text-gray-500">{inq.phone}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    inq.status === 'new' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : inq.status === 'contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  )}>{inq.status}</span>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(inq.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 text-center">No orders yet</p>
            ) : recentOrders.map(order => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.customer_name}</p>
                  <p className="text-xs text-gray-500 truncate">{order.product_name || 'N/A'}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : order.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  )}>{order.status}</span>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
