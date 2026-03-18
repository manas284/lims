import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Samples from "@/pages/samples";
import Tests from "@/pages/tests";
import Inventory from "@/pages/inventory";
import Workflows from "@/pages/workflows";
import Storage from "@/pages/storage";
import Reports from "@/pages/reports";
import AuditLogs from "@/pages/audit";
import Users from "@/pages/users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/samples" component={Samples} />
        <Route path="/tests" component={Tests} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/storage" component={Storage} />
        <Route path="/reports" component={Reports} />
        <Route path="/audit-logs" component={AuditLogs} />
        <Route path="/users" component={Users} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster theme="dark" position="bottom-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
