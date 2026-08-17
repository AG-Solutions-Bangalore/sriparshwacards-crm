import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/** Shown while panel-check-status is in flight */
function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100">
      <div className="flex flex-col items-center gap-4">
        <svg className="h-10 w-10 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-medium text-stone-500">Connecting to server…</p>
      </div>
    </div>
  );
}

/** Shown when panel-check-status fails (server is down / no internet) */
function MaintenanceScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 text-center">
      <div className="max-w-sm rounded-2xl border border-amber-200 bg-white p-10 shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-xl font-bold text-stone-800">Server Unreachable</h1>
        <p className="mb-6 text-sm text-stone-500">
          We couldn't connect to the Sri Parshwa Cards server. Please check your internet connection or
          try again in a few moments.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/** Inner shell — reads app status from context */
function AppShell() {
  const { appStatus } = useAppContext();

  if (appStatus === 'loading') return <LoadingScreen />;
  if (appStatus === 'error')   return <MaintenanceScreen />;

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#1c1917',
            color: '#fafaf9',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          },
          success: { iconTheme: { primary: '#f59e0b', secondary: '#1c1917' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff'    } },
        }}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
