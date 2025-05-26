
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { Trash2, PlusCircle, CalendarDays, X } from 'lucide-react';
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
import { useHydration } from '@/hooks/useHydration';
import { cn } from '@/lib/utils';

interface CustomDayContentProps extends DayContentProps {
  onTaskToggle: () => void; 
}

const CustomDayContent = (props: CustomDayContentProps) => {
  const hydrated = useHydration();
  const dateKey = format(props.date, 'yyyy-MM-dd');
  
  const tasksForDay_store = useAppStore(state => state.tasksByDate[dateKey]?.tasks || []);
  
  const tasks = useMemo(() => {
    if (!hydrated) return [];
    return tasksForDay_store;
  }, [hydrated, tasksForDay_store]);

  useEffect(() => {
    // This effect ensures the component re-renders if tasksForDay_store changes after hydration
  }, [tasksForDay_store]);


  const MAX_TASKS_DISPLAYED = 3;

  if (!isSameMonth(props.date, props.displayMonth)) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
        {props.date.getDate()}
      </div>
    );
  }

  const dayNumberElement = (
    <div className="self-end text-xs font-medium text-foreground/80 mb-1">
      {props.date.getDate()}
    </div>
  );

  let taskDisplayElement;
   if (!hydrated && tasks.length === 0) { 
    taskDisplayElement = (
       <div className="flex-grow flex items-center justify-center">
        <p className="text-xs text-muted-foreground/70">Loading...</p>
      </div>
    );
  } else if (hydrated && tasks.length === 0) {
     taskDisplayElement = (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-xs text-muted-foreground/70">No tasks</p>
      </div>
    );
  } else {
    taskDisplayElement = (
      <ScrollArea className="flex-grow h-0"> 
        <ul className="space-y-0.5 text-xs"> {/* Reduced space-y for tighter packing */}
          {tasks.slice(0, MAX_TASKS_DISPLAYED).map(task => (
            <li
              key={task.id}
              className="p-1 rounded-sm" 
              style={{
                backgroundColor: task.completed
                  ? 'hsl(var(--task-completed-background))'
                  : 'hsl(var(--task-pending-background))',
              }}
              title={task.title}
            >
              <span 
                style={{ color: 'hsl(var(--card-foreground))' }}
                className={cn('truncate', { 'line-through': task.completed })}
              >
                {task.completed ? '✓' : '•'} {task.title}
              </span>
            </li>
          ))}
          {tasks.length > MAX_TASKS_DISPLAYED && (
            <li className="text-muted-foreground text-xs mt-1">
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

interface CalendarViewProps {
  isTaskSidebarOpen: boolean;
  setIsTaskSidebarOpen: (isOpen: boolean) => void;
}

export function CalendarView({ isTaskSidebarOpen, setIsTaskSidebarOpen }: CalendarViewProps) {
  const hydrated = useHydration();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarTitle, setCalendarTitle] = useState("Monthly Calendar");
  const [isEditingCalendarTitle, setIsEditingCalendarTitle] = useState(false);


  const {
    tasksByDate,
    getTasksForDate,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    templates,
    applyTemplateToDate,
    setDayNote,
  } = useAppStore();

  const [calendarFlexBasis, setCalendarFlexBasis] = useState('66%');
  const [flexBasisBeforeSidebarClosed, setFlexBasisBeforeSidebarClosed] = useState('66%');
  
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggerRef = useRef<HTMLDivElement>(null);

  const dragStartXRef = useRef(0);
  const dragStartWidthPxRef = useRef(0);

  const [editingDayNoteFor, setEditingDayNoteFor] = useState<string | null>(null);
  const [currentDayNoteText, setCurrentDayNoteText] = useState<string>("");

  useEffect(() => {
    if (isTaskSidebarOpen) {
      setCalendarFlexBasis(flexBasisBeforeSidebarClosed);
    } else {
      if (calendarFlexBasis !== '100%') { 
        setFlexBasisBeforeSidebarClosed(calendarFlexBasis);
      }
      setCalendarFlexBasis('100%');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTaskSidebarOpen]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    const calendarCardElement = containerRef.current?.firstChild as HTMLElement;
    if (calendarCardElement) {
      dragStartWidthPxRef.current = calendarCardElement.offsetWidth;
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !draggerRef.current || !isTaskSidebarOpen) return;

      const dx = e.clientX - dragStartXRef.current;
      let newCalendarWidthPx = dragStartWidthPxRef.current + dx;

      const containerWidthPx = containerRef.current.offsetWidth;
      const draggerWidthPx = draggerRef.current.offsetWidth;
      const computedStyle = getComputedStyle(draggerRef.current);
      const marginLeft = parseFloat(computedStyle.marginLeft);
      const marginRight = parseFloat(computedStyle.marginRight);
      const marginPx = marginLeft + marginRight;
      
      const availableWidthForPanels = containerWidthPx - draggerWidthPx - marginPx;
      const minCalendarPanelWidthPx = Math.max(200, availableWidthForPanels * 0.25);
      const minTaskPanelWidthPx = Math.max(200, availableWidthForPanels * 0.20);    
      const maxCalendarPanelWidthPx = availableWidthForPanels - minTaskPanelWidthPx;

      newCalendarWidthPx = Math.max(minCalendarPanelWidthPx, Math.min(newCalendarWidthPx, maxCalendarPanelWidthPx));
      
      const newBasis = `${newCalendarWidthPx}px`;
      setCalendarFlexBasis(newBasis);
      if(isTaskSidebarOpen) { 
         setFlexBasisBeforeSidebarClosed(newBasis); 
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isTaskSidebarOpen]);


  const formattedSelectedDate = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  }, [selectedDate]);

  const dailyTasksData = useMemo(() => {
    if (!hydrated || !formattedSelectedDate) return undefined;
    return getTasksForDate(formattedSelectedDate);
  }, [hydrated, formattedSelectedDate, getTasksForDate, tasksByDate]);

  const tasksForSelectedDay: Task[] = dailyTasksData?.tasks || [];
  const dayOverridesTemplate: boolean = dailyTasksData?.overridesTemplate || false;

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleTaskToggle = useCallback(() => {
    // This callback forces a re-render of parts of CalendarView if needed,
    // and also ensures CustomDayContent (which uses this prop) re-evaluates.
  }, []);

  const handleAddTask = () => {
    if (!formattedSelectedDate || !newTaskTitle.trim()) {
      toast({ title: 'Error', description: 'Task title cannot be empty.', variant: 'destructive'});
      return;
    }
    addTask(formattedSelectedDate, newTaskTitle.trim());
    setNewTaskTitle('');
    toast({ title: 'Task Added' });
    handleTaskToggle(); 
  };

  const handleDeleteTask = (taskId: string) => {
    if (!formattedSelectedDate) return;
    deleteTask(formattedSelectedDate, taskId);
    toast({ title: 'Task Deleted' });
    handleTaskToggle();
  };

  const handleToggleTask = (taskId: string) => {
    if (!formattedSelectedDate) return;
    toggleTaskCompletion(formattedSelectedDate, taskId);
    handleTaskToggle();
  };

  const handleApplyTemplate = (templateId: string, force: boolean = false) => {
    if (!formattedSelectedDate || !templateId) return;

    const currentTasks = getTasksForDate(formattedSelectedDate);
    const originalTaskCount = currentTasks?.tasks.length || 0;
    const wasOverriding = currentTasks?.overridesTemplate || false;

    applyTemplateToDate(templateId, formattedSelectedDate, force);
    handleTaskToggle();

    const newTasks = getTasksForDate(formattedSelectedDate);
    if (newTasks && (newTasks.tasks.length !== originalTaskCount || !wasOverriding || force)) {
      toast({ title: "Template Applied", description: `Template applied to ${format(selectedDate!, 'MMMM d, yyyy')}.` });
    } else if (wasOverriding && !force && (templates.find(t => t.id === templateId)?.tasks?.length ?? 0) > 0) {
       toast({ title: "Template Not Applied", description: "Day has custom tasks. Use 'Apply' to override.", variant: "default" });
    }
  };

  const daysWithTasksModifiers = useMemo(() => {
    if (!hydrated) return [];
    return Object.keys(tasksByDate)
      .filter(dateStr => {
        const dayData = tasksByDate[dateStr];
        return dayData?.tasks?.length > 0;
      })
      .map(dateStr => parseISO(dateStr));
  }, [hydrated, tasksByDate]);

  const handleSaveDayNote = () => {
    if (editingDayNoteFor && formattedSelectedDate === editingDayNoteFor) {
      setDayNote(formattedSelectedDate, currentDayNoteText);
    }
    setEditingDayNoteFor(null);
  };

  const handleCalendarTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalendarTitle(e.target.value);
  };

  const handleCalendarTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingCalendarTitle(false);
    }
  };


  return (
    <div ref={containerRef} className="flex flex-1 flex-row w-full overflow-hidden">
      <Card
        className="shadow-lg flex flex-col overflow-hidden"
        style={{ flexBasis: calendarFlexBasis, flexShrink: 0, minWidth: '200px' }}
      >
        <CardHeader>
          {isEditingCalendarTitle ? (
            <Input
              type="text"
              value={calendarTitle}
              onChange={handleCalendarTitleChange}
              onBlur={() => setIsEditingCalendarTitle(false)}
              onKeyDown={handleCalendarTitleKeyDown}
              className="text-2xl font-semibold leading-none tracking-tight h-auto p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          ) : (
            <CardTitle 
              className="text-2xl flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md -m-1"
              onClick={() => setIsEditingCalendarTitle(true)}
              title="Click to edit title"
            >
              <CalendarDays className="h-6 w-6 text-primary" /> {calendarTitle}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-1 md:p-2 flex-grow overflow-y-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date) {
                setIsTaskSidebarOpen(true);
                setEditingDayNoteFor(null); 
              }
            }}
            className="rounded-md w-full block" 
            modifiers={{ hasTasks: daysWithTasksModifiers }}
            modifiersClassNames={{
              hasTasks: 'day-with-tasks-modifier',
            }}
            components={{
              DayContent: (dayProps) => <CustomDayContent {...dayProps} onTaskToggle={handleTaskToggle} />,
            }}
          />
        </CardContent>
      </Card>

      {isTaskSidebarOpen && (
        <div
          ref={draggerRef}
          className="w-2 bg-border cursor-col-resize hover:bg-primary transition-colors mx-3 self-stretch"
          onMouseDown={handleMouseDown}
          style={{ flexShrink: 0 }}
        />
      )}

      {isTaskSidebarOpen && (
        <Card
          className="shadow-lg flex flex-col flex-grow overflow-hidden"
          style={{ minWidth: '250px' }}
        >
          <CardHeader className="relative">
            <CardTitle className="text-xl pr-10"> 
              Tasks for: {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-7 w-7" 
              onClick={() => setIsTaskSidebarOpen(false)}
              aria-label="Close task sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {hydrated && dailyTasksData && formattedSelectedDate && (
              dayOverridesTemplate ? (
                editingDayNoteFor === formattedSelectedDate ? (
                  <Input
                    value={currentDayNoteText}
                    onChange={(e) => setCurrentDayNoteText(e.target.value)}
                    onBlur={handleSaveDayNote}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveDayNote()}
                    placeholder="Add a note for this day..."
                    className="text-xs p-1 h-auto mt-1 bg-background border-primary ring-primary focus-visible:ring-primary"
                    autoFocus
                  />
                ) : (
                  <CardDescription
                    className="text-xs text-primary-foreground bg-primary/20 p-1 rounded-md mt-1 cursor-pointer hover:bg-primary/30 transition-colors"
                    onClick={() => {
                      setEditingDayNoteFor(formattedSelectedDate);
                      setCurrentDayNoteText(dailyTasksData.dayNote || "");
                    }}
                    title="Click to edit note"
                  >
                    {dailyTasksData.dayNote || "Customized tasks for this day. (Click to edit note)"}
                  </CardDescription>
                )
              ) : (
                tasksForSelectedDay.length > 0 && (
                  <CardDescription className="text-xs text-accent-foreground bg-accent/20 p-1 rounded-md mt-1">
                    Tasks from template. Edit to customize.
                  </CardDescription>
                )
              )
            )}

          </CardHeader>
          <CardContent className="flex flex-col flex-grow h-0">
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
                       <Button variant="outline" size="sm" disabled={!templates.find(t => !!t) || !selectedDate}>Apply</Button>
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
                          className={cn(
                            "text-sm", 
                            task.completed ? 'line-through text-muted-foreground' : 'text-foreground' 
                          )}
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
                  {!hydrated && selectedDate ? "Loading tasks..." : "No tasks for this day. Add some or apply a template!"}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
    
