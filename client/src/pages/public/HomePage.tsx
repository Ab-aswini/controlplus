import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Monitor, HardDrive, Shield, HeadphonesIcon, IndianRupee, Award, ChevronDown } from 'lucide-react';
import { Product, FAQ } from '../../types';
import { getProducts } from '../../api/products';
import { getFaqs } from '../../api/stats';
import ProductCard from '../../components/shared/ProductCard';
import ScrollReveal from '../../components/shared/ScrollReveal';

function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary-600">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        {faq.question}
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400"
        >
          {faq.answer}
        </motion.div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    getProducts({ featured: true }).then(setFeatured).catch(() => {});
    getFaqs().then(setFaqs).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Powering Small Businesses Across India
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              Complete software solutions and quality hardware for billing, inventory, POS, and more. Everything your business needs to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Explore Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value="500+" label="Happy Clients" />
            <StatCounter value="10+" label="Software Products" />
            <StatCounter value="1000+" label="Hardware Sold" />
            <StatCounter value="24/7" label="Support Available" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Products</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                  Handpicked solutions trusted by businesses like yours
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 6).map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 0.1}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Overview */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What We Offer</h2>
              <p className="text-gray-500 dark:text-gray-400">Complete business solutions under one roof</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Software Solutions</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  GST-compliant billing, inventory management, POS systems, CRM, and accounting software designed for Indian businesses.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Billing & Invoicing</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Inventory Management</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Point of Sale (POS)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> CRM & Accounting</li>
                </ul>
                <Link to="/products?type=software" className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1">
                  Explore Software <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-xl flex items-center justify-center mb-4">
                  <HardDrive className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hardware Solutions</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Quality-tested new and refurbished laptops, printers, barcode scanners, and POS equipment with warranty.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Business Laptops</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Receipt & Label Printers</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Barcode Scanners</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> POS Equipment</li>
                </ul>
                <Link to="/products?type=hardware" className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1">
                  Explore Hardware <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose ControlPlus?</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: IndianRupee, title: 'Affordable Pricing', desc: 'Solutions that fit your budget. No hidden costs.' },
              { icon: Shield, title: 'GST Compliant', desc: 'All software is GST-ready with auto tax calculation.' },
              { icon: Award, title: 'Warranty Included', desc: 'Every product backed by comprehensive warranty.' },
              { icon: HeadphonesIcon, title: 'Local Support', desc: 'Dedicated support team for installation & training.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
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

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              </div>
            </ScrollReveal>
            <div className="space-y-3">
              {faqs.map(faq => (
                <FAQItem key={faq.id} faq={faq} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Get in touch with us today for a free consultation and demo of our products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              Get in Touch
            </Link>
            <a
              href={`https://wa.me/919876543210`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
