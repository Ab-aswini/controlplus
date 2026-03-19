import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SiteSettings, OrderChannels, getAllSettings, getProductChannels } from '../api/settings';

interface SettingsContextType {
  settings: SiteSettings | null;
  isLoaded: boolean;
  reload: () => Promise<void>;
  getChannelsForProduct: (productChannels: OrderChannels | null) => OrderChannels;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const FALLBACK_CHANNELS: OrderChannels = {
  email: true,
  whatsapp: true,
  inquiry_form: true,
  online_payment: false,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAllSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getChannelsForProduct = useCallback(
    (productChannels: OrderChannels | null): OrderChannels => {
      return getProductChannels(
        productChannels,
        settings?.order_channels || FALLBACK_CHANNELS
      );
    },
    [settings]
  );

  return (
    <SettingsContext.Provider value={{ settings, isLoaded, reload: load, getChannelsForProduct }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
