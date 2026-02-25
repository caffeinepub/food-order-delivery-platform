import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import { CustomerPortalLayout } from './components/CustomerPortalLayout';
import { CustomerPortal } from './pages/CustomerPortal';

// Root route with customer portal layout
const rootRoute = createRootRoute({
  component: CustomerPortalLayout,
});

// Customer portal route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CustomerPortal,
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
