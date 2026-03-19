import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function FloatingWhatsApp() {
  const { settings } = useSettings();

  // Only show if WhatsApp channel is globally enabled
  if (!settings?.order_channels?.whatsapp) return null;
  const phone = settings.contact_info?.whatsapp || '919876543210';

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi! I\'m interested in your products. Can you help me?')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110 group print:hidden"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
