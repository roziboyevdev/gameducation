export const ROUTES = {
  home: '/',
  solo: '/solo',
  battle: '/battle',
  brain: '/brain',
  profile: '/profile',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
