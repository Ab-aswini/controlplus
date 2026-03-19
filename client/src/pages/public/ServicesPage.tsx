import { Link } from 'react-router-dom';
import { Monitor, HardDrive, ArrowRight, CheckCircle, Wrench, BookOpen, Headphones } from 'lucide-react';
import ScrollReveal from '../../components/shared/ScrollReveal';

const softwareServices = [
  { category: 'billing', title: 'Billing & Invoicing', desc: 'GST-compliant billing software with barcode support, receipt printing, and detailed sales reports.', features: ['GST Auto-Calculation', 'Barcode Support', 'Multi-printer Support', 'Sales Reports'] },
  { category: 'inventory', title: 'Inventory Management', desc: 'Real-time stock tracking with low-stock alerts, purchase orders, and supplier management.', features: ['Real-time Tracking', 'Low Stock Alerts', 'Purchase Orders', 'Supplier Directory'] },
  { category: 'pos', title: 'Point of Sale', desc: 'Modern POS systems with touchscreen support, offline capability, and integrated payments.', features: ['Touchscreen Ready', 'Offline Mode', 'Barcode Scanning', 'Daily Reports'] },
  { category: 'crm', title: 'Customer CRM', desc: 'Track customer interactions, manage follow-ups, and analyze customer behavior patterns.', features: ['Contact Management', 'Follow-up Reminders', 'Behavior Analytics', 'Bulk Communication'] },
  { category: 'accounting', title: 'Accounting', desc: 'Easy-to-use accounting with profit/loss tracking, expense management, and GST returns.', features: ['P&L Tracking', 'Expense Management', 'GST Returns', 'Financial Reports'] },
];

const hardwareServices = [
  { title: 'Refurbished Laptops', desc: 'Quality-tested business laptops at 40-60% lower cost. Every unit undergoes thorough inspection and comes with fresh OS installation.', icon: Monitor },
  { title: 'POS Hardware', desc: 'Complete POS setups including receipt printers, barcode scanners, cash drawers, and customer displays.', icon: Wrench },
  { title: 'Printers & Peripherals', desc: 'Thermal receipt printers, dot matrix printers, label printers, and all accessories from top brands.', icon: HardDrive },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-lg text-primary-200">
              Complete software and hardware solutions tailored for small and medium businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Software */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Software Solutions</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareServices.map((svc, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 h-full flex flex-col hover-lift">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{svc.desc}</p>
                  <ul className="space-y-1.5 mb-4">
                    {svc.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/products?type=software&category=${svc.category}`}
                    className="text-accent-500 hover:text-accent-600 font-medium text-sm inline-flex items-center gap-1"
                  >
                    View Products <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hardware Solutions</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {hardwareServices.map((svc, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-full hover-lift">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                    <svc.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{svc.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Support Services */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Support & Training</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Wrench, title: 'Installation & Setup', desc: 'Free installation and configuration for all software products' },
              { icon: BookOpen, title: 'Training', desc: 'Hands-on training for your team to get started quickly' },
              { icon: Headphones, title: 'Annual Support', desc: '1 year of free technical support with every purchase' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover-lift">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-primary-200 mb-8">We can tailor our products to fit your specific business needs.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/25"
          >
            Get a Free Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
