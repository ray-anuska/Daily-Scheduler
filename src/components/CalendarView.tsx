
"use client";

import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, CalendarDays, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Task } from '@/lib/types';

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
    return formattedSelectedDate ? getTasksForDate(formattedSelectedDate) : undefined;
  }, [formattedSelectedDate, getTasksForDate]);

  const tasksForSelectedDay: Task[] = dailyTasksData?.tasks || [];
  const dayOverridesTemplate: boolean = dailyTasksData?.overridesTemplate || false;

  const [newTaskTitle, setNewTaskTitle] = useState('');

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
    
    // The store's applyTemplateToDate already handles the logic for forceOverride
    // and not applying if dayOverridesTemplate is true and force is false.
    // We can rely on that and provide feedback.
    const currentTasks = getTasksForDate(formattedSelectedDate);
    const originalTaskCount = currentTasks?.tasks.length || 0;
    const wasOverriding = currentTasks?.overridesTemplate || false;

    applyTemplateToDate(templateId, formattedSelectedDate, force);
    
    const newTasks = getTasksForDate(formattedSelectedDate);
    if (newTasks && (newTasks.tasks.length !== originalTaskCount || !wasOverriding || force)) {
      toast({ title: "Template Applied", description: `Template applied to ${format(selectedDate!, 'MMMM d, yyyy')}.` });
    } else if (wasOverriding && !force) {
       toast({ title: "Template Not Applied", description: "Day has custom tasks. Use 'Force Apply' to override.", variant: "default" });
    } else {
       toast({ title: "Template Not Applied", description: "Could not apply template.", variant: "destructive" });
    }
  };


  const daysWithTasks = useMemo(() => {
    return Object.keys(tasksByDate)
      .filter(dateStr => tasksByDate[dateStr]?.tasks?.length > 0)
      .map(dateStr => parseISO(dateStr));
  }, [tasksByDate]);

  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
      <Card className="md:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Monthly Calendar
          </CardTitle>
          <CardDescription>Select a day to view and manage its tasks.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border bg-card"
            modifiers={{ hasTasks: daysWithTasks }}
            modifiersClassNames={{
              hasTasks: 'relative !bg-primary/20 dark:!bg-primary/30',
            }}
            components={{
              DayContent: (props) => {
                const originalDayContent = <div className={props. γελοιογράφος?.dayDivClassName || ''}>{props.date.getDate()}</div>; // default renderer
                if (props.displayMonth.getMonth() !== props.date.getMonth()) {
                  return originalDayContent;
                }
                const dateKey = format(props.date, 'yyyy-MM-dd');
                const dayData = tasksByDate[dateKey];
                if (dayData && dayData.tasks.length > 0) {
                  const completedTasks = dayData.tasks.filter(t => t.completed).length;
                  const totalTasks = dayData.tasks.length;
                  let indicatorColor = 'bg-muted-foreground/30'; // Default for some tasks
                  if (totalTasks > 0) {
                    if (completedTasks === totalTasks) indicatorColor = 'bg-green-500/70'; // All completed
                    else if (completedTasks > 0) indicatorColor = 'bg-yellow-500/70'; // Some completed
                  }
                  
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {originalDayContent}
                      <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${indicatorColor}`} />
                    </div>
                  );
                }
                return originalDayContent;
              }
            }}
          />
        </CardContent>
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
        <CardContent className="flex flex-col h-[calc(100%-7rem)]"> {/* Adjust height as needed */}
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
                <Select onValueChange={(templateId) => { if(templateId) handleApplyTemplate(templateId); }}>
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
                    <Button variant="outline" size="sm" disabled={!useAppStore.getState().templates.find(t => !!t) || !selectedDate}>Force Apply</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Force Apply Template?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will override any custom tasks for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'this day'}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                       <Select onValueChange={(templateId) => {
                          if(templateId) {
                            handleApplyTemplate(templateId, true);
                            // Close dialog - find a way if Radix allows closing parent from child action
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
