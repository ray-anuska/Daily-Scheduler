"use client";

import { useEffect } from 'react';
import { useAppStore, defaultThemeColors } from '@/lib/store';
import { Toaster } from "@/components/ui/toaster";
import { useHydration } from '@/hooks/useHydration';
import type { ThemeColors } from '@/lib/types';

function applyThemeToDocument(colors: ThemeColors) {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    if (value) {
      root.style.setProperty(cssVarName, value);
    } else {
      // Fallback to ensure CSS variable is cleared if value is undefined/null
      // This relies on globals.css having proper defaults.
      const defaultValue = defaultThemeColors[key as keyof ThemeColors];
      if (defaultValue) {
         root.style.setProperty(cssVarName, defaultValue);
      } else {
         root.style.removeProperty(cssVarName);
      }
    }
  });

  // Sidebar colors can be derived or explicitly set in the theme
  // For simplicity, we'll use primary/accent from the theme for sidebar
  const sidebarBackground = colors.primary ? `hsl(${colors.primary.split(' ')[0]} ${parseFloat(colors.primary.split(' ')[1]) * 0.8}% ${parseFloat(colors.primary.split(' ')[2]) * 0.95}%)` : defaultThemeColors.primary;
  root.style.setProperty('--sidebar-background', sidebarBackground);
  root.style.setProperty('--sidebar-foreground', colors.primaryForeground || defaultThemeColors.primaryForeground);
  root.style.setProperty('--sidebar-primary', colors.accent || defaultThemeColors.accent);
  root.style.setProperty('--sidebar-primary-foreground', colors.accentForeground || defaultThemeColors.accentForeground);
  root.style.setProperty('--sidebar-accent', colors.primary || defaultThemeColors.primary);
  root.style.setProperty('--sidebar-accent-foreground', colors.primaryForeground || defaultThemeColors.primaryForeground);
  const sidebarBorder = colors.primary ? `hsl(${colors.primary.split(' ')[0]} ${parseFloat(colors.primary.split(' ')[1]) * 0.7}% ${parseFloat(colors.primary.split(' ')[2]) * 0.9}%)` : defaultThemeColors.border;
  root.style.setProperty('--sidebar-border', sidebarBorder);
  root.style.setProperty('--sidebar-ring', colors.ring || defaultThemeColors.ring);
}

export function AppClientProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  // Subscribe to activeThemeId and customThemes to react to changes
  const activeThemeId = useAppStore((state) => state.activeThemeId);
  const customThemes = useAppStore((state) => state.customThemes);
  const getActiveThemeColors = useAppStore((state) => state.getActiveThemeColors);

  useEffect(() => {
    if (hydrated) {
      const currentThemeColors = getActiveThemeColors();
      applyThemeToDocument(currentThemeColors);
    }
  }, [activeThemeId, customThemes, hydrated, getActiveThemeColors]);

  // Apply default theme on initial load before hydration to minimize FOUC
  // This effect runs only once on the client after mount
  useEffect(() => {
    if (!hydrated) { // Should ideally run only once on initial client mount
        const initialColors = getActiveThemeColors(); // Gets persisted or default
        applyThemeToDocument(initialColors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Deliberately empty for one-time execution on client

  if (!hydrated) {
    // While not hydrated, you can render a loader or children with default styling
    // For now, render children to avoid layout shifts, assuming CSS defaults are okay
    return <>{children}<Toaster /></>; 
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
