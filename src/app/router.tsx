import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { AppShell } from '@/shared/ui/AppShell';
import { BattlePage } from '@/features/battle/BattlePage';
import { BrainMemoryPage } from '@/features/brain-memory/BrainMemoryPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { SoloMathPage } from '@/features/solo-math/SoloMathPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={ROUTES.home} element={<DashboardPage />} />
        <Route path={ROUTES.solo} element={<SoloMathPage />} />
        <Route path={ROUTES.battle} element={<BattlePage />} />
        <Route path={ROUTES.brain} element={<BrainMemoryPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
