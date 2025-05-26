"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { AuthPrompt } from '@/components/AuthPrompt';
import { Settings, Palette, ListChecks, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useHydration } from '@/hooks/useHydration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


// Placeholder components for dialogs - to be implemented later
const ThemeSwitcherDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Theme Settings</DialogTitle></DialogHeader>
      <p>Theme customization will be available here.</p>
    </DialogContent>
  </Dialog>
);

const TemplateManagerDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) => (
   <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Task Templates</DialogTitle></DialogHeader>
      <p>Template management will be available here.</p>
    </DialogContent>
  </Dialog>
);

// Import actual Dialog components if not already available globally
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


export function AppHeader() {
  const hydrated = useHydration();
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  // Effect to show auth prompt if no user and once hydrated
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
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-foreground bg-primary px-3 py-1 rounded-md">Habitual Calendar</h1>
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div> {/* Skeleton for avatar */}
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Palette className="h-7 w-7 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight">
              Habitual Calendar
            </h1>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
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
                    <Avatar className="h-9 w-9">
                      {/* Placeholder for actual avatar image if feature is added */}
                      {/* <AvatarImage src="/avatars/01.png" alt={currentUser.name} /> */}
                      <AvatarFallback className="bg-primary text-primary-foreground">
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
      <ThemeSwitcherDialog open={themeSwitcherOpen} onOpenChange={setThemeSwitcherOpen} />
      <TemplateManagerDialog open={templateManagerOpen} onOpenChange={setTemplateManagerOpen} />
    </>
  );
}
