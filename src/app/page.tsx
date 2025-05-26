import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Monthly Calendar</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {/* CalendarView component will be implemented here */}
              <p className="text-muted-foreground p-4">
                Calendar view will be displayed here. Tasks and templates will be manageable soon.
              </p>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                 <span className="text-muted-foreground text-lg">Calendar Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
