export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface DailyTasks {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  overridesTemplate?: boolean;
  dayNote?: string; // User-editable note for the day
}

export interface TaskTemplate {
  id: string;
  name: string;
  tasks: Pick<Task, 'title'>[]; // Template tasks only need titles
}

export interface User {
  id: string;
  name: string; // Will be derived from email for now
  email: string;
}

export interface ThemeColors {
  background: string; // HSL string
  foreground: string; // HSL string
  primary: string;    // HSL string
  primaryForeground: string; // HSL string
  secondary: string; // HSL string
  secondaryForeground: string; // HSL string
  muted: string; // HSL string
  mutedForeground: string; // HSL string
  accent: string;     // HSL string
  accentForeground: string;  // HSL string
  destructive: string; // HSL string
  destructiveForeground: string; // HSL string
  border: string;     // HSL string
  input: string;      // HSL string
  ring: string;       // HSL string
  card: string;       // HSL string
  cardForeground: string; // HSL string
  popover: string;    // HSL string
  popoverForeground: string; // HSL string
  taskPendingBackground: string; // HSL string for background of pending task boxes
  taskCompletedBackground: string; // HSL string for background of completed task boxes
}


export interface CustomTheme {
  id: string; // UUID for custom themes
  name: string;
  colors: Partial<ThemeColors>;
}

export interface PredefinedTheme {
  id: string; // readable identifier e.g., 'default_light', 'dark_mode'
  name: string;
  colors: ThemeColors; // Predefined themes have complete color sets
}
