import { useState } from 'react';
import { Truck, RefreshCw, AlertCircle, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderCard } from '../components/OrderCard';
import { OrderFilters } from '../components/OrderFilters';
import { useAllOrders } from '../hooks/useQueries';
import { OrderStatus, type CustomerOrder } from '../backend';

export function CourierApp() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const { data: orders, isLoading, isError, refetch, isFetching } = useAllOrders();

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-app';
  const appId = encodeURIComponent(hostname);

  // Count orders per status
  const counts = (orders ?? []).reduce<Record<string, number>>((acc, order) => {
    const s = order.status as string;
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  // Filter orders
  const filteredOrders: CustomerOrder[] = (orders ?? []).filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  // Sort: pending first, then by timestamp desc
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusPriority: Record<string, number> = {
      [OrderStatus.pending]: 0,
      [OrderStatus.accepted]: 1,
      [OrderStatus.preparing]: 2,
      [OrderStatus.out_for_delivery]: 3,
      [OrderStatus.delivered]: 4,
      [OrderStatus.cancelled]: 5,
    };
    const pa = statusPriority[a.status as string] ?? 99;
    const pb = statusPriority[b.status as string] ?? 99;
    if (pa !== pb) return pa - pb;
    return Number(b.timestamp - a.timestamp);
  });

  const activeOrdersCount = (orders ?? []).filter(
    (o) =>
      o.status !== OrderStatus.delivered && o.status !== OrderStatus.cancelled
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Courier Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src="/assets/generated/courier-icon.dim_128x128.png"
                  alt="Courier"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-800 text-xl text-foreground tracking-tight">
                Food<span className="text-primary">Rush</span>{' '}
                <span className="text-muted-foreground font-normal text-base">Courier</span>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-800 text-foreground">
                Courier Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isLoading
                  ? 'Loading orders...'
                  : `${orders?.length ?? 0} total orders · ${activeOrdersCount} active`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <OrderFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={counts}
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-10 h-10 text-destructive mb-3" />
              <p className="font-display font-semibold text-foreground mb-1">
                Failed to load orders
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please check your connection and try again.
              </p>
              <Button variant="outline" onClick={() => refetch()} size="sm">
                Try Again
              </Button>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                {activeFilter === 'all' ? (
                  <Truck className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="font-display font-semibold text-foreground mb-1">
                {activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter.replace(/_/g, ' ')} orders`}
              </p>
              <p className="text-sm text-muted-foreground">
                {activeFilter === 'all'
                  ? 'Orders from customers will appear here'
                  : 'Try a different filter to see other orders'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedOrders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}

          {/* Auto-refresh note */}
          {!isLoading && !isError && (
            <p className="text-center text-xs text-muted-foreground mt-8">
              Dashboard auto-refreshes every 10 seconds
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-foreground">
                Food<span className="text-primary">Rush</span>
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
