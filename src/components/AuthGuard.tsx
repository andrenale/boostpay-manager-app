import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Unauthorized from '../pages/Unauthorized';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  redirectTo?: string;
  requireSuperuser?: boolean;
}

// Loading component
const AuthLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
    </div>
  </div>
);

// Unauthorized component
const UnauthorizedFallback: React.FC = () => <Unauthorized />;

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback: CustomFallback = AuthLoadingFallback,
  redirectTo = '/login',
  requireSuperuser = false 
}) => {
  const authContext = useAuth();
  const location = useLocation();

  // Use auth context state directly instead of creating separate state
  const { isAuthenticated, user, isLoading, error } = authContext;

  // Show loading while verifying
  if (isLoading) {
    return <CustomFallback />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('AuthGuard: User not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check superuser requirement
  if (requireSuperuser && user && !user.is_superuser) {
    console.log('AuthGuard: Superuser access required, user does not have permission');
    return <UnauthorizedFallback />;
  }

  // Check if user account is active
  if (user && !user.is_active) {
    console.log('AuthGuard: User account is inactive');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Conta Inativa</h2>
          <p className="text-muted-foreground">Sua conta está inativa. Entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  console.log('AuthGuard: Authentication successful, rendering protected content');
  return <>{children}</>;
};

// Higher-order component version for easier usage
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) => {
  const AuthGuardedComponent: React.FC<P> = (props) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );

  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  return AuthGuardedComponent;
};