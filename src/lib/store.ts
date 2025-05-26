
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DailyTasks, TaskTemplate, User, CustomTheme, Task, ThemeColors, PredefinedTheme } from './types';

const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateTemplateId = () => `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateThemeId = () => `theme_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const defaultThemeColors: ThemeColors = {
  background: "0 0% 96.1%", // Light Gray #F5F5F5
  foreground: "240 10% 10%", // Darker for text on light gray
  card: "0 0% 100%", // White cards
  cardForeground: "240 10% 10%", // Match foreground
  popover: "0 0% 100%", // White popovers
  popoverForeground: "240 10% 10%", // Match foreground
  primary: "240 60% 94.1%", // Soft Lavender #E6E6FA
  primaryForeground: "240 20% 25%", // Dark blue/purple for text on soft lavender
  secondary: "240 30% 90%", // Lighter muted lavender for secondary elements
  secondaryForeground: "240 15% 20%", // Darker for secondary text
  muted: "240 20% 92%", // Very light lavender for muted backgrounds
  mutedForeground: "240 10% 45%", // Softer text for muted
  accent: "300 26% 86%", // Dusty Rose #D8BFD8
  accentForeground: "300 20% 25%", // Dark magenta/purple for text on dusty rose
  destructive: "0 84.2% 60.2%",
  destructiveForeground: "0 0% 98%",
  border: "240 20% 85%", // Muted lavender for borders
  input: "240 25% 92%", // Lighter muted lavender for input backgrounds
  ring: "300 40% 75%", // More saturated dusty rose for rings
};

