import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { submitInquiry } from '../../api/inquiries';
import { useSettings } from '../../context/SettingsContext';
import { COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS, WHATSAPP_NUMBER, COMPANY_SUPPORT_PHONE } from '../../utils/constants';
import ScrollReveal from '../../components/shared/ScrollReveal';
import { toast } from 'sonner';

export default function ContactPage() {
  const { settings } = useSettings();
  const phone = settings?.contact_info?.phone || COMPANY_PHONE;
  const email = settings?.contact_info?.email || COMPANY_EMAIL;
  const address = settings?.contact_info?.address || COMPANY_ADDRESS;
  const whatsapp = settings?.contact_info?.whatsapp || WHATSAPP_NUMBER;

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitInquiry({ ...form, source: 'contact_form' });
      setSubmitted(true);
      setForm({ name: '', phone: '', email: '', message: '' });
      toast.success('Message sent successfully!');
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-50 dark:bg-gray-900 py-16 md:py-24 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] dark:opacity-10 mix-blend-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions about our products or need a custom solution? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <ScrollReveal className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
              {[
                { icon: Phone, label: 'Sales & Inquiry', value: phone },
                { icon: Phone, label: 'Technical Support', value: COMPANY_SUPPORT_PHONE },
                { icon: Mail, label: 'Email', value: email },
                { icon: MapPin, label: 'Address', value: address },
                { icon: Clock, label: 'Business Hours', value: 'Mon - Sat: 10:00 AM - 7:00 PM' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${whatsapp}?text=Hi, I need help with your products.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={0.1} className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">We've received your message and will get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        aria-label="Your Name"
                        placeholder="Your Name *"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        aria-label="Phone Number"
                        placeholder="Phone Number *"
                        required
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      aria-label="Email Address"
                      placeholder="Email Address (optional)"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                    <textarea
                      required
                      name="message"
                      id="message"
                      aria-label="Your Message"
                      placeholder="Your Message (optional)"
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Map */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <iframe
              title="ControlPlus Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d234.5!2d83.4734726!3d20.7070229!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a240f0d6aa5733b%3A0x4d3e2446152614ab!2sGyanodaya%20Academy!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
              width="100%"
              height="350"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full border-0"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
