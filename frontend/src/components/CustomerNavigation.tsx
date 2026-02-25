import { ShoppingBag, ClipboardList, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoginButton } from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export type CustomerView = 'menu' | 'my-orders' | 'account';

interface CustomerNavigationProps {
  activeView: CustomerView;
  onViewChange: (view: CustomerView) => void;
}

const NAV_ITEMS: { view: CustomerView; label: string; icon: React.ReactNode }[] = [
  { view: 'menu', label: 'Browse Menu', icon: <ShoppingBag className="w-4 h-4" /> },
  { view: 'my-orders', label: 'My Orders', icon: <ClipboardList className="w-4 h-4" /> },
  { view: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
];

export function CustomerNavigation({ activeView, onViewChange }: CustomerNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleViewChange = (view: CustomerView) => {
    onViewChange(view);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleViewChange('menu')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="/assets/generated/logo-icon.dim_256x256.png"
                alt="FoodRush Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-800 text-xl text-foreground tracking-tight">
              Food<span className="text-primary">Rush</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ view, label, icon }) => (
              <Button
                key={view}
                variant={activeView === view ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 font-medium"
                onClick={() => handleViewChange(view)}
              >
                {icon}
                {label}
              </Button>
            ))}
          </nav>

          {/* Desktop Auth + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LoginButton />
            </div>
            {/* Mobile: show auth status indicator */}
            {isAuthenticated && (
              <div className="md:hidden w-2 h-2 rounded-full bg-green-500" title="Signed in" />
            )}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 animate-fade-in">
            {NAV_ITEMS.map(({ view, label, icon }) => (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${
                  activeView === view
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
            <div className="pt-2 px-3">
              <LoginButton variant="outline" className="w-full justify-center" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
