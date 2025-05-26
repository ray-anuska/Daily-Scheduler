
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DailyTasks, TaskTemplate, User, CustomTheme, Task, ThemeColors, PredefinedTheme } from './types';

const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateTemplateId = () => `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateThemeId = () => `theme_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const defaultThemeColors: ThemeColors = {
  background: "0 0% 96.1%", 
  foreground: "240 10% 10%", 
  card: "0 0% 100%", 
  cardForeground: "240 10% 10%", 
  popover: "0 0% 100%", 
  popoverForeground: "240 10% 10%", 
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
  taskPendingBackground: "0 0% 92%", 
  taskCompletedBackground: "120 70% 90%", 
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
      ...defaultThemeColors,
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
      taskPendingBackground: "240 5% 18%", 
      taskCompletedBackground: "120 40% 22%", 
    },
  },
  {
    id: 'sky_blue',
    name: 'Sky Blue',
    colors: {
      ...defaultThemeColors,
      background: "210 40% 98%", 
      foreground: "210 40% 10%", 
      card: "207 60% 97%",       
      cardForeground: "210 40% 10%", 
      popover: "207 60% 97%",    
      popoverForeground: "210 40% 10%", 
      primary: "207 90% 54%",   
      primaryForeground: "0 0% 100%", 
      accent: "187 70% 40%",   
      accentForeground: "0 0% 100%", 
      border: "210 30% 90%",   
      input: "210 30% 95%",    
      ring: "207 90% 60%",
      taskPendingBackground: "210 50% 92%", 
      taskCompletedBackground: "130 60% 90%", 
    }
  },
  {
    id: 'cheery_yellow',
    name: 'Cheery Yellow',
    colors: {
      ...defaultThemeColors,
      background: "50 30% 97%",    
      foreground: "50 20% 20%",    
      card: "45 80% 98%",          
      cardForeground: "50 20% 20%", 
      popover: "45 80% 98%",       
      popoverForeground: "50 20% 20%", 
      primary: "45 100% 58%",  
      primaryForeground: "45 30% 20%", 
      accent: "30 100% 65%",   
      accentForeground: "0 0% 100%", 
      border: "50 25% 90%",    
      input: "50 25% 95%",     
      ring: "45 100% 65%",
      taskPendingBackground: "50 70% 93%", 
      taskCompletedBackground: "90 60% 90%",  
    }
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    colors: {
      ...defaultThemeColors,
      background: "120 10% 96%",   
      foreground: "120 25% 10%",   
      card: "120 20% 98%",         
      cardForeground: "120 25% 10%",
      popover: "120 20% 98%",      
      popoverForeground: "120 25% 10%",
      primary: "120 39% 39%",   
      primaryForeground: "0 0% 100%", 
      accent: "100 40% 55%",   
      accentForeground: "120 25% 15%", 
      border: "120 10% 88%",    
      input: "120 10% 92%",     
      ring: "120 39% 45%",
      taskPendingBackground: "120 20% 92%", 
      taskCompletedBackground: "90 40% 88%",   
    }
  }
];

