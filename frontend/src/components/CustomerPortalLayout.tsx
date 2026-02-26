import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export default function CustomerPortalLayout() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'the-deccan-bhojan'
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-orange-100 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © {year} The Deccan BHOJAN. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
            Built with <Heart className="w-3 h-3 text-orange-500 fill-orange-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
