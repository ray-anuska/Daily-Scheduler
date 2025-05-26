
"use client";

import { useState, useEffect } from 'react';
import { useAppStore, defaultThemeColors, predefinedThemes } from '@/lib/store';
import type { CustomTheme, ThemeColors, PredefinedTheme } from '@/lib/types';
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
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Palette, Edit3, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Ensure all keys from ThemeColors are included, especially new ones
const themeColorKeys = Object.keys(defaultThemeColors) as Array<keyof ThemeColors>;


const commonNamedColors: Array<{ name: string; hsl: string }> = [
  { name: "White", hsl: "0 0% 100%" },
  { name: "Off-White", hsl: "0 0% 98%" },
  { name: "Light Gray", hsl: "0 0% 96.1%" },
  { name: "Medium Gray", hsl: "0 0% 50%" },
  { name: "Dark Gray", hsl: "0 0% 20%" },
  { name: "Near Black", hsl: "240 10% 3.9%"},
  { name: "Black", hsl: "0 0% 0%" },
  { name: "Soft Lavender", hsl: "240 60% 94.1%" },
  { name: "Dusty Rose", hsl: "300 26% 86%" },
  { name: "Sky Blue", hsl: "207 90% 54%" },
  { name: "Forest Green", hsl: "120 39% 49%" },
  { name: "Sunny Yellow", hsl: "54 100% 70%" },
  { name: "Warm Orange", hsl: "30 100% 65%" },
  { name: "Crimson Red", hsl: "0 80% 60%" },
  { name: "Grass Green", hsl: "120 60% 40%" },
  { name: "Light Steel Blue", hsl: "210 30% 70%" },
];

const getOptionsForKey = (key: keyof ThemeColors, baseColors: ThemeColors = defaultThemeColors): Array<{ label: string; value: string }> => {
  const defaultValueForKey = baseColors[key] || defaultThemeColors[key]; // Fallback to absolute default
  const defaultOption = { label: `Default (${defaultValueForKey})`, value: defaultValueForKey };

  const standardOptions = commonNamedColors.map(c => ({
    label: `${c.name} (${c.hsl})`,
    value: c.hsl,
  }));

  const customOption = { label: "Custom HSL", value: "__CUSTOM__" };
  const combinedOptions = [defaultOption, ...standardOptions, customOption];
  const uniqueOptionsByValue = Array.from(new Map(combinedOptions.map(item => [item.value, item])).values());
  return uniqueOptionsByValue;
};


