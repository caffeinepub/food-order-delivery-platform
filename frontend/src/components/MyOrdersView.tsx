import { LogIn, ClipboardList, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyOrders } from '../hooks/useQueries';
import { OrderStatus } from '../backend';

interface MyOrdersViewProps {
  onLogin: () => void;
}

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MyOrdersView({ onLogin }: MyOrdersViewProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: orders, isLoading } = useGetMyOrders();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-700 text-foreground mb-2">
          Sign in to view your orders
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Your order history is tied to your account. Sign in to see all your past orders.
        </p>
        <Button onClick={onLogin} className="gap-2">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-7 w-40 mb-6" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  const sortedOrders = [...(orders ?? [])].sort(
    (a, b) => Number(b.timestamp - a.timestamp)
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-display text-2xl font-800 text-foreground mb-6">My Orders</h2>

      {sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            Your order history will appear here once you place your first order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card key={order.orderId} className="border border-border shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Order ID
                    </p>
                    <p className="font-display font-700 text-sm text-foreground">
                      {order.orderId}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status as OrderStatus} size="sm" />
                </div>

                <div className="space-y-1.5 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.itemName} × {Number(item.quantity)}
                      </span>
                      <span className="font-medium text-foreground">
                        ${(item.price * Number(item.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(order.timestamp)}
                  </span>
                  <span className="font-display font-700 text-base text-primary">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
