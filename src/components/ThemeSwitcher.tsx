
"use client";

import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Palette } from 'lucide-react';

interface ThemeSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themeColorKeys = Object.keys(defaultThemeColors) as Array<keyof ThemeColors>;

const commonNamedColors: Array<{ name: string; hsl: string }> = [
  { name: "White", hsl: "0 0% 100%" },
  { name: "Off-White", hsl: "0 0% 98%" },
  { name: "Light Gray", hsl: "0 0% 96%" },
  { name: "Medium Gray", hsl: "0 0% 50%" },
  { name: "Dark Gray", hsl: "0 0% 20%" },
  { name: "Near Black", hsl: "240 10% 3.9%"},
  { name: "Black", hsl: "0 0% 0%" },
  { name: "Soft Blue", hsl: "210 60% 95%" },
  { name: "Sky Blue", hsl: "207 90% 54%" },
  { name: "Forest Green", hsl: "120 39% 49%" },
  { name: "Sunny Yellow", hsl: "54 100% 70%" },
  { name: "Warm Orange", hsl: "30 100% 65%" },
  { name: "Crimson Red", hsl: "0 80% 60%" },
  { name: "Soft Pink", hsl: "340 80% 95%" },
  { name: "Lavender", hsl: "240 60% 90%" },
];

const getOptionsForKey = (key: keyof ThemeColors): Array<{ label: string; value: string }> => {
  const defaultOption = { label: `Default (${defaultThemeColors[key]})`, value: defaultThemeColors[key] };
  
  const standardOptions = commonNamedColors.map(c => ({
    label: `${c.name} (${c.hsl})`,
    value: c.hsl,
  }));

  const customOption = { label: "Custom HSL", value: "__CUSTOM__" };

  // Combine, ensuring default is first, then unique common colors, then custom
  const combinedOptions = [defaultOption, ...standardOptions, customOption];
  
  // Remove duplicates by HSL value, keeping the first occurrence (preferring default label if HSL matches a common)
  const uniqueOptionsByValue = Array.from(new Map(combinedOptions.map(item => [item.value, item])).values());
  
  return uniqueOptionsByValue;
};


export function ThemeSwitcher({ open, onOpenChange }: ThemeSwitcherProps) {
  const { toast } = useToast();
  const {
    customThemes,
    activeThemeId,
    addCustomTheme,
    setActiveThemeId,
    deleteCustomTheme,
  } = useAppStore();

  // State for the "Create New Theme" form
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColors, setNewThemeColors] = useState<Partial<ThemeColors>>(() => ({ ...defaultThemeColors }));
  const [selectedColorOptions, setSelectedColorOptions] = useState<Partial<Record<keyof ThemeColors, string>>>(() => {
    const initialSelections: Partial<Record<keyof ThemeColors, string>> = {};
    themeColorKeys.forEach(key => {
      initialSelections[key] = defaultThemeColors[key];
    });
    return initialSelections;
  });
  const [customHSLInputsVisible, setCustomHSLInputsVisible] = useState<Partial<Record<keyof ThemeColors, boolean>>>(() => {
    const initialVisibility: Partial<Record<keyof ThemeColors, boolean>> = {};
    themeColorKeys.forEach(key => {
      initialVisibility[key] = false;
    });
    return initialVisibility;
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewThemeName('');
      setNewThemeColors({ ...defaultThemeColors });
      const initialSelections: Partial<Record<keyof ThemeColors, string>> = {};
      const initialVisibility: Partial<Record<keyof ThemeColors, boolean>> = {};
      themeColorKeys.forEach(key => {
        initialSelections[key] = defaultThemeColors[key];
        initialVisibility[key] = false;
      });
      setSelectedColorOptions(initialSelections);
      setCustomHSLInputsVisible(initialVisibility);
    }
  }, [open]);

  const handleAddTheme = () => {
    if (!newThemeName.trim()) {
      toast({ title: 'Error', description: 'Theme name cannot be empty.', variant: 'destructive' });
      return;
    }

    const finalThemeColors: Partial<ThemeColors> = {};
    for (const key of themeColorKeys) {
      const colorValue = newThemeColors[key];
      if (colorValue && !/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/.test(colorValue)) {
        toast({ title: 'Error', description: `Invalid HSL format for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}. Expected 'H S% L%'.`, variant: 'destructive' });
        return;
      }
      if (colorValue) {
        finalThemeColors[key] = colorValue;
      }
    }

    const themeToAdd: Omit<CustomTheme, 'id'> = {
      name: newThemeName.trim(),
      colors: finalThemeColors,
    };
    const addedTheme = addCustomTheme(themeToAdd);
    setActiveThemeId(addedTheme.id);
    // Reset form fields after adding
    setNewThemeName('');
    setNewThemeColors({ ...defaultThemeColors });
     const initialSelections: Partial<Record<keyof ThemeColors, string>> = {};
      const initialVisibility: Partial<Record<keyof ThemeColors, boolean>> = {};
      themeColorKeys.forEach(key => {
        initialSelections[key] = defaultThemeColors[key];
        initialVisibility[key] = false;
      });
    setSelectedColorOptions(initialSelections);
    setCustomHSLInputsVisible(initialVisibility);

    toast({ title: 'Theme Added', description: `${addedTheme.name} has been added and set as active.` });
  };

  const handleColorOptionChange = (colorKey: keyof ThemeColors, selectedValue: string) => {
    setSelectedColorOptions(prev => ({ ...prev, [colorKey]: selectedValue }));
    if (selectedValue === "__CUSTOM__") {
      setCustomHSLInputsVisible(prev => ({ ...prev, [colorKey]: true }));
      // When switching to custom, ensure newThemeColors[colorKey] retains its current value,
      // or set it to the default for that key if it's undefined, so the input isn't blank.
      if (!newThemeColors[colorKey]) {
        setNewThemeColors(prev => ({...prev, [colorKey]: defaultThemeColors[colorKey]}));
      }
    } else {
      setCustomHSLInputsVisible(prev => ({ ...prev, [colorKey]: false }));
      setNewThemeColors(prev => ({ ...prev, [colorKey]: selectedValue }));
    }
  };

  const handleCustomHSLInputChange = (colorKey: keyof ThemeColors, hslValue: string) => {
    setNewThemeColors(prev => ({ ...prev, [colorKey]: hslValue }));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme Settings</DialogTitle>
          <DialogDescription>
            Customize the application&apos;s appearance. Select an active theme or create your own.
            HSL format: e.g., &quot;240 60% 94.1%&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto min-h-0">
          <div className="space-y-6 p-4">
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
              <div className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {themeColorKeys.map((key) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={`theme-select-${key}`} className="capitalize text-sm">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedColorOptions[key] || defaultThemeColors[key]}
                          onValueChange={(value) => handleColorOptionChange(key, value)}
                        >
                          <SelectTrigger id={`theme-select-${key}`} className="flex-grow">
                            <SelectValue placeholder={`Select ${key}...`} />
                          </SelectTrigger>
                          <SelectContent>
                            {getOptionsForKey(key).map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {customHSLInputsVisible[key] && (
                          <Input
                            id={`theme-hsl-${key}`}
                            value={newThemeColors[key] || ''}
                            onChange={(e) => handleCustomHSLInputChange(key, e.target.value)}
                            placeholder={defaultThemeColors[key]}
                            className="flex-grow"
                            aria-label={`${key} HSL value`}
                          />
                        )}
                      </div>
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
                          aria-label={`Delete theme ${theme.name}`}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

