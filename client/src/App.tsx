import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { Toaster } from 'sonner';

import ProgressBar from './components/shared/ProgressBar';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import ContactPage from './pages/public/ContactPage';

import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsManagePage from './pages/admin/ProductsManagePage';
import InquiriesPage from './pages/admin/InquiriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import BlogManagePage from './pages/admin/BlogManagePage';
import UsersManagePage from './pages/admin/UsersManagePage';
import SettingsPage from './pages/admin/SettingsPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import PartnersManagePage from './pages/admin/PartnersManagePage';
import TestimonialsManagePage from './pages/admin/TestimonialsManagePage';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800">404</h1>
      <p className="text-lg text-gray-500 mt-4">Page not found</p>
      <a href="/" className="mt-6 text-primary-600 hover:text-primary-700 font-medium">Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <ProgressBar />
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Admin Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/products" element={<ProductsManagePage />} />
                <Route path="/admin/inquiries" element={<InquiriesPage />} />
                <Route path="/admin/orders" element={<OrdersPage />} />
                <Route path="/admin/blog" element={<BlogManagePage />} />
                <Route path="/admin/users" element={<UsersManagePage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/invoices" element={<InvoicesPage />} />
                <Route path="/admin/partners" element={<PartnersManagePage />} />
                <Route path="/admin/testimonials" element={<TestimonialsManagePage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
