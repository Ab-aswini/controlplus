import { Link } from 'react-router-dom';
import { Monitor, Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Control<span className="text-primary-400">Plus</span>
              </span>
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
                <span>{COMPANY_PHONE}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{COMPANY_EMAIL}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{COMPANY_ADDRESS}</span>
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
