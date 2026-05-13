/**
 * Dashboard’da ishlatiladigan 3D modul chunk’larini brauzer bo‘sh vaqtida oldindan yuklash.
 * Keyingi navigatsiya / qayta ochishda (SW kesh bilan) ancha tez ishga tushadi.
 */
export function prefetchDashboardThreeChunks(): void {
  void import('@/shared/ui/MascotScene');
  void import('@/features/dashboard/GameCard3DIcon');
}
