import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostInput } from "@/components/ui/boost-input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { DEV_AUTH_TOKEN, isDevAuth } from "@/config/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if we're in development mode with dev token
      if (isDevAuth() && DEV_AUTH_TOKEN) {
        // Development mode: use hardcoded token
        console.log('🔧 Development mode: Using dev token for login');
        const success = await loginWithRedirect(DEV_AUTH_TOKEN);
        
        if (!success) {
          toast({
            title: "Erro no Login",
            description: "Credenciais inválidas ou erro de autenticação.",
            variant: "destructive",
          });
        }
      } else {
        // Production mode: call the actual login API
        console.log('🔒 Production mode: Calling login API');
        
        // TODO: Replace this with your actual login API call
        // const response = await apiService.post('/auth/login', { email, password });
        // const { access_token } = response.data;
        // const success = await loginWithRedirect(access_token);
        
        toast({
          title: "Login Indisponível",
          description: "A funcionalidade de login ainda não foi implementada para produção.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no Login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-boost-accent" />
          <p className="text-boost-text-secondary">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Floating Elements Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-boost-accent rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-boost-accent rounded-full opacity-5 animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-boost-accent rounded-full opacity-5 animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 boost-glow">
            <span className="text-boost-text-primary font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold boost-gradient-text">Boost Pay</h1>
          <p className="text-boost-text-secondary mt-2">Plataforma de Pagamentos Online</p>
        </div>

        {/* Login Card */}
        <BoostCard className="animate-scale-in">
          <BoostCardHeader className="text-center">
            <BoostCardTitle className="text-2xl">Acesse sua conta</BoostCardTitle>
            <BoostCardDescription>
              Entre com suas credenciais para acessar o painel
            </BoostCardDescription>
          </BoostCardHeader>
          <BoostCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-boost-text-secondary">
                  E-mail
                </label>
                <BoostInput
                  type="email"
                  placeholder="seu@email.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-boost-text-secondary">
                  Senha
                </label>
                <div className="relative">
                  <BoostInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    icon={<Lock className="h-4 w-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-boost-text-secondary hover:text-boost-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-boost-accent hover:text-boost-accent-hover transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Login Button */}
              <BoostButton 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </BoostButton>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-boost-text-secondary">
                Não tem uma conta?{" "}
                <Link 
                  to="/signup" 
                  className="text-boost-accent hover:text-boost-accent-hover font-semibold transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </BoostCardContent>
        </BoostCard>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-boost-text-muted">
          © 2024 Boost Pay. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Login;