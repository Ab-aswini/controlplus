import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Inquiry } from '../../types';
import { getInquiries, updateInquiryStatus, deleteInquiry } from '../../api/inquiries';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'] as const;
const STATUS_TABS = [{ value: '', label: 'All' }, { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'closed', label: 'Closed' }];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = (status?: string) => {
    setLoading(true);
    getInquiries(status).then(setInquiries).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter || undefined); }, [filter]);

  const handleStatus = async (id: number, status: string) => {
    try {
      await updateInquiryStatus(id, status);
      load(filter || undefined);
    } catch { alert('Failed to update status'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inquiry?')) return;
    try { await deleteInquiry(id); load(filter || undefined); } catch { alert('Failed to delete'); }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              filter === tab.value ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 font-medium text-gray-500">Message</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" /></td>)}
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No inquiries found</td></tr>
              ) : inquiries.map(inq => (
                <tr key={inq.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{inq.name}</td>
                  <td className="px-4 py-3 text-gray-500">{inq.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{inq.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{inq.product_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{inq.message || '-'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={inq.status}
                      onChange={e => handleStatus(inq.id, e.target.value)}
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded-lg border-0 outline-none cursor-pointer',
                        inq.status === 'new' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : inq.status === 'contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      )}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(inq.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(inq.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
