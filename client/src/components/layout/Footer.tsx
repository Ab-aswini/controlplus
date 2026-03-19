import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS } from '../../utils/constants';
import Logo from '../ui/Logo';

export default function Footer() {
  const { settings } = useSettings();
  const phone = settings?.contact_info?.phone || COMPANY_PHONE;
  const email = settings?.contact_info?.email || COMPANY_EMAIL;
  const address = settings?.contact_info?.address || COMPANY_ADDRESS;
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <Logo dark />
            </Link>
            <p className="text-sm leading-relaxed">
              Your trusted partner for business software solutions and quality hardware. Empowering small businesses across India.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Products</Link></li>
              <li><Link to="/services" className="hover:text-primary-400 transition-colors">Services</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?type=software&category=billing" className="hover:text-primary-400 transition-colors">Billing Software</Link></li>
              <li><Link to="/products?type=software&category=inventory" className="hover:text-primary-400 transition-colors">Inventory Management</Link></li>
              <li><Link to="/products?type=software&category=pos" className="hover:text-primary-400 transition-colors">POS Systems</Link></li>
              <li><Link to="/products?type=hardware&category=laptop" className="hover:text-primary-400 transition-colors">Business Laptops</Link></li>
              <li><Link to="/products?type=hardware&category=printer" className="hover:text-primary-400 transition-colors">Printers & Scanners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{phone}</span>
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

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ControlPlus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
