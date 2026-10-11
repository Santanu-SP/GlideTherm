import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { TopBar } from './TopBar.js';
import { ApiService, FALLBACK_LOCATIONS, FALLBACK_PROFILES } from '../services/api.js';
import { LocationInfo, WorkerProfile } from '../types/index.js';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface AppContextType {
  locations: LocationInfo[];
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  profiles: WorkerProfile[];
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AppContext = createContext<AppContextType>({
  locations: FALLBACK_LOCATIONS,
  selectedLocationId: 'chennai',
  setSelectedLocationId: () => {},
  profiles: FALLBACK_PROFILES,
  showToast: () => {},
});

export const useApp = () => useContext(AppContext);

export const AppShell: React.FC = () => {
  const [locations, setLocations] = useState<LocationInfo[]>(FALLBACK_LOCATIONS);
  const [profiles, setProfiles] = useState<WorkerProfile[]>(FALLBACK_PROFILES);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('chennai');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Toast system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    ApiService.getConfig()
      .then((cfg) => {
        if (cfg.supportedLocations?.length) setLocations(cfg.supportedLocations);
        if (cfg.workerProfiles?.length) setProfiles(cfg.workerProfiles);
      })
      .catch((err) => console.warn('Using fallback config', err));
  }, []);

  return (
    <AppContext.Provider
      value={{
        locations,
        selectedLocationId,
        setSelectedLocationId,
        profiles,
        showToast,
      }}
    >
      <div className="flex h-screen bg-canvas overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
            <div
              className="fixed inset-0 bg-charcoal-950/50 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 bg-white h-full shadow-2xl flex flex-col">
              <div className="p-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <TopBar
            locations={locations}
            selectedLocationId={selectedLocationId}
            onLocationChange={setSelectedLocationId}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Global Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-forest-950 text-white shadow-xl text-xs font-medium animate-slide-up border border-forest-800">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};
