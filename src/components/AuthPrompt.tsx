
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email.trim() && password.trim()) { // Basic check for email and password presence
      const nameFromEmail = email.split('@')[0];
      const newUser: User = {
        id: crypto.randomUUID(),
        name: nameFromEmail,
        email: email.trim(),
      };
      setCurrentUser(newUser);
      onOpenChange(false);
      setEmail('');
      setPassword('');
    }
  };

  if (!hydrated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Welcome to Daily Scheduler</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please enter your email and password. For now, this is a demo login; your data is stored locally.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="your@email.com"
              aria-label="Your Email"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="Your Password"
              aria-label="Your Password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleLogin} disabled={!email.trim() || !password.trim()} className="w-full sm:w-auto">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
