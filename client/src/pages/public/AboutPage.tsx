import { Link } from 'react-router-dom';
import { Target, Eye, Users, Award, Shield, HeadphonesIcon, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/shared/ScrollReveal';
import Timeline from '../../components/shared/Timeline';
import ScrollExpandMedia from '../../components/ui/scroll-expansion-hero';

export default function AboutPage() {
  return (
    <>
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1"
        posterSrc="https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg"
        bgImageSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"
        title="About ControlPlus"
        date="Our Mission"
        scrollToExpand="Scroll downwards to discover our story"
        textBlend={false}
      >
        <div className="bg-white dark:bg-gray-950 w-full">
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                ControlPlus was founded with a simple belief: every business, regardless of size, deserves access to quality technology. We noticed that small shop owners and local businesses were struggling with outdated systems or couldn't afford enterprise-grade solutions.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                That's why we built ControlPlus — a one-stop shop for business software and hardware. From GST-compliant billing software to quality refurbished laptops, we provide everything a business needs to digitize and grow, all at prices that make sense.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-950 dark:to-gray-900 rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">500+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">3+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">1000+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">24/7</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Support</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
              <p className="text-gray-500 dark:text-gray-400">Key milestones in the ControlPlus story</p>
            </div>
          </ScrollReveal>
          <Timeline />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 h-full">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To make quality business technology accessible and affordable for every small and medium business in India. We believe in empowering entrepreneurs with the right tools to succeed in the digital economy.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 h-full">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-accent-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To become India's most trusted name in business technology solutions, known for quality products, honest pricing, and exceptional after-sales support.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Sets Us Apart</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Users, title: 'Customer First', desc: "Every decision we make starts with our customers' needs." },
              { icon: Award, title: 'Quality Assured', desc: 'Rigorous testing and quality checks on every product.' },
              { icon: Shield, title: 'Honest Pricing', desc: 'Transparent pricing with no hidden costs or surprises.' },
              { icon: HeadphonesIcon, title: 'Dedicated Support', desc: 'Local support team for setup, training, and troubleshooting.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-primary-200 mb-8">Ready to take your business to the next level?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/25"
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
        </div>
      </ScrollExpandMedia>
    </>
  );
}
