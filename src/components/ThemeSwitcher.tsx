
"use client";

import { useState } from 'react';
import { useAppStore, defaultThemeColors } from '@/lib/store';
import type { CustomTheme, ThemeColors } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Palette } from 'lucide-react';

interface ThemeSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themeColorKeys = Object.keys(defaultThemeColors) as Array<keyof ThemeColors>;

export function ThemeSwitcher({ open, onOpenChange }: ThemeSwitcherProps) {
  const { toast } = useToast();
  const {
    customThemes,
    activeThemeId,
    addCustomTheme,
    setActiveThemeId,
    deleteCustomTheme,
    getActiveThemeColors,
  } = useAppStore();

  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColors, setNewThemeColors] = useState<Partial<ThemeColors>>(
    {}
  );

  const handleAddTheme = () => {
    if (!newThemeName.trim()) {
      toast({ title: 'Error', description: 'Theme name cannot be empty.', variant: 'destructive' });
      return;
    }
    // Basic validation for HSL format (e.g., "H S% L%") - can be more robust
    for (const key in newThemeColors) {
      const value = newThemeColors[key as keyof ThemeColors];
      if (value && !/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/.test(value)) {
        toast({ title: 'Error', description: `Invalid HSL format for ${key}. Expected 'H S% L%'.`, variant: 'destructive' });
        return;
      }
    }

    const themeToAdd: Omit<CustomTheme, 'id'> = {
      name: newThemeName.trim(),
      colors: { ...newThemeColors },
    };
    const addedTheme = addCustomTheme(themeToAdd);
    setActiveThemeId(addedTheme.id);
    setNewThemeName('');
    setNewThemeColors({});
    toast({ title: 'Theme Added', description: `${addedTheme.name} has been added and set as active.` });
  };

  const handleColorInputChange = (
    colorKey: keyof ThemeColors,
    value: string
  ) => {
    setNewThemeColors((prev) => ({ ...prev, [colorKey]: value }));
  };

  const currentActiveColors = getActiveThemeColors();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme Settings</DialogTitle>
          <DialogDescription>
            Customize the application&apos;s appearance. Select an active theme or create your own.
            Colors should be in HSL format (e.g., &quot;240 60% 94.1%&quot;).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-hidden min-h-0"> {/* Added min-h-0 */}
          <ScrollArea className="h-full pr-6">
            <div className="space-y-6 py-4"> {/* Moved py-4 here */}
              <div>
                <Label htmlFor="active-theme-select" className="text-sm font-medium">Active Theme</Label>
                <Select
                  value={activeThemeId || 'default'}
                  onValueChange={(value) => setActiveThemeId(value === 'default' ? null : value)}
                >
                  <SelectTrigger id="active-theme-select" className="mt-1">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Theme</SelectItem>
                    {customThemes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Create New Theme</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-theme-name">Theme Name</Label>
                    <Input
                      id="new-theme-name"
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      placeholder="My Awesome Theme"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {themeColorKeys.map((key) => (
                      <div key={key}>
                        <Label htmlFor={`theme-color-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input
                          id={`theme-color-${key}`}
                          value={newThemeColors[key] || ''}
                          onChange={(e) => handleColorInputChange(key, e.target.value)}
                          placeholder={defaultThemeColors[key]}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleAddTheme} className="w-full sm:w-auto">
                    Add and Activate Theme
                  </Button>
                </div>
              </div>

              {customThemes.length > 0 && <Separator />}

              {customThemes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Custom Themes</h3>
                  <div className="space-y-2">
                    {customThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                      >
                        <span className="font-medium">{theme.name}</span>
                        <div className="flex items-center gap-2">
                          {activeThemeId !== theme.id && (
                             <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveThemeId(theme.id)}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              deleteCustomTheme(theme.id);
                              toast({ title: 'Theme Deleted', description: `${theme.name} has been deleted.` });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
