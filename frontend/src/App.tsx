import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import CustomerPortalLayout from './components/CustomerPortalLayout';
import CustomerPortal from './pages/CustomerPortal';
import CourierApp from './pages/CourierApp';

// Root route — renders children directly
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Customer portal layout route
const customerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'customerLayout',
  component: CustomerPortalLayout,
});

// Customer portal index route
const indexRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: '/',
  component: CustomerPortal,
});

// Courier app route — standalone, no shared layout
const courierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courier',
  component: CourierApp,
});

const routeTree = rootRoute.addChildren([
  customerLayoutRoute.addChildren([indexRoute]),
  courierRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
