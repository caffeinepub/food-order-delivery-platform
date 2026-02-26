import React, { useState } from 'react';
import { ShoppingCart, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface CustomerNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  cartItemCount: number;
  onCartOpen: () => void;
}

export default function CustomerNavigation({
  currentView,
  onViewChange,
  cartItemCount,
  onCartOpen,
}: CustomerNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { id: 'menu', label: 'Menu' },
    { id: 'orders', label: 'My Orders' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-orange-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onViewChange('menu')}
          >
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-orange">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-orange-600 hidden sm:block">
              The Deccan BHOJAN
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onViewChange(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === link.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={onCartOpen}
              className="relative p-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Auth button */}
            <button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              className={`hidden sm:flex px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAuthenticated
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              } disabled:opacity-50`}
            >
              {loginStatus === 'logging-in' ? 'Signing in...' : isAuthenticated ? 'Sign Out' : 'Sign In'}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-orange-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onViewChange(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === link.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                handleAuth();
                setMobileMenuOpen(false);
              }}
              disabled={loginStatus === 'logging-in'}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAuthenticated
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              } disabled:opacity-50`}
            >
              {loginStatus === 'logging-in' ? 'Signing in...' : isAuthenticated ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
