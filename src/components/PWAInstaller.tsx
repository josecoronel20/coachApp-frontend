'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [userRole, setUserRole] = useState<'coach' | 'athlete' | null>(null);

  useEffect(() => {
    // Detect user role and show prompt only in specific contexts
    const path = window.location.pathname;
    
    // Coach: show only in dashboard pages
    if (path.startsWith('/dashboard')) {
      setUserRole('coach');
    } 
    // Athlete: show only in athlete home page (not in session pages)
    else if (path.match(/^\/athlete\/[^\/]+$/)) {
      setUserRole('athlete');
    } else {
      setUserRole(null);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show prompt if user is in the right context
      if (userRole === 'coach' || userRole === 'athlete') {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [userRole]);

  // Effect to handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      // Coach: show only in dashboard pages
      if (path.startsWith('/dashboard')) {
        setUserRole('coach');
      } 
      // Athlete: show only in athlete home page (not in session pages)
      else if (path.match(/^\/athlete\/[^\/]+$/)) {
        setUserRole('athlete');
      } else {
        setUserRole(null);
        setShowInstallPrompt(false);
      }
    };

    // Listen for route changes (for SPA navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Also check on mount
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !deferredPrompt || !userRole) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="CoachApp" className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Instalar CoachApp
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userRole === 'coach' 
                ? 'Gestiona atletas desde tu pantalla de inicio'
                : userRole === 'athlete'
                ? 'Accede a tus rutinas desde tu pantalla de inicio'
                : 'Acceso rápido desde tu pantalla de inicio'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-1" />
            Instalar
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
