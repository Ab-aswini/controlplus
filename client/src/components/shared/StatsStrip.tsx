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
      <div className="relative w-12 h-12 flex items-center justify-center mx-auto mb-3">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent-500/20 rounded-xl blur-md scale-50 group-hover:scale-110 group-hover:bg-accent-500/30 transition-all duration-300" />
        <div className="relative w-full h-full bg-accent-500/10 rounded-xl flex items-center justify-center border border-accent-500/20 group-hover:border-accent-500/40 transition-colors">
          <Icon className="w-6 h-6 text-accent-500 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        {value}{suffix}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-y border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
      {/* Decorative Aurora background blur */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-100/50 dark:bg-primary-600/10 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-100/50 dark:bg-accent-500/10 rounded-full blur-[100px] -translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
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
