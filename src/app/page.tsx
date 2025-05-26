
import { AppHeader } from '@/components/AppHeader';
import { CalendarView } from '@/components/CalendarView'; // Import the new CalendarView

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Replace placeholder with CalendarView component */}
        <CalendarView />
      </main>
    </div>
  );
}
