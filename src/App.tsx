import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { BetCardSkeleton } from './components/ui/Skeleton';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const CreateBetPage = lazy(() => import('./pages/CreateBetPage'));
const MyBetsPage = lazy(() => import('./pages/MyBetsPage'));
const BetDetailPage = lazy(() => import('./pages/BetDetailPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <BetCardSkeleton key={i} />)}
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <PageSuspense>
                  <HomePage />
                </PageSuspense>
              }
            />
            <Route
              path="/explore"
              element={
                <PageSuspense>
                  <ExplorePage />
                </PageSuspense>
              }
            />
            <Route
              path="/create"
              element={
                <PageSuspense>
                  <CreateBetPage />
                </PageSuspense>
              }
            />
            <Route
              path="/my-bets"
              element={
                <PageSuspense>
                  <MyBetsPage />
                </PageSuspense>
              }
            />
            <Route
              path="/bets/:id"
              element={
                <PageSuspense>
                  <BetDetailPage />
                </PageSuspense>
              }
            />
            <Route
              path="/how-it-works"
              element={
                <PageSuspense>
                  <HowItWorksPage />
                </PageSuspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