export const predefinedThemes: PredefinedTheme[] = [
  {
    id: 'default_light',
    name: 'Default Light',
    colors: { ...defaultThemeColors },
  },
  {
    id: 'default_dark',
    name: 'Default Dark',
    colors: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      cardForeground: "0 0% 98%",
      popover: "240 10% 3.9%",
      popoverForeground: "0 0% 98%",
      primary: "240 60% 85%",
      primaryForeground: "240 10% 15%",
      secondary: "240 10% 14.9%",
      secondaryForeground: "0 0% 98%",
      muted: "240 10% 14.9%",
      mutedForeground: "0 0% 63.9%",
      accent: "300 30% 70%",
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 0% 98%",
      border: "240 10% 14.9%",
      input: "240 10% 14.9%",
      ring: "300 40% 65%",
    },
  },
  {
    id: 'sky_blue',
    name: 'Sky Blue',
    colors: {
      ...defaultThemeColors,
      background: "210 40% 98%", // Very light blue
      foreground: "210 40% 10%", // Dark blue
      card: "207 60% 97%",       // Extremely light blue (almost white)
      cardForeground: "210 40% 10%", // Dark blue
      popover: "207 60% 97%",    // Extremely light blue (almost white)
      popoverForeground: "210 40% 10%", // Dark blue
      primary: "207 90% 54%",   // Sky Blue
      primaryForeground: "0 0% 100%", // White
      accent: "187 70% 40%",   // Slightly deeper blue/teal
      accentForeground: "0 0% 100%", // White
      border: "210 30% 90%",   // Light blue
      input: "210 30% 95%",    // Very light blue for input background
      ring: "207 90% 60%",    // Sky blue for ring
    }
  },
  {
    id: 'cheery_yellow',
    name: 'Cheery Yellow',
    colors: {
      ...defaultThemeColors,
      background: "50 30% 97%",    // Very light yellow
      foreground: "50 20% 20%",    // Dark brownish yellow
      card: "45 80% 98%",          // Extremely light yellow
      cardForeground: "50 20% 20%", // Dark brownish yellow
      popover: "45 80% 98%",       // Extremely light yellow
      popoverForeground: "50 20% 20%", // Dark brownish yellow
      primary: "45 100% 58%",  // Cheery Yellow
      primaryForeground: "45 30% 20%", // Darker yellow/brown for text on primary
      accent: "30 100% 65%",   // Warm Orange
      accentForeground: "0 0% 100%", // White
      border: "50 25% 90%",    // Light yellow
      input: "50 25% 95%",     // Very light yellow for input background
      ring: "45 100% 65%",     // Cheery yellow for ring
    }
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    colors: {
      ...defaultThemeColors,
      background: "120 10% 96%",   // Very light green
      foreground: "120 25% 10%",   // Dark green
      card: "120 20% 98%",         // Extremely light green
      cardForeground: "120 25% 10%",// Dark green
      popover: "120 20% 98%",      // Extremely light green
      popoverForeground: "120 25% 10%",// Dark green
      primary: "120 39% 39%",   // Forest Green
      primaryForeground: "0 0% 100%", // White
      accent: "100 40% 55%",   // Lighter, slightly yellowish green
      accentForeground: "120 25% 15%", // Dark green for text on accent
      border: "120 10% 88%",    // Light green
      input: "120 10% 92%",     // Very light green for input background
      ring: "120 39% 45%",      // Forest green for ring
    }
  }
];

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  tasksByDate: Record<string, DailyTasks>; // Keyed by YYYY-MM-DD
  getTasksForDate: (date: string) => DailyTasks | undefined;
  addTask: (date: string, taskTitle: string) => void;
  updateTask: (date: string, taskId: string, updatedProps: Partial<Task>) => void;
  deleteTask: (date: string, taskId: string) => void;
  toggleTaskCompletion: (date: string, taskId: string) => void;
  setTasksForDate: (date: string, tasks: Task[], overridesTemplate?: boolean) => void;

  templates: TaskTemplate[];
  addTemplate: (template: Omit<TaskTemplate, 'id'>) => TaskTemplate;
  updateTemplate: (template: TaskTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplateToDate: (templateId: string, date: string, forceOverride?: boolean) => void;

  activeThemeIdentifier: string; // ID of the active theme (predefined or custom UUID), defaults to 'default_light'
  customThemes: CustomTheme[];
  setActiveThemeIdentifier: (identifier: string) => void;
  addCustomTheme: (theme: Omit<CustomTheme, 'id'>) => CustomTheme;
  updateCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (themeId: string) => void;
  getActiveThemeColors: () => ThemeColors;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      tasksByDate: {},
      getTasksForDate: (date) => get().tasksByDate[date],
      addTask: (date, taskTitle) => set((state) => {
        const dayTasks = state.tasksByDate[date] || { date, tasks: [], overridesTemplate: true };
        const newTask: Task = { id: generateTaskId(), title: taskTitle, completed: false };
        return {
          tasksByDate: {
            ...state.tasksByDate,
            [date]: { ...dayTasks, tasks: [...dayTasks.tasks, newTask], overridesTemplate: true },
          },
        };
      }),
      updateTask: (date, taskId, updatedProps) => set((state) => {
        const dayTasks = state.tasksByDate[date];
        if (!dayTasks) return state;
        return {
          tasksByDate: {
            ...state.tasksByDate,
            [date]: {
              ...dayTasks,
              tasks: dayTasks.tasks.map(task => task.id === taskId ? { ...task, ...updatedProps } : task),
              overridesTemplate: true,
            },
          },
        };
      }),
      deleteTask: (date, taskId) => set((state) => {
        const dayTasks = state.tasksByDate[date];
        if (!dayTasks) return state;
        return {
          tasksByDate: {
            ...state.tasksByDate,
            [date]: {
              ...dayTasks,
              tasks: dayTasks.tasks.filter(task => task.id !== taskId),
              overridesTemplate: true,
            },
          },
        };
      }),
      toggleTaskCompletion: (date, taskId) => set((state) => {
        const dayTasks = state.tasksByDate[date];
        if (!dayTasks) return state;
        return {
          tasksByDate: {
            ...state.tasksByDate,
            [date]: {
              ...dayTasks,
              tasks: dayTasks.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
              overridesTemplate: true,
            },
          },
        };
      }),
      setTasksForDate: (date, tasks, overridesTemplate = true) => set(state => ({
        tasksByDate: {
          ...state.tasksByDate,
          [date]: { date, tasks, overridesTemplate }
        }
      })),

      templates: [],
      addTemplate: (templateData) => {
        const newTemplate: TaskTemplate = { ...templateData, id: generateTemplateId() };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
        return newTemplate;
      },
      updateTemplate: (updatedTemplate) => set((state) => ({
        templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
      })),
      deleteTemplate: (templateId) => set((state) => ({
        templates: state.templates.filter(t => t.id !== templateId),
      })),
      applyTemplateToDate: (templateId, date, forceOverride = false) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        const existingDailyTasks = get().tasksByDate[date];
        if (existingDailyTasks && existingDailyTasks.overridesTemplate && !forceOverride) {
          console.warn(`Tasks for ${date} are custom, template not applied.`);
          return;
        }

        const newTasksFromTemplate = template.tasks.map(taskBase => ({
          id: generateTaskId(),
          title: taskBase.title,
          completed: false,
        }));

        get().setTasksForDate(date, newTasksFromTemplate, false);
      },

      activeThemeIdentifier: 'default_light', // Default to the light theme
      customThemes: [],
      setActiveThemeIdentifier: (identifier) => set({ activeThemeIdentifier: identifier }),
      addCustomTheme: (themeData) => {
        const newTheme: CustomTheme = { ...themeData, id: generateThemeId() };
        set((state) => ({
          customThemes: [...state.customThemes, newTheme],
          activeThemeIdentifier: newTheme.id, // Set new custom theme as active
        }));
        return newTheme;
      },
      updateCustomTheme: (updatedTheme) => set((state) => ({
        customThemes: state.customThemes.map(t => t.id === updatedTheme.id ? updatedTheme : t),
        activeThemeIdentifier: updatedTheme.id, // Ensure updated theme is active
      })),
      deleteCustomTheme: (themeId) => set((state) => ({
        customThemes: state.customThemes.filter(t => t.id !== themeId),
        // If the deleted theme was active, revert to default
        activeThemeIdentifier: state.activeThemeIdentifier === themeId ? 'default_light' : state.activeThemeIdentifier,
      })),
      getActiveThemeColors: () => {
        const { activeThemeIdentifier, customThemes } = get();
        const predefined = predefinedThemes.find(pt => pt.id === activeThemeIdentifier);
        if (predefined) {
          return { ...defaultThemeColors, ...predefined.colors }; // Ensure all keys are present by merging with default
        }
        const custom = customThemes.find(ct => ct.id === activeThemeIdentifier);
        if (custom) {
          return { ...defaultThemeColors, ...custom.colors }; // Ensure all keys by merging
        }
        return defaultThemeColors; // Fallback to absolute default
      },
    }),
    {
      name: 'habitual-calendar-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        tasksByDate: state.tasksByDate,
        templates: state.templates,
        activeThemeIdentifier: state.activeThemeIdentifier,
        customThemes: state.customThemes,
      }),
    }
  )
);
