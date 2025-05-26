"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import type { User } from '@/lib/types';
import { useHydration } from '@/hooks/useHydration';

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthPrompt({ open, onOpenChange }: AuthPromptProps) {
  const hydrated = useHydration();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (name.trim()) {
      const newUser: User = {
        id: crypto.randomUUID(), 
        name: name.trim(),
      };
      setCurrentUser(newUser);
      onOpenChange(false);
      setName('');
    }
  };

  if (!hydrated) {
    return null; 
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Welcome to Habitual Calendar</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please enter your name to personalize your experience. Your data is stored locally on this device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Your Name"
              aria-label="Your Name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleLogin} disabled={!name.trim()} className="w-full sm:w-auto">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
