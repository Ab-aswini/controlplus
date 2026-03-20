import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

// Fallback hardcoded list (used if no DB data)
const FALLBACK_LOGOS = [
  'Tally', 'Dell', 'HP', 'Lenovo', 'Epson', 'TVS', 'Honeywell',
  'Microsoft', 'Zebra', 'Canon', 'Brother', 'Asus',
];

export default function LogoSlider() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('partners')
      .select('id, name, logo_url, website_url')
      .eq('type', 'technology')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setPartners(data);
        setLoaded(true);
      });
  }, []);

  // If DB has logos, use them. Otherwise fallback to text list.
  const hasDbLogos = partners.length > 0;
  const displayNames = hasDbLogos ? partners.map(p => p.name) : FALLBACK_LOGOS;
  const tripled = [...displayNames, ...displayNames, ...displayNames];

  return (
    <div className="w-full relative py-6 flex flex-col items-center">
      {/* Creative Title */}
      <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800"></span>
        Trusted Technologies We Work With
        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800"></span>
      </h3>
      
      {/* Slider Container with gradient masking for smooth fade edges */}
      <div className="w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-scroll-logos hover:[animation-play-state:paused] items-center">
          {tripled.map((name, i) => {
            const partner = hasDbLogos ? partners.find(p => p.name === name) : null;
            const hasImage = partner && partner.logo_url;
            return (
              <a
                key={i}
                href={partner?.website_url || '#'}
                target={partner?.website_url ? "_blank" : undefined}
                rel={partner?.website_url ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center mx-3 md:mx-5 shrink-0 group relative p-1 cursor-pointer"
                onClick={(e) => !partner?.website_url && e.preventDefault()}
              >
                <div className="px-6 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary-200 dark:group-hover:border-primary-800">
                  {hasImage ? (
                    <img src={partner.logo_url} alt={name} className="h-8 md:h-10 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <span className="text-lg md:text-xl font-bold bg-gradient-to-br from-gray-700 to-gray-400 dark:from-gray-300 dark:to-gray-600 bg-clip-text text-transparent group-hover:from-accent-600 group-hover:to-accent-400 dark:group-hover:from-accent-400 dark:group-hover:to-accent-200 transition-all duration-300">
                      {name}
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
