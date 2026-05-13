import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { useHydrateSession } from '@/app/useHydrateSession';

function Root() {
  useHydrateSession();
  return <AppRouter />;
}

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </AppProviders>
  );
}