const GUEST_USER_ID = 'guest';

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // User-specific data
  userTasksByDate: Record<string, Record<string, DailyTasks>>; // { [userId]: { [date]: DailyTasks } }
  userCustomThemes: Record<string, CustomTheme[]>; // { [userId]: CustomTheme[] }
  userActiveThemeIdentifiers: Record<string, string>; // { [userId]: string }
  
  // Global data
  templates: TaskTemplate[];

  // Actions operating on current user's data or global data
  getTasksForDate: (date: string) => DailyTasks | undefined;
  addTask: (date: string, taskTitle: string) => void;
  updateTask: (date: string, taskId: string, updatedProps: Partial<Task>) => void;
  deleteTask: (date: string, taskId: string) => void;
  toggleTaskCompletion: (date: string, taskId: string) => void;
  setTasksForDate: (date: string, tasks: Task[], overridesTemplate?: boolean) => void;
  setDayNote: (date: string, note: string) => void;

  addTemplate: (template: Omit<TaskTemplate, 'id'>) => TaskTemplate;
  updateTemplate: (template: TaskTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplateToDate: (templateId: string, date: string, forceOverride?: boolean) => void;

  getActiveUserCustomThemes: () => CustomTheme[];
  getActiveUserActiveThemeIdentifier: () => string;
  setActiveThemeIdentifier: (identifier: string) => void;
  addCustomTheme: (theme: Omit<CustomTheme, 'id'>) => CustomTheme;
  updateCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (themeId: string) => void;
  getActiveThemeColors: () => ThemeColors;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const getCurrentUserId = () => get().currentUser?.id || GUEST_USER_ID;

      return {
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),

        userTasksByDate: {},
        userCustomThemes: {},
        userActiveThemeIdentifiers: {},
        templates: [],

        getTasksForDate: (date) => {
          const userId = getCurrentUserId();
          const tasksForUser = get().userTasksByDate[userId] || {};
          return tasksForUser[date];
        },
        addTask: (date, taskTitle) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userTasks = state.userTasksByDate[userId] || {};
          const dayTasks = userTasks[date] || { date, tasks: [], overridesTemplate: true, dayNote: '' };
          const newTask: Task = { id: generateTaskId(), title: taskTitle, completed: false };
          return {
            userTasksByDate: {
              ...state.userTasksByDate,
              [userId]: {
                ...userTasks,
                [date]: { ...dayTasks, tasks: [...dayTasks.tasks, newTask], overridesTemplate: true },
              },
            },
          };
        }),
        updateTask: (date, taskId, updatedProps) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userTasks = state.userTasksByDate[userId] || {};
          const dayTasks = userTasks[date];
          if (!dayTasks) return state;
          return {
            userTasksByDate: {
              ...state.userTasksByDate,
              [userId]: {
                ...userTasks,
                [date]: {
                  ...dayTasks,
                  tasks: dayTasks.tasks.map(task => task.id === taskId ? { ...task, ...updatedProps } : task),
                  overridesTemplate: true,
                },
              },
            },
          };
        }),
        deleteTask: (date, taskId) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userTasks = state.userTasksByDate[userId] || {};
          const dayTasks = userTasks[date];
          if (!dayTasks) return state;
          return {
            userTasksByDate: {
              ...state.userTasksByDate,
              [userId]: {
                ...userTasks,
                [date]: {
                  ...dayTasks,
                  tasks: dayTasks.tasks.filter(task => task.id !== taskId),
                  overridesTemplate: true,
                },
              },
            },
          };
        }),
        toggleTaskCompletion: (date, taskId) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userTasks = state.userTasksByDate[userId] || {};
          const dayTasks = userTasks[date];
          if (!dayTasks) return state;
          return {
            userTasksByDate: {
              ...state.userTasksByDate,
              [userId]: {
                ...userTasks,
                [date]: {
                  ...dayTasks,
                  tasks: dayTasks.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                  ),
                  overridesTemplate: true,
                },
              },
            },
          };
        }),
        setTasksForDate: (date, tasks, overridesTemplate = true) => set(state => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userTasks = state.userTasksByDate[userId] || {};
          const currentDayData = userTasks[date];
          return {
            userTasksByDate: {
              ...state.userTasksByDate,
              [userId]: {
                ...userTasks,
                [date]: { 
                  date, 
                  tasks, 
                  overridesTemplate, 
                  dayNote: overridesTemplate ? currentDayData?.dayNote : '' 
                }
              }
            }
          }
        }),
        setDayNote: (date, note) => set(state => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userTasks = state.userTasksByDate[userId] || {};
          const dayTasks = userTasks[date] || { date, tasks: [], dayNote: '' };
          return {
            userTasksByDate: {
              ...state.userTasksByDate,
              [userId]: {
                ...userTasks,
                [date]: {
                  ...dayTasks,
                  dayNote: note,
                  overridesTemplate: true, 
                },
              },
            },
          };
        }),

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

          const userId = getCurrentUserId();
          const userTasks = get().userTasksByDate[userId] || {};
          const existingDailyTasks = userTasks[date];

          if (existingDailyTasks && existingDailyTasks.overridesTemplate && !forceOverride) {
            console.warn(`Tasks for ${date} are custom for user ${userId}, template not applied.`);
            return;
          }

          const newTasksFromTemplate = template.tasks.map(taskBase => ({
            id: generateTaskId(),
            title: taskBase.title,
            completed: false,
          }));

          get().setTasksForDate(date, newTasksFromTemplate, false); 
        },
        
        getActiveUserCustomThemes: () => {
          const userId = getCurrentUserId();
          return get().userCustomThemes[userId] || [];
        },
        getActiveUserActiveThemeIdentifier: () => {
          const userId = getCurrentUserId();
          return get().userActiveThemeIdentifiers[userId] || 'default_light';
        },
        setActiveThemeIdentifier: (identifier) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          return {
            userActiveThemeIdentifiers: {
              ...state.userActiveThemeIdentifiers,
              [userId]: identifier,
            }
          }
        }),
        addCustomTheme: (themeData) => {
          const userId = getCurrentUserId();
          const newTheme: CustomTheme = { ...themeData, id: generateThemeId() };
          set((state) => {
            const userThemes = state.userCustomThemes[userId] || [];
            return {
              userCustomThemes: {
                ...state.userCustomThemes,
                [userId]: [...userThemes, newTheme],
              },
              userActiveThemeIdentifiers: {
                ...state.userActiveThemeIdentifiers,
                [userId]: newTheme.id,
              }
            }
          });
          return newTheme;
        },
        updateCustomTheme: (updatedTheme) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userThemes = state.userCustomThemes[userId] || [];
          return {
            userCustomThemes: {
              ...state.userCustomThemes,
              [userId]: userThemes.map(t => t.id === updatedTheme.id ? updatedTheme : t),
            },
            userActiveThemeIdentifiers: {
              ...state.userActiveThemeIdentifiers,
              [userId]: updatedTheme.id,
            }
          }
        }),
        deleteCustomTheme: (themeId) => set((state) => {
          const userId = state.currentUser?.id || GUEST_USER_ID;
          const userThemes = state.userCustomThemes[userId] || [];
          const currentActiveTheme = state.userActiveThemeIdentifiers[userId] || 'default_light';
          return {
            userCustomThemes: {
              ...state.userCustomThemes,
              [userId]: userThemes.filter(t => t.id !== themeId),
            },
            userActiveThemeIdentifiers: {
              ...state.userActiveThemeIdentifiers,
              [userId]: currentActiveTheme === themeId ? 'default_light' : currentActiveTheme,
            }
          }
        }),
        getActiveThemeColors: () => {
          const userId = getCurrentUserId();
          const activeIdentifier = get().userActiveThemeIdentifiers[userId] || 'default_light';
          const userThemes = get().userCustomThemes[userId] || [];
          
          const predefined = predefinedThemes.find(pt => pt.id === activeIdentifier);
          if (predefined) {
            return { ...defaultThemeColors, ...predefined.colors }; 
          }
          const custom = userThemes.find(ct => ct.id === activeIdentifier);
          if (custom) {
            return { ...defaultThemeColors, ...custom.colors }; 
          }
          return defaultThemeColors; 
        },
      }
    },
    {
      name: 'habitual-calendar-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        userTasksByDate: state.userTasksByDate,
        userCustomThemes: state.userCustomThemes,
        userActiveThemeIdentifiers: state.userActiveThemeIdentifiers,
        templates: state.templates,
      }),
    }
  )
);
