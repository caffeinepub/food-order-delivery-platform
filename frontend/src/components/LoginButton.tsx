import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, LogOut } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function LoginButton({ variant = 'default', size = 'sm', className }: LoginButtonProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      variant={isAuthenticated ? 'outline' : variant}
      size={size}
      onClick={handleAuth}
      disabled={isLoggingIn}
      className={`gap-2 font-medium ${className ?? ''}`}
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Signing in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          Sign Out
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          Sign In
        </>
      )}
    </Button>
  );
}
