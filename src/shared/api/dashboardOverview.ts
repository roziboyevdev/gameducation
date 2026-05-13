import { useQuery } from '@tanstack/react-query';

export type DashboardOverview = {
  enrollmentPct: number;
  lessonMinutesTotal: number;
  dailyGoalMinutes: number;
};

async function fetchDashboardOverview(): Promise<DashboardOverview> {
  await new Promise((r) => setTimeout(r, 120));
  return {
    enrollmentPct: 72,
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
