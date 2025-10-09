import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { BoostButton } from "@/components/ui/boost-button";
import { BoostCard, BoostCardHeader, BoostCardContent, BoostCardTitle, BoostCardDescription } from "@/components/ui/boost-card";
import { BoostInput } from "@/components/ui/boost-input";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
    console.log("Login attempt:", { email, password });
  };

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
              >
                Entrar
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