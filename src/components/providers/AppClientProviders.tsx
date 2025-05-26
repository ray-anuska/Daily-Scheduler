
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

  // Ensure new task background CSS variables are set
  root.style.setProperty('--task-pending-background', completeColors.taskPendingBackground);
  root.style.setProperty('--task-completed-background', completeColors.taskCompletedBackground);


  // Sidebar colors derivation
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
  const activeThemeIdentifier = useAppStore((state) => state.activeThemeIdentifier);
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
