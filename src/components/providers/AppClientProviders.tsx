
"use client";

import { useEffect } from 'react';
import { useAppStore, defaultThemeColors, predefinedThemes } from '@/lib/store';
import { Toaster } from "@/components/ui/toaster";
import { useHydration } from '@/hooks/useHydration';
import type { ThemeColors } from '@/lib/types';

function applyThemeToDocument(colors: ThemeColors | Partial<ThemeColors>) {
  const root = document.documentElement;
  const completeColors = { ...defaultThemeColors, ...colors }; // Ensure all keys present

  Object.entries(completeColors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    if (value) {
      root.style.setProperty(cssVarName, value);
    } else {
      // This case should ideally not happen if we merge with defaultThemeColors
      const fallbackValue = defaultThemeColors[key as keyof ThemeColors];
      if (fallbackValue) {
         root.style.setProperty(cssVarName, fallbackValue);
      } else {
         root.style.removeProperty(cssVarName);
      }
    }
  });

  // Sidebar colors derivation (can be fine-tuned)
  const sidebarPrimary = completeColors.primary || defaultThemeColors.primary;
  const sidebarAccent = completeColors.accent || defaultThemeColors.accent;

  const sidebarBackground = completeColors.background ? `hsl(${completeColors.background.split(' ')[0]} ${parseFloat(completeColors.background.split(' ')[1]) * 0.95}% ${parseFloat(completeColors.background.split(' ')[2]) * 0.90}%)` : defaultThemeColors.card; // Slightly darker/muted version of main background or card
  root.style.setProperty('--sidebar-background', sidebarBackground);
  root.style.setProperty('--sidebar-foreground', completeColors.foreground || defaultThemeColors.foreground);
  
  root.style.setProperty('--sidebar-primary', sidebarPrimary);
  root.style.setProperty('--sidebar-primary-foreground', completeColors.primaryForeground || defaultThemeColors.primaryForeground);
  
  root.style.setProperty('--sidebar-accent', sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', completeColors.accentForeground || defaultThemeColors.accentForeground);
  
  const sidebarBorder = completeColors.border ? `hsl(${completeColors.border.split(' ')[0]} ${parseFloat(completeColors.border.split(' ')[1]) * 0.9}% ${parseFloat(completeColors.border.split(' ')[2]) * 0.95}%)` : defaultThemeColors.border;
  root.style.setProperty('--sidebar-border', sidebarBorder);
  root.style.setProperty('--sidebar-ring', completeColors.ring || defaultThemeColors.ring);
}

export function AppClientProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  const activeThemeIdentifier = useAppStore((state) => state.activeThemeIdentifier);
  // customThemes is also subscribed to ensure re-render if a custom theme is updated while active
  const customThemes = useAppStore((state) => state.customThemes); 
  const getActiveThemeColors = useAppStore((state) => state.getActiveThemeColors);

  useEffect(() => {
    if (hydrated) {
      const currentThemeColors = getActiveThemeColors();
      applyThemeToDocument(currentThemeColors);
    }
  }, [activeThemeIdentifier, customThemes, hydrated, getActiveThemeColors]);

  useEffect(() => {
    if (!hydrated) { 
        const initialColors = getActiveThemeColors(); 
        applyThemeToDocument(initialColors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  if (!hydrated) {
    return <>{children}<Toaster /></>;
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
