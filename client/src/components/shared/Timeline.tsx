import ScrollReveal from './ScrollReveal';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

const milestones: TimelineItem[] = [
  { year: '2021', title: 'ControlPlus Founded', description: 'Started with a vision to make business technology accessible to every small business in India.' },
  { year: '2022', title: 'First 100 Clients', description: 'Reached our first milestone of 100 happy clients using our billing and inventory software.' },
  { year: '2023', title: 'Hardware Division Launch', description: 'Expanded into refurbished laptops and POS hardware, offering complete business solutions.' },
  { year: '2024', title: '500+ Businesses Served', description: 'Crossed 500 clients milestone with expansion into multiple cities and product categories.' },
  { year: '2025', title: 'Cloud & Integration', description: 'Launched cloud-based solutions with integrated CRM, analytics, and multi-location support.' },
];

export default function Timeline() {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-600 via-accent-500 to-primary-600" />

      <div className="space-y-12">
        {milestones.map((item, i) => (
          <ScrollReveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
            <div className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent-500 border-4 border-white dark:border-gray-950 z-10 shadow-lg shadow-accent-500/30" />

              {/* Content */}
              <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                <span className="inline-block text-sm font-bold text-accent-500 mb-1">{item.year}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