export function ThemeSwitcher({ open, onOpenChange }: ThemeSwitcherProps) {
  const { toast } = useToast();
  const {
    customThemes,
    activeThemeIdentifier,
    addCustomTheme,
    updateCustomTheme,
    setActiveThemeIdentifier,
    deleteCustomTheme,
  } = useAppStore();

  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [formThemeName, setFormThemeName] = useState('');
  const [formThemeColors, setFormThemeColors] = useState<Partial<ThemeColors>>(() => ({ ...defaultThemeColors }));
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

  const resetFormToCreateMode = () => {
    setEditingTheme(null);
    setFormThemeName('');
    const initialColors = { ...defaultThemeColors };
    setFormThemeColors(initialColors);
    const initialSelections: Partial<Record<keyof ThemeColors, string>> = {};
    const initialVisibility: Partial<Record<keyof ThemeColors, boolean>> = {};
    themeColorKeys.forEach(key => {
      initialSelections[key] = initialColors[key];
      initialVisibility[key] = false;
    });
    setSelectedColorOptions(initialSelections);
    setCustomHSLInputsVisible(initialVisibility);
  };
  
  useEffect(() => {
    if (open) {
      resetFormToCreateMode();
    }
  }, [open]);


  const handleStartEdit = (themeToEdit: CustomTheme) => {
    setEditingTheme(themeToEdit);
    setFormThemeName(themeToEdit.name);
    
    const fullColorsToEdit = { ...defaultThemeColors, ...themeToEdit.colors };
    setFormThemeColors(fullColorsToEdit);

    const newSelectedOptions: Partial<Record<keyof ThemeColors, string>> = {};
    const newCustomHSLVisible: Partial<Record<keyof ThemeColors, boolean>> = {};

    themeColorKeys.forEach(key => {
      const colorValue = fullColorsToEdit[key];
      const options = getOptionsForKey(key, defaultThemeColors); 
      const matchingOption = options.find(opt => opt.value === colorValue && opt.value !== "__CUSTOM__");

      if (matchingOption) {
        newSelectedOptions[key] = matchingOption.value;
        newCustomHSLVisible[key] = false;
      } else {
        newSelectedOptions[key] = "__CUSTOM__";
        newCustomHSLVisible[key] = true;
      }
    });
    setSelectedColorOptions(newSelectedOptions);
    setCustomHSLInputsVisible(newCustomHSLVisible);
  };

  const handleSaveOrAddTheme = () => {
    if (!formThemeName.trim()) {
      toast({ title: 'Error', description: 'Theme name cannot be empty.', variant: 'destructive' });
      return;
    }

    const finalThemeColors: Partial<ThemeColors> = {};
    for (const key of themeColorKeys) {
      const colorValue = formThemeColors[key];
      if (colorValue && !/^\d{1,3}\s\d{1,3}(\.\d+)?%\s\d{1,3}(\.\d+)?%$/.test(colorValue)) {
        toast({ title: 'Error', description: `Invalid HSL format for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}. Expected 'H S% L%'. Value: '${colorValue}'`, variant: 'destructive' });
        return;
      }
      if (colorValue) {
        finalThemeColors[key] = colorValue;
      }
    }
    
    const themeData = {
      name: formThemeName.trim(),
      colors: finalThemeColors as ThemeColors, // Cast as ThemeColors, assuming all keys are now present due to merge with defaults
    };

    if (editingTheme) {
      updateCustomTheme({ ...editingTheme, ...themeData });
      toast({ title: 'Theme Updated', description: `${themeData.name} has been updated and set as active.` });
    } else {
      const addedTheme = addCustomTheme(themeData);
      toast({ title: 'Theme Added', description: `${addedTheme.name} has been added and set as active.` });
    }
    resetFormToCreateMode();
  };

  const handleColorOptionChange = (colorKey: keyof ThemeColors, selectedValue: string) => {
    setSelectedColorOptions(prev => ({ ...prev, [colorKey]: selectedValue }));
    if (selectedValue === "__CUSTOM__") {
      setCustomHSLInputsVisible(prev => ({ ...prev, [colorKey]: true }));
      // If switching to custom, and current formThemeColors[colorKey] is not a valid HSL or undefined, set it to default
      if(formThemeColors[colorKey] === undefined || !/^\d{1,3}\s\d{1,3}(\.\d+)?%\s\d{1,3}(\.\d+)?%$/.test(formThemeColors[colorKey]!)){
         setFormThemeColors(prev => ({...prev, [colorKey]: defaultThemeColors[colorKey]}));
      }
    } else {
      setCustomHSLInputsVisible(prev => ({ ...prev, [colorKey]: false }));
      setFormThemeColors(prev => ({ ...prev, [colorKey]: selectedValue }));
    }
  };

  const handleCustomHSLInputChange = (colorKey: keyof ThemeColors, hslValue: string) => {
    setFormThemeColors(prev => ({ ...prev, [colorKey]: hslValue }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) resetFormToCreateMode(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme Settings</DialogTitle>
          <DialogDescription>
            Customize the application&apos;s appearance. Select an active theme or create/edit your own.
            Colors should be in HSL format (e.g., &quot;240 60% 94.1%&quot;).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto min-h-0">
          <div className="space-y-6 p-4">
            <div>
              <Label htmlFor="active-theme-select" className="text-sm font-medium">Active Theme</Label>
              <Select
                value={activeThemeIdentifier}
                onValueChange={(value) => setActiveThemeIdentifier(value)}
              >
                <SelectTrigger id="active-theme-select" className="mt-1">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                  {customThemes.length > 0 && <Separator />}
                  {customThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name} (Custom)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                {editingTheme ? (
                  <>
                    <Edit3 className="mr-2 h-5 w-5" /> Edit Theme: {editingTheme.name}
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" /> Create New Theme
                  </>
                )}
              </h3>
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <div>
                  <Label htmlFor="form-theme-name">Theme Name</Label>
                  <Input
                    id="form-theme-name"
                    value={formThemeName}
                    onChange={(e) => setFormThemeName(e.target.value)}
                    placeholder="My Awesome Theme"
                    className="mt-1 bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {themeColorKeys.map((key) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={`theme-select-${key}`} className="capitalize text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedColorOptions[key] || defaultThemeColors[key]}
                          onValueChange={(value) => handleColorOptionChange(key, value)}
                        >
                          <SelectTrigger id={`theme-select-${key}`} className="flex-grow bg-background">
                            <SelectValue placeholder={`Select ${key}...`} />
                          </SelectTrigger>
                          <SelectContent>
                            {getOptionsForKey(key, editingTheme ? { ...defaultThemeColors, ...editingTheme.colors } : defaultThemeColors).map(option => (
                              <SelectItem key={option.value + key} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {customHSLInputsVisible[key] && (
                          <Input
                            id={`theme-hsl-${key}`}
                            value={formThemeColors[key] || ''}
                            onChange={(e) => handleCustomHSLInputChange(key, e.target.value)}
                            placeholder={defaultThemeColors[key]}
                            className="w-full md:w-auto flex-grow bg-background"
                            aria-label={`${key} HSL value`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  {editingTheme && (
                    <Button variant="outline" onClick={resetFormToCreateMode}>Cancel Edit</Button>
                  )}
                  <Button onClick={handleSaveOrAddTheme} className="w-full sm:w-auto">
                    {editingTheme ? 'Save Changes' : 'Add and Activate Theme'}
                  </Button>
                </div>
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
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-md transition-colors",
                        editingTheme?.id === theme.id ? 'bg-primary/20' : 'bg-card hover:bg-muted/50'
                      )}
                    >
                      <span className="font-medium">{theme.name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(theme)}
                          disabled={!!editingTheme && editingTheme.id === theme.id}
                        >
                          <Edit3 className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        {activeThemeIdentifier !== theme.id && (
                           <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveThemeIdentifier(theme.id)}
                            disabled={!!editingTheme}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            if (editingTheme?.id === theme.id) resetFormToCreateMode(); 
                            deleteCustomTheme(theme.id);
                            toast({ title: 'Theme Deleted', description: `${theme.name} has been deleted.` });
                          }}
                          aria-label={`Delete theme ${theme.name}`}
                          disabled={!!editingTheme}
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
        <DialogFooter className="pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => { onOpenChange(false); resetFormToCreateMode(); }}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
