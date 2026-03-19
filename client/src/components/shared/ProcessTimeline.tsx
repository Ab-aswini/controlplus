import { motion } from 'framer-motion';
import { Phone, MonitorPlay, Settings, HeadphonesIcon } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    icon: Phone,
    title: 'Contact Us',
    description: 'Reach out via phone, WhatsApp, or our contact form.',
    color: 'bg-blue-100 dark:bg-blue-950 text-blue-600',
  },
  {
    icon: MonitorPlay,
    title: 'Free Demo',
    description: 'We schedule a free demo tailored to your needs.',
    color: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600',
  },
  {
    icon: Settings,
    title: 'Setup & Install',
    description: 'We install, configure, and train your team.',
    color: 'bg-green-100 dark:bg-green-950 text-green-600',
  },
  {
    icon: HeadphonesIcon,
    title: 'Ongoing Support',
    description: 'Dedicated support to keep everything running smooth.',
    color: 'bg-purple-100 dark:bg-purple-950 text-purple-600',
  },
];

export default function ProcessTimeline() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Getting started with ControlPlus is simple. Four easy steps to transform your business.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* SVG Line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0">
            <svg className="w-full h-2" viewBox="0 0 1000 8" preserveAspectRatio="none">
              <motion.line
                x1="125" y1="4" x2="875" y2="4"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#486581" />
                  <stop offset="50%" stopColor="#FF7A00" />
                  <stop offset="100%" stopColor="#486581" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="relative text-center">
                  {/* Step number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center z-10 shadow-lg shadow-accent-500/30">
                    {i + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4 mt-2`}>
                    <step.icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
