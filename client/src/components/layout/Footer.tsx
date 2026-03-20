import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS, COMPANY_SUPPORT_PHONE } from '../../utils/constants';
import Logo from '../ui/Logo';

export default function Footer() {
  const { settings } = useSettings();
  const phone = settings?.contact_info?.phone || COMPANY_PHONE;
  const email = settings?.contact_info?.email || COMPANY_EMAIL;
  const address = settings?.contact_info?.address || COMPANY_ADDRESS;
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 gap-y-10">
          <div className="col-span-2 md:col-span-1 relative">
            {/* Subtle glow behind logo */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />
            <Link to="/" className="flex items-center mb-4 relative z-10">
              <Logo dark />
            </Link>
            <p className="text-sm leading-relaxed relative z-10">
              Your trusted partner for business software solutions and quality hardware. Empowering small businesses across India.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Products</Link></li>
              <li><Link to="/services" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Services</Link></li>
              <li><Link to="/blog" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Blog</Link></li>
              <li><Link to="/about" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>About Us</Link></li>
              <li><Link to="/contact" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Contact</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?type=software&category=billing" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Billing Software</Link></li>
              <li><Link to="/products?type=software&category=inventory" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Inventory Management</Link></li>
              <li><Link to="/products?type=software&category=pos" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>POS Systems</Link></li>
              <li><Link to="/products?type=hardware&category=laptop" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Business Laptops</Link></li>
              <li><Link to="/products?type=hardware&category=printer" className="group inline-flex items-center hover:text-primary-400 transition-colors"><span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-accent-500">›</span>Printers & Scanners</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" />
                <div className="flex flex-col">
                  <span>{phone} <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1 ml-1">Sales</span></span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" />
                <div className="flex flex-col">
                  <span>{COMPANY_SUPPORT_PHONE} <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1 ml-1">Support</span></span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ControlPlus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
