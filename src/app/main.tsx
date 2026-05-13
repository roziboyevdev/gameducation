import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { prefetchDashboardThreeChunks } from '@/app/prefetch3d';
import '@/styles/globals.css';

const schedulePrefetch =
  typeof globalThis.requestIdleCallback === 'function'
    ? (cb: () => void) => globalThis.requestIdleCallback(cb, { timeout: 2000 })
    : (cb: () => void) => globalThis.setTimeout(cb, 200);

schedulePrefetch(prefetchDashboardThreeChunks);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
