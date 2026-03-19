import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ClientPartner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

export default function ClientsSection() {
  const [clients, setClients] = useState<ClientPartner[]>([]);

  useEffect(() => {
    supabase
      .from('partners')
      .select('id, name, logo_url, website_url')
      .eq('type', 'client')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setClients(data);
      });
  }, []);

  if (clients.length === 0) return null;

  // Triple for seamless infinite scroll
  const tripled = [...clients, ...clients, ...clients];

  return (
    <div className="w-full relative py-6 flex flex-col items-center bg-white dark:bg-gray-950">
      {/* Title — same style as LogoSlider */}
      <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800"></span>
        Our Valued Clients
        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800"></span>
      </h3>

      {/* Slider with gradient fade edges */}
      <div className="w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-scroll-logos hover:[animation-play-state:paused] items-center">
          {tripled.map((client, i) => (
            <div
              key={i}
              className="inline-flex items-center justify-center mx-3 md:mx-5 shrink-0 group relative p-1"
            >
              <div className="px-6 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary-200 dark:group-hover:border-primary-800 flex items-center gap-3">
                {client.logo_url ? (
                  <img src={client.logo_url} alt={client.name} className="h-8 md:h-10 w-auto max-w-[120px] object-contain" />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold text-sm md:text-base flex-shrink-0">
                    {client.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm md:text-base font-semibold bg-gradient-to-br from-gray-700 to-gray-400 dark:from-gray-300 dark:to-gray-600 bg-clip-text text-transparent group-hover:from-accent-600 group-hover:to-accent-400 dark:group-hover:from-accent-400 dark:group-hover:to-accent-200 transition-all duration-300 whitespace-nowrap">
                  {client.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
