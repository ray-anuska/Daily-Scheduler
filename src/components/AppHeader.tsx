
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { AuthPrompt } from '@/components/AuthPrompt';
import { Settings, Palette, ListChecks, LogIn, LogOut } from 'lucide-react';
import { useHydration } from '@/hooks/useHydration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { TemplateManager } from '@/components/TemplateManager';

export function AppHeader() {
  const hydrated = useHydration();
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !currentUser) {
      setAuthPromptOpen(true);
    }
  }, [hydrated, currentUser]);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!hydrated) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Palette className="h-7 w-7 text-accent opacity-50 animate-pulse" />
            <div className="h-7 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Palette className="h-7 w-7 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Habitual Calendar
            </h1>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setThemeSwitcherOpen(true)} aria-label="Customize Theme">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTemplateManagerOpen(true)} aria-label="Manage Templates">
              <ListChecks className="h-5 w-5" />
            </Button>

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Local User
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentUser(null)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => setAuthPromptOpen(true)}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            )}
          </div>
        </div>
      </header>
      <AuthPrompt open={authPromptOpen} onOpenChange={setAuthPromptOpen} />
      <ThemeSwitcher open={themeSwitcherOpen} onOpenChange={setThemeSwitcherOpen} />
      <TemplateManager open={templateManagerOpen} onOpenChange={setTemplateManagerOpen} />
    </>
  );
}
