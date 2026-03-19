import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Service } from '../../types';
import { getServices } from '../../api/services';
import ScrollReveal from '../../components/shared/ScrollReveal';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices(true).then(setServices).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const software = services.filter(s => s.type === 'software').sort((a, b) => a.sort_order - b.sort_order);
  const hardware = services.filter(s => s.type === 'hardware').sort((a, b) => a.sort_order - b.sort_order);
  const support = services.filter(s => s.type === 'support').sort((a, b) => a.sort_order - b.sort_order);

  const SkeletonCards = ({ count = 3 }: { count?: number }) => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-3" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );

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
      {(loading || software.length > 0) && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Software Solutions</h2>
            </ScrollReveal>
            {loading ? <SkeletonCards count={4} /> : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {software.map((svc, i) => (
                  <ScrollReveal key={svc.id} delay={i * 0.1}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 h-full flex flex-col hover:-translate-y-1 transition-transform shadow-sm">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{svc.title}</h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 flex-1 line-clamp-3 sm:line-clamp-none">{svc.description}</p>
                      {svc.features && svc.features.length > 0 && (
                        <ul className="space-y-1.5 mb-3 sm:mb-4 hidden xs:block">
                          {svc.features.map((f, j) => (
                            <li key={j} className="flex items-start gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-500 shrink-0 mt-0.5" /> <span className="line-clamp-1">{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {svc.product_link && (
                        <Link
                          to={svc.product_link}
                          className="text-accent-500 hover:text-accent-600 font-medium text-[10px] sm:text-sm inline-flex items-center gap-1 mt-auto shrink-0"
                        >
                          View Products <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                        </Link>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hardware */}
      {(loading || hardware.length > 0) && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Hardware Solutions</h2>
            </ScrollReveal>
            {loading ? <SkeletonCards /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {hardware.map((svc, i) => (
                  <ScrollReveal key={svc.id} delay={i * 0.1}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 h-full hover:-translate-y-1 transition-transform shadow-sm">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{svc.title}</h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-3 sm:line-clamp-none leading-relaxed">{svc.description}</p>
                      {svc.product_link && (
                        <Link
                          to={svc.product_link}
                          className="text-accent-500 hover:text-accent-600 font-medium text-[10px] sm:text-sm inline-flex items-center gap-1 mt-3"
                        >
                          View Products <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                        </Link>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Support Services */}
      {(loading || support.length > 0) && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Support & Training</h2>
            </ScrollReveal>
            {loading ? <SkeletonCards /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
                {support.map((svc, i) => (
                  <ScrollReveal key={svc.id} delay={i * 0.1}>
                    <div className="text-center p-4 sm:p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:-translate-y-1 transition-transform h-full shadow-sm">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">{svc.title}</h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{svc.description}</p>
                      {svc.features && svc.features.length > 0 && (
                        <ul className="mt-3 space-y-1 hidden sm:block">
                          {svc.features.map((f, j) => (
                            <li key={j} className="text-xs text-gray-400 flex items-center justify-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
