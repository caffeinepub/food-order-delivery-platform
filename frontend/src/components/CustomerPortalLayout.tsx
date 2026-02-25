import { Outlet } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export function CustomerPortalLayout() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-app';
  const appId = encodeURIComponent(hostname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-foreground">
                The Deccan <span className="text-primary">BHOJAN</span>
              </span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              Built with <Heart className="w-3.5 h-3.5 fill-primary text-primary mx-0.5" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
