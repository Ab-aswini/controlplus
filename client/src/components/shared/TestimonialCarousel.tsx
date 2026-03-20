import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ScrollReveal from './ScrollReveal';
import { cn } from '../../utils/cn';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

// Fallback if DB is empty or fetch fails
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Rajesh Kumar', role: 'Owner', company: 'Kumar General Store', quote: 'ControlPlus billing software transformed our shop operations. GST invoicing that used to take 15 minutes now takes 30 seconds. Highly recommend!', rating: 5 },
  { id: '2', name: 'Priya Sharma', role: 'Manager', company: 'Sharma Medical', quote: 'The inventory management system saved us from overstocking issues. Real-time alerts and supplier management features are a game changer.', rating: 5 },
  { id: '3', name: 'Amit Patel', role: 'Director', company: 'Patel Electronics', quote: 'We bought 5 refurbished laptops and they work perfectly. Great quality at 50% the price. The warranty support gives us peace of mind.', rating: 4 },
  { id: '4', name: 'Sunita Verma', role: 'Owner', company: 'Verma Textiles', quote: 'The POS system with barcode scanning sped up our billing process dramatically. The local support team helped us set everything up in one day.', rating: 5 },
];

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, name, role, company, quote, rating')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data);
      });
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const prev = () => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(c => (c + 1) % testimonials.length);

  if (testimonials.length === 0) return null;

  const t = testimonials[current];

  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Real feedback from real businesses</p>
          </div>
        </ScrollReveal>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white dark:bg-gray-800/80 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg dark:hover:shadow-primary-500/10 relative overflow-hidden transition-all duration-300"
            >
              {/* Decorative background quote mark */}
              <div className="absolute top-4 right-8 text-9xl font-serif text-gray-100 dark:text-gray-700/20 select-none z-0">
                &rdquo;
              </div>

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                  "{t.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow-inner">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.role}, <span className="text-primary-600 dark:text-primary-400">{t.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className="p-2.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    i === current
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 w-8'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-primary-300 dark:hover:bg-primary-600 w-2.5'
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-colors border border-gray-100 dark:border-gray-700"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
