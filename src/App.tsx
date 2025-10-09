import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Split from "./pages/Split";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Financial from "./pages/Financial";
import Disputes from "./pages/Disputes";
import { Onboarding } from "./pages/Onboarding";
import ApiDocumentation from "./pages/ApiDocumentation";
import CodeExamples from "./pages/CodeExamples";
import Cobranca from "./pages/Cobranca";
import CobrancaSucesso from "./pages/CobrancaSucesso";
import Checkout from "./pages/Checkout";
import Produtos from "./pages/Produtos";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/transactions" element={
            <AppLayout>
              <Transactions />
            </AppLayout>
          } />
          <Route path="/split" element={
            <AppLayout>
              <Split />
            </AppLayout>
          } />
          <Route path="/cobranca" element={
            <AppLayout>
              <Cobranca />
            </AppLayout>
          } />
          <Route path="/cobranca/sucesso" element={
            <AppLayout>
              <CobrancaSucesso />
            </AppLayout>
          } />
          <Route path="/produtos" element={
            <AppLayout>
              <Produtos />
            </AppLayout>
          } />
          <Route path="/financial" element={
            <AppLayout>
              <Financial />
            </AppLayout>
          } />
          <Route path="/disputes" element={
            <AppLayout>
              <Disputes />
            </AppLayout>
          } />
          <Route path="/clients" element={
            <AppLayout>
              <Clients />
            </AppLayout>
          } />
          <Route path="/settings" element={
            <AppLayout>
              <Settings />
            </AppLayout>
          } />
          <Route path="/help" element={
            <AppLayout>
              <Help />
            </AppLayout>
          } />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/api-documentation" element={
            <AppLayout>
              <ApiDocumentation />
            </AppLayout>
          } />
          <Route path="/code-examples" element={
            <AppLayout>
              <CodeExamples />
            </AppLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;