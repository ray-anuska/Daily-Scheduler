
"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { TaskTemplate } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ListChecks, PlusCircle } from 'lucide-react';

interface TemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateManager({ open, onOpenChange }: TemplateManagerProps) {
  const { toast } = useToast();
  const { templates, addTemplate, deleteTemplate, updateTemplate } = useAppStore();

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateTasks, setNewTemplateTasks] = useState(''); // Titles, one per line

  // Edit State
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateTasks, setEditTemplateTasks] = useState('');


  const handleAddTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({ title: 'Error', description: 'Template name cannot be empty.', variant: 'destructive' });
      return;
    }
    const taskTitles = newTemplateTasks.split('\n').map(t => t.trim()).filter(t => t);
    if (taskTitles.length === 0) {
      toast({ title: 'Error', description: 'Template must have at least one task.', variant: 'destructive' });
      return;
    }
    const templateData = {
      name: newTemplateName.trim(),
      tasks: taskTitles.map(title => ({ title })),
    };
    addTemplate(templateData);
    setNewTemplateName('');
    setNewTemplateTasks('');
    toast({ title: 'Template Added', description: `${templateData.name} has been created.` });
  };

  const handleStartEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setEditTemplateName(template.name);
    setEditTemplateTasks(template.tasks.map(t => t.title).join('\n'));
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditTemplateName('');
    setEditTemplateTasks('');
  };

  const handleSaveEdit = () => {
    if (!editingTemplate) return;
    if (!editTemplateName.trim()) {
      toast({ title: 'Error', description: 'Template name cannot be empty.', variant: 'destructive' });
      return;
    }
    const taskTitles = editTemplateTasks.split('\n').map(t => t.trim()).filter(t => t);
    if (taskTitles.length === 0) {
      toast({ title: 'Error', description: 'Template must have at least one task.', variant: 'destructive' });
      return;
    }
    updateTemplate({
      ...editingTemplate,
      name: editTemplateName.trim(),
      tasks: taskTitles.map(title => ({ title })),
    });
    toast({ title: 'Template Updated', description: `${editTemplateName.trim()} has been updated.` });
    handleCancelEdit();
  };


  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) handleCancelEdit(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" /> Task Templates</DialogTitle>
          <DialogDescription>
            Manage your daily task templates. Create new templates or modify existing ones.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto min-h-0">
          <div className="space-y-6 p-4"> {/* Changed pr-4 to p-4 */}
            {editingTemplate ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Edit Template: {editingTemplate.name}</h3>
                <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                  <div>
                    <Label htmlFor="edit-template-name">Template Name</Label>
                    <Input
                      id="edit-template-name"
                      value={editTemplateName}
                      onChange={(e) => setEditTemplateName(e.target.value)}
                      className="mt-1 bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-template-tasks">Task Titles (one per line)</Label>
                    <Textarea
                      id="edit-template-tasks"
                      value={editTemplateTasks}
                      onChange={(e) => setEditTemplateTasks(e.target.value)}
                      rows={5}
                      className="mt-1 bg-background"
                      placeholder="E.g.&#10;Morning Workout&#10;Read for 30 minutes&#10;Plan tomorrow's tasks"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-3">Create New Template</h3>
                <div className="space-y-3 p-4 border rounded-md">
                  <div>
                    <Label htmlFor="new-template-name">Template Name</Label>
                    <Input
                      id="new-template-name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="E.g., Weekday Routine"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-template-tasks">Task Titles (one per line)</Label>
                    <Textarea
                      id="new-template-tasks"
                      value={newTemplateTasks}
                      onChange={(e) => setNewTemplateTasks(e.target.value)}
                      rows={3}
                      className="mt-1"
                      placeholder="E.g.&#10;Morning Workout&#10;Read for 30 minutes&#10;Plan tomorrow's tasks"
                    />
                  </div>
                  <Button onClick={handleAddTemplate} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Template
                  </Button>
                </div>
              </div>
            )}


            {templates.length > 0 && <Separator />}

            {templates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Existing Templates</h3>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <Card key={template.id} className={editingTemplate?.id === template.id ? 'opacity-50' : ''}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {!editingTemplate && (
                          <div className="flex items-center gap-2">
                             <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(template)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                deleteTemplate(template.id);
                                toast({ title: 'Template Deleted', description: `${template.name} has been deleted.` });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        {template.tasks.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {template.tasks.slice(0, 3).map((task, index) => (
                              <li key={index}>{task.title}</li>
                            ))}
                            {template.tasks.length > 3 && <li>...and {template.tasks.length - 3} more.</li>}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tasks in this template.</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
             {templates.length === 0 && !editingTemplate && (
              <p className="text-center text-muted-foreground py-4">No templates created yet. Add one above!</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); handleCancelEdit(); }}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
