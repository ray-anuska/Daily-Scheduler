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
      ...defaultThemeColors, // Start with defaults and override
      primary: "207 90% 54%",
      primaryForeground: "0 0% 100%",
      accent: "187 70% 40%",
      accentForeground: "0 0% 100%",
      background: "210 40% 98%",
      foreground: "210 40% 10%",
      card: "210 30% 100%",
      cardForeground: "210 40% 10%",
      border: "210 30% 90%",
      input: "210 30% 95%",
      ring: "207 90% 60%",
    }
  },
  {
    id: 'cheery_yellow',
    name: 'Cheery Yellow',
    colors: {
      ...defaultThemeColors,
      primary: "45 100% 58%",
      primaryForeground: "45 30% 20%",
      accent: "30 100% 65%",
      accentForeground: "0 0% 100%",
      background: "50 30% 97%",
      foreground: "50 20% 20%",
      card: "50 20% 100%",
      cardForeground: "50 20% 20%",
      border: "50 25% 90%",
      input: "50 25% 95%",
      ring: "45 100% 65%",
    }
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    colors: {
      ...defaultThemeColors,
      primary: "120 39% 39%", // Darker green
      primaryForeground: "0 0% 100%",
      accent: "100 40% 55%", // Lighter, slightly yellowish green
      accentForeground: "120 25% 15%",
      background: "120 10% 96%",
      foreground: "120 25% 10%",
      card: "120 5% 100%",
      cardForeground: "120 25% 10%",
      border: "120 10% 88%",
      input: "120 10% 92%",
      ring: "120 39% 45%",
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
