import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/shared/ui/AppHeader';
import { BottomNav } from '@/shared/ui/BottomNav';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
