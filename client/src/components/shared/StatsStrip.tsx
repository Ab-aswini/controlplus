import { Users, Package, Monitor, HeadphonesIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

function StatItem({ end, suffix, label, icon: Icon }: {
  end: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
}) {
  const { ref, value } = useCountUp(end);

  return (
    <div ref={ref} className="text-center group">
      <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-accent-500/20 transition-colors">
        <Icon className="w-6 h-6 text-accent-500" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        {value}{suffix}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem end={500} suffix="+" label="Happy Clients" icon={Users} />
          <StatItem end={15} suffix="+" label="Software Products" icon={Monitor} />
          <StatItem end={1000} suffix="+" label="Hardware Sold" icon={Package} />
          <StatItem end={24} suffix="/7" label="Support Available" icon={HeadphonesIcon} />
        </div>
      </div>
    </section>
  );
}
