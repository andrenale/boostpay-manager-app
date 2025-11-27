import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthGuard } from "./components/AuthGuard";
import { ApiTestsNavigation } from "./test-pages/ApiTestsNavigation";
import { ProductsApiTest } from "./test-pages/ProductsApiTest";
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

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireSuperuser?: boolean }> = ({ 
  children, 
  requireSuperuser = false 
}) => (
  <AuthGuard requireSuperuser={requireSuperuser}>
    <AppLayout>
      {children}
    </AppLayout>
  </AuthGuard>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cobranca" element={<Cobranca />} />
            <Route path="/cobranca/sucesso" element={<CobrancaSucesso />} />
            
            {/* Development Routes - Protected */}
            <Route path="/dev/api-tests" element={
              <AuthGuard requireSuperuser={true}>
                <ApiTestsNavigation />
              </AuthGuard>
            } />
            <Route path="/dev/api-tests/products" element={
              <AuthGuard requireSuperuser={true}>
                <ProductsApiTest />
              </AuthGuard>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />
            <Route path="/split" element={
              <ProtectedRoute>
                <Split />
              </ProtectedRoute>
            } />
            <Route path="/produtos" element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            } />
            <Route path="/financial" element={
              <ProtectedRoute>
                <Financial />
              </ProtectedRoute>
            } />
            <Route path="/disputes" element={
              <ProtectedRoute>
                <Disputes />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } />
            <Route path="/api-documentation" element={
              <ProtectedRoute>
                <ApiDocumentation />
              </ProtectedRoute>
            } />
            <Route path="/code-examples" element={
              <ProtectedRoute>
                <CodeExamples />
              </ProtectedRoute>
            } />
            
            {/* Special Protected Routes */}
            <Route path="/onboarding" element={
              <AuthGuard>
                <Onboarding />
              </AuthGuard>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;