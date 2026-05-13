import { useQuery } from '@tanstack/react-query';

export type DashboardOverview = {
  /** Ro‘yxatdan o‘tish / kurs aktivligi foizi (progress halqasi uchun) */
  enrollmentPct: number;
  /** “86 video” kabi asosiy KPI */
  enrollmentVideos: number;
  lessonMinutesTotal: number;
  dailyGoalMinutes: number;
};

async function fetchDashboardOverview(): Promise<DashboardOverview> {
  await new Promise((r) => setTimeout(r, 120));
  return {
    enrollmentPct: 68,
    enrollmentVideos: 86,
    lessonMinutesTotal: 515,
    dailyGoalMinutes: 45,
  };
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: fetchDashboardOverview,
  });
}
