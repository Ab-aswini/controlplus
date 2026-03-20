import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Monitor, HardDrive, Headphones, IndianRupee, Shield, Award, ChevronDown } from 'lucide-react';
import { Product, FAQ } from '../../types';
import { getProducts } from '../../api/products';
import { getFaqs } from '../../api/stats';
import ProductCard from '../../components/shared/ProductCard';
import ScrollReveal from '../../components/shared/ScrollReveal';
import HeroSection from '../../components/shared/HeroSection';
import StatsStrip from '../../components/shared/StatsStrip';
import TestimonialCarousel from '../../components/shared/TestimonialCarousel';
import ClientsSection from '../../components/shared/ClientsSection';
import ProcessTimeline from '../../components/shared/ProcessTimeline';

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        {faq.question}
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
        >
          {faq.answer}
        </motion.div>
      )}
    </div>
  );
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    getProducts({ featured: true }).then(setFeatured).catch(() => {});
    getFaqs().then(setFaqs).catch(() => {});
  }, []);

  const softwareProducts = featured.filter(p => p.type === 'software');
  const hardwareProducts = featured.filter(p => p.type === 'hardware');

  return (
    <div>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Stats Strip */}
      <StatsStrip />

      {/* 3. Services */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What We Offer</h2>
              <p className="text-gray-500 dark:text-gray-400">Complete business solutions under one roof</p>
            </div>
          </ScrollReveal>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Monitor,
                title: 'Software Solutions',
                desc: 'GST-compliant billing, inventory, POS, CRM, and accounting software designed for Indian businesses.',
                color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
                link: '/products?type=software',
              },
              {
                icon: HardDrive,
                title: 'Hardware Solutions',
                desc: 'Quality new & refurbished laptops, printers, scanners, and POS equipment with warranty.',
                color: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
                link: '/products?type=hardware',
              },
              {
                icon: Headphones,
                title: 'Support & Training',
                desc: 'Free installation, hands-on training, and dedicated support team for all products.',
                color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
                link: '/services',
              },
            ].map((svc, i) => (
              <motion.div key={i} variants={staggerItem}>
                <Link
                  to={svc.link}
                  className="block bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition transform duration-300 h-full group"
                >
                  <div className={`w-14 h-14 rounded-xl ${svc.color} flex items-center justify-center mb-5`}>
                    <svc.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{svc.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{svc.desc}</p>
                  <span className="text-accent-500 font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-transform">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Software Showcase */}
      {softwareProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Software Products</h2>
                  <p className="text-gray-500 dark:text-gray-400">Business software that drives growth</p>
                </div>
                <Link to="/products?type=software" className="hidden md:inline-flex items-center gap-2 text-accent-500 hover:text-accent-600 font-medium">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {softwareProducts.slice(0, 4).map(product => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-8 md:hidden">
              <Link to="/products?type=software" className="inline-flex items-center gap-2 text-accent-500 font-medium">
                View All Software <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Hardware Showcase */}
      {hardwareProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Hardware Products</h2>
                  <p className="text-gray-500 dark:text-gray-400">Quality hardware with warranty</p>
                </div>
                <Link to="/products?type=hardware" className="hidden md:inline-flex items-center gap-2 text-accent-500 hover:text-accent-600 font-medium">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {hardwareProducts.slice(0, 4).map(product => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-8 md:hidden">
              <Link to="/products?type=hardware" className="inline-flex items-center gap-2 text-accent-500 font-medium">
                View All Hardware <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. Testimonials */}
      <TestimonialCarousel />

      {/* 6b. Our Clients */}
      <ClientsSection />

      {/* 7. Why Choose Us */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="heading-underline text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose ControlPlus?</h2>
            </div>
          </ScrollReveal>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { icon: IndianRupee, title: 'Affordable Pricing', desc: 'Solutions that fit your budget. No hidden costs.' },
              { icon: Shield, title: 'GST Compliant', desc: 'All software is GST-ready with auto tax calculation.' },
              { icon: Award, title: 'Warranty Included', desc: 'Every product backed by comprehensive warranty.' },
              { icon: Headphones, title: 'Local Support', desc: 'Dedicated support team for installation & training.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <div className="group text-center p-4 sm:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-300 h-full">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-all duration-300">
                    <item.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base sm:text-lg">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 8. Process Timeline */}
      <ProcessTimeline />

      {/* 9. FAQ */}
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

      {/* 10. CTA Section */}
      {/* 10. CTA Section */}
      <section className="relative py-20 bg-primary-900 border-t border-primary-800 text-white overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-dot-pattern opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-md">
            Ready to Build Your Business?
          </h2>
          <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Get in touch with us today for a free consultation and demo of our products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-950 font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Get in Touch
            </Link>
            <a
              href="https://wa.me/919658791783"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
