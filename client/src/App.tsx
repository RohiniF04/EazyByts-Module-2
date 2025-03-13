import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { UserPreferencesProvider } from "@/context/user-preferences";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import StockPage from "@/pages/stock";
import Watchlist from "@/pages/watchlist";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 md:pl-60 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      <Route path="/portfolio" component={() => (
        <MainLayout>
          <Portfolio />
        </MainLayout>
      )} />
      <Route path="/stock/:symbol" component={() => (
        <MainLayout>
          <StockPage />
        </MainLayout>
      )} />
      <Route path="/watchlist" component={() => (
        <MainLayout>
          <Watchlist />
        </MainLayout>
      )} />
      {/* Fallback to 404 */}
      <Route component={() => (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider>
        <Router />
        <Toaster />
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}

export default App;
