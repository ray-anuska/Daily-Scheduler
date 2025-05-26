
"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CalendarView } from '@/components/CalendarView';

export default function HomePage() {
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(true);

  const toggleTaskSidebar = () => {
    setIsTaskSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader 
        isTaskSidebarOpen={isTaskSidebarOpen}
        toggleTaskSidebar={toggleTaskSidebar}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
        <CalendarView isTaskSidebarOpen={isTaskSidebarOpen} />
      </main>
    </div>
  );
}
