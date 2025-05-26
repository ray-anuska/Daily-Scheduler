
"use client";

import { useEffect } from 'react';
import { useAppStore, defaultThemeColors } from '@/lib/store';
import { Toaster } from "@/components/ui/toaster";
import { useHydration } from '@/hooks/useHydration';
import type { ThemeColors } from '@/lib/types';

function applyThemeToDocument(colors: ThemeColors | Partial<ThemeColors>) {
  const root = document.documentElement;
  const completeColors = { ...defaultThemeColors, ...colors };

  Object.entries(completeColors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    if (value) {
      root.style.setProperty(cssVarName, value);
    } else {
      const fallbackValue = defaultThemeColors[key as keyof ThemeColors];
      if (fallbackValue) {
         root.style.setProperty(cssVarName, fallbackValue);
      } else {
         root.style.removeProperty(cssVarName); 
      }
    }
  });

  root.style.setProperty('--task-pending-background', completeColors.taskPendingBackground);
  root.style.setProperty('--task-completed-background', completeColors.taskCompletedBackground);

  const sidebarPrimary = completeColors.primary; 
  const sidebarAccent = completeColors.accent;   

  const sidebarBackground = completeColors.background ? `hsl(${completeColors.background.split(' ')[0]} ${parseFloat(completeColors.background.split(' ')[1]) * 0.95}% ${parseFloat(completeColors.background.split(' ')[2]) * 0.90}%)` : defaultThemeColors.card; 
  root.style.setProperty('--sidebar-background', sidebarBackground);
  root.style.setProperty('--sidebar-foreground', completeColors.foreground);
  
  root.style.setProperty('--sidebar-primary', sidebarPrimary);
  root.style.setProperty('--sidebar-primary-foreground', completeColors.primaryForeground);
  
  root.style.setProperty('--sidebar-accent', sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', completeColors.accentForeground);
  
  const sidebarBorder = completeColors.border ? `hsl(${completeColors.border.split(' ')[0]} ${parseFloat(completeColors.border.split(' ')[1]) * 0.9}% ${parseFloat(completeColors.border.split(' ')[2]) * 0.95}%)` : defaultThemeColors.border;
  root.style.setProperty('--sidebar-border', sidebarBorder);
  root.style.setProperty('--sidebar-ring', completeColors.ring);
}

export function AppClientProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  
  // Subscribe to user-specific theme data
  const currentUser = useAppStore((state) => state.currentUser);
  const currentUserId = currentUser?.id || 'guest';
  
  const activeThemeIdentifier = useAppStore((state) => state.userActiveThemeIdentifiers[currentUserId] || 'default_light');
  const customThemesForCurrentUser = useAppStore((state) => state.userCustomThemes[currentUserId] || []);
  const getActiveThemeColors = useAppStore((state) => state.getActiveThemeColors);


  useEffect(() => {
    if (hydrated) {
      const currentThemeColors = getActiveThemeColors();
      applyThemeToDocument(currentThemeColors);
    }
  }, [activeThemeIdentifier, customThemesForCurrentUser, hydrated, getActiveThemeColors, currentUserId]); // Added currentUserId

  useEffect(() => {
    if (!hydrated) { 
        const initialColors = getActiveThemeColors(); 
        applyThemeToDocument(initialColors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial call, getActiveThemeColors will use guest or persisted user

  if (!hydrated) {
    // During SSR or before hydration, we still want to apply a theme (likely default or guest's last)
    // The useEffect above handles applying theme once hydrated.
    // The initial render for SSR should use getActiveThemeColors which defaults to guest/default.
    return <>{children}<Toaster /></>;
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
