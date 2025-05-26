
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Task } from '@/lib/types';
import type { DayContentProps } from 'react-day-picker';
import { Slider } from '@/components/ui/slider';
import { useHydration } from '@/hooks/useHydration'; // Import useHydration

const CustomDayContent = (props: DayContentProps) => {
  const hydrated = useHydration(); // Use the hydration hook
  const { getTasksForDate } = useAppStore();
  const dateKey = format(props.date, 'yyyy-MM-dd');
  
  // Defer getting tasks until hydrated to prevent mismatch with server render
  const tasks = useMemo(() => {
    if (!hydrated) {
      return []; // On server and initial client render, assume no tasks for consistency
    }
    const dayData = getTasksForDate(dateKey);
    return dayData?.tasks || [];
  }, [hydrated, getTasksForDate, dateKey]);

  const MAX_TASKS_DISPLAYED = 3;

  if (!isSameMonth(props.date, props.displayMonth)) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
        {props.date.getDate()}
      </div>
    );
  }

  // Common day number element
  const dayNumberElement = (
    <div className="self-end text-xs font-medium text-foreground/80 mb-1">
      {props.date.getDate()}
    </div>
  );

  // Conditionally render task content based on hydration and task presence
  let taskDisplayElement;
  if (!hydrated || tasks.length === 0) {
    // This structure is rendered by:
    // 1. Server (tasks are empty as no localStorage)
    // 2. Client initially (hydrated is false, tasks forced empty)
    // 3. Client after hydration if tasks are genuinely empty
    taskDisplayElement = (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-xs text-muted-foreground/70">
          {!hydrated ? 'Loading...' : 'No tasks'}
        </p>
      </div>
    );
  } else {
    // This structure is rendered only after hydration AND if there are tasks
    taskDisplayElement = (
      <ScrollArea className="flex-grow h-0"> 
        <ul className="space-y-1 text-xs">
          {tasks.slice(0, MAX_TASKS_DISPLAYED).map(task => (
            <li
              key={task.id}
              className={`truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}
              title={task.title}
            >
              {task.completed ? '✓' : '•'} {task.title}
            </li>
          ))}
          {tasks.length > MAX_TASKS_DISPLAYED && (
            <li className="text-muted-foreground text-xs">
              + {tasks.length - MAX_TASKS_DISPLAYED} more
            </li>
          )}
        </ul>
      </ScrollArea>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-1 text-left">
      {dayNumberElement}
      {taskDisplayElement}
    </div>
  );
};


export function CalendarView() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { 
    tasksByDate, 
    getTasksForDate, 
    addTask, 
    deleteTask, 
    toggleTaskCompletion,
    templates,
    applyTemplateToDate
  } = useAppStore();

  const formattedSelectedDate = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  }, [selectedDate]);

  const dailyTasksData = useMemo(() => {
    if (!formattedSelectedDate) return undefined;
    return getTasksForDate(formattedSelectedDate);
  }, [formattedSelectedDate, getTasksForDate, tasksByDate]); 

  const tasksForSelectedDay: Task[] = dailyTasksData?.tasks || [];
  const dayOverridesTemplate: boolean = dailyTasksData?.overridesTemplate || false;

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const scrollableCalendarRef = useRef<HTMLDivElement>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderMax, setSliderMax] = useState(100);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateScrollState = useCallback(() => {
    if (scrollableCalendarRef.current) {
      const { scrollHeight, clientHeight } = scrollableCalendarRef.current;
      const currentIsScrollable = scrollHeight > clientHeight;
      setIsScrollable(currentIsScrollable);
      if (currentIsScrollable) {
        setSliderMax(scrollHeight - clientHeight);
      } else {
        setSliderMax(0);
        setSliderValue(0); 
        scrollableCalendarRef.current.scrollTop = 0;
      }
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [selectedDate, tasksByDate, updateScrollState]);

  useEffect(() => {
    const observer = new MutationObserver(updateScrollState);
    if (scrollableCalendarRef.current) {
      observer.observe(scrollableCalendarRef.current, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [updateScrollState]);


  const handleScroll = () => {
    if (scrollableCalendarRef.current) {
      setSliderValue(scrollableCalendarRef.current.scrollTop);
    }
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (scrollableCalendarRef.current) {
      scrollableCalendarRef.current.scrollTop = value;
    }
  };

  const handleAddTask = () => {
    if (!formattedSelectedDate || !newTaskTitle.trim()) {
      toast({ title: 'Error', description: 'Task title cannot be empty.', variant: 'destructive'});
      return;
    }
    addTask(formattedSelectedDate, newTaskTitle.trim());
    setNewTaskTitle('');
    toast({ title: 'Task Added' });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!formattedSelectedDate) return;
    deleteTask(formattedSelectedDate, taskId);
    toast({ title: 'Task Deleted' });
  };

  const handleToggleTask = (taskId: string) => {
    if (!formattedSelectedDate) return;
    toggleTaskCompletion(formattedSelectedDate, taskId);
  };
  
  const handleApplyTemplate = (templateId: string, force: boolean = false) => {
    if (!formattedSelectedDate || !templateId) return;
    
    const currentTasks = getTasksForDate(formattedSelectedDate);
    const originalTaskCount = currentTasks?.tasks.length || 0;
    const wasOverriding = currentTasks?.overridesTemplate || false;

    applyTemplateToDate(templateId, formattedSelectedDate, force);
    
    const newTasks = getTasksForDate(formattedSelectedDate); 
    if (newTasks && (newTasks.tasks.length !== originalTaskCount || !wasOverriding || force)) {
      toast({ title: "Template Applied", description: `Template applied to ${format(selectedDate!, 'MMMM d, yyyy')}.` });
    } else if (wasOverriding && !force && (templates.find(t => t.id === templateId)?.tasks?.length ?? 0) > 0) {
       toast({ title: "Template Not Applied", description: "Day has custom tasks. Use 'Force Apply' to override.", variant: "default" });
    }
  };

  const daysWithTasksModifiers = useMemo(() => {
    return Object.keys(tasksByDate)
      .filter(dateStr => {
        const dayData = tasksByDate[dateStr];
        return dayData?.tasks?.length > 0;
      })
      .map(dateStr => parseISO(dateStr));
  }, [tasksByDate]);


  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
      <Card className="md:col-span-2 shadow-lg flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Monthly Calendar
          </CardTitle>
          <CardDescription>Select a day to view and manage its tasks. Calendar cells show a preview of tasks.</CardDescription>
        </CardHeader>
        <CardContent 
          ref={scrollableCalendarRef}
          className="p-0 sm:p-1 md:p-2 flex-grow overflow-y-auto" 
          style={{ maxHeight: '65vh' }} 
          onScroll={handleScroll}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setTimeout(updateScrollState, 50); 
            }}
            className="rounded-md w-full"
            modifiers={{ hasTasks: daysWithTasksModifiers }}
            modifiersClassNames={{
              hasTasks: 'day-with-tasks-modifier',
            }}
            components={{
              DayContent: CustomDayContent, 
            }}
          />
        </CardContent>
        {isScrollable && (
          <div className="px-2 pb-2 md:px-4 md:pb-4 border-t border-border pt-2">
            <Slider
              value={[sliderValue]}
              onValueChange={(valueArray) => handleSliderChange(valueArray[0])}
              max={sliderMax}
              step={1}
              className="w-full"
              aria-label="Scroll calendar vertically"
            />
          </div>
        )}
      </Card>

      <Card className="md:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            Tasks for: {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
          </CardTitle>
           {dailyTasksData && !dayOverridesTemplate && dailyTasksData.tasks.length > 0 && (
            <CardDescription className="text-xs text-accent-foreground bg-accent/20 p-1 rounded-md">
              Tasks from template. Edit to customize.
            </CardDescription>
          )}
          {dailyTasksData && dayOverridesTemplate && (
             <CardDescription className="text-xs text-primary-foreground bg-primary/20 p-1 rounded-md">
              Customized tasks for this day.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-7rem)]">
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                aria-label="New task title"
              />
              <Button onClick={handleAddTask} aria-label="Add Task">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            {templates.length > 0 && (
               <div className="flex gap-2 items-center">
                <Select onValueChange={(templateId) => { 
                    const selectedTemplate = templates.find(t => t.id === templateId);
                    if(selectedTemplate) handleApplyTemplate(templateId); 
                  }}>
                  <SelectTrigger className="flex-grow" aria-label="Apply Template">
                    <SelectValue placeholder="Apply a Template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="outline" size="sm" disabled={!templates.find(t => !!t) || !selectedDate}>Force Apply</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Force Apply Template?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will override any custom tasks for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'this day'}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-col sm:space-x-0 sm:space-y-2">
                      <AlertDialogCancel aria-label="Cancel">Cancel</AlertDialogCancel>
                       <Select onValueChange={(templateId) => {
                          const selectedTemplate = templates.find(t => t.id === templateId);
                          if(selectedTemplate) {
                            const cancelButton = document.querySelector('button[aria-label="Cancel"]') as HTMLElement | null;
                            if (cancelButton) cancelButton.click();
                            handleApplyTemplate(templateId, true);
                          }
                        }}>
                        <SelectTrigger className="w-full" aria-label="Select Template to Force Apply">
                          <SelectValue placeholder="Select Template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
               </div>
            )}
          </div>

          <ScrollArea className="flex-grow pr-1">
            {tasksForSelectedDay.length > 0 ? (
              <ul className="space-y-2">
                {tasksForSelectedDay.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        aria-labelledby={`task-label-${task.id}`}
                      />
                      <Label
                        htmlFor={`task-${task.id}`}
                        id={`task-label-${task.id}`}
                        className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task.title}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label={`Delete task: ${task.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tasks for this day. Add some or apply a template!
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
