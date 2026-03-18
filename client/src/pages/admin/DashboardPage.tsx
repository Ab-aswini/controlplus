import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MessageSquare, ShoppingCart, FileText, ArrowRight } from 'lucide-react';
import { Stats, Inquiry, Order } from '../../types';
import { getStats } from '../../api/stats';
import { getInquiries } from '../../api/inquiries';
import { getOrders } from '../../api/orders';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getInquiries().then(data => setRecentInquiries(data.slice(0, 5))).catch(() => {});
    getOrders().then(data => setRecentOrders(data.slice(0, 5))).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-100 dark:bg-blue-950 text-blue-600', link: '/admin/products' },
    { label: 'New Inquiries', value: stats.newInquiries, icon: MessageSquare, color: 'bg-green-100 dark:bg-green-950 text-green-600', link: '/admin/inquiries' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, color: 'bg-amber-100 dark:bg-amber-950 text-amber-600', link: '/admin/orders' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'bg-purple-100 dark:bg-purple-950 text-purple-600', link: '/admin/blog' },
  ] : [];

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
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
              <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            </div>
          ))
        )}
      </div>

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
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{inq.name}</p>
                  <p className="text-xs text-gray-500">{inq.phone}</p>
                </div>
                <div className="text-right">
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
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{order.product_name || 'N/A'}</p>
                </div>
                <div className="text-right">
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
