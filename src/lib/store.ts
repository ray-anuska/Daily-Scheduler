import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DailyTasks, TaskTemplate, User, CustomTheme, Task, ThemeColors } from './types';

// Function to generate unique IDs for tasks
const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateTemplateId = () => `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateThemeId = () => `theme_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;


export const defaultThemeColors: ThemeColors = {
  background: "0 0% 96.1%",
  foreground: "240 10% 10%",
  primary: "240 60% 94.1%",
  primaryForeground: "240 20% 25%",
  secondary: "240 30% 90%",
  secondaryForeground: "240 15% 20%",
  muted: "240 20% 92%",
  mutedForeground: "240 10% 45%",
  accent: "300 26% 86%",
  accentForeground: "300 20% 25%",
  destructive: "0 84.2% 60.2%",
  destructiveForeground: "0 0% 98%",
  border: "240 20% 85%",
  input: "240 25% 92%",
  ring: "300 40% 75%",
  card: "0 0% 100%",
  cardForeground: "240 10% 10%",
  popover: "0 0% 100%",
  popoverForeground: "240 10% 10%",
};


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

  activeThemeId: string | null; // ID of the active CustomTheme, null for default
  customThemes: CustomTheme[];
  setActiveThemeId: (themeId: string | null) => void;
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
          // Optionally, use toast here: toast({ title: "Custom Tasks Exist", description: "Template not applied as tasks for this day are already customized."})
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

      activeThemeId: null,
      customThemes: [],
      setActiveThemeId: (themeId) => set({ activeThemeId: themeId }),
      addCustomTheme: (themeData) => {
        const newTheme: CustomTheme = { ...themeData, id: generateThemeId() };
        set((state) => ({ customThemes: [...state.customThemes, newTheme] }));
        return newTheme;
      },
      updateCustomTheme: (updatedTheme) => set((state) => ({
        customThemes: state.customThemes.map(t => t.id === updatedTheme.id ? updatedTheme : t),
      })),
      deleteCustomTheme: (themeId) => set((state) => ({
        customThemes: state.customThemes.filter(t => t.id !== themeId),
      })),
      getActiveThemeColors: () => {
        const { activeThemeId, customThemes } = get();
        if (activeThemeId) {
          const activeTheme = customThemes.find(t => t.id === activeThemeId);
          if (activeTheme) {
            return { ...defaultThemeColors, ...activeTheme.colors };
          }
        }
        return defaultThemeColors;
      },
    }),
    {
      name: 'habitual-calendar-storage',
      storage: createJSONStorage(() => localStorage),
      // Partialize to avoid storing functions or complex non-serializable objects if any
      partialize: (state) => ({
        currentUser: state.currentUser,
        tasksByDate: state.tasksByDate,
        templates: state.templates,
        activeThemeId: state.activeThemeId,
        customThemes: state.customThemes,
      }),
    }
  )
);
