import { CheckCircle2, Clock, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useOrderById } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '../backend';

interface OrderConfirmationProps {
  orderId: string;
  onNewOrder: () => void;
}

const STATUS_STEPS = [
  { status: OrderStatus.pending, label: 'Order Placed', icon: '📋' },
  { status: OrderStatus.accepted, label: 'Accepted', icon: '✅' },
  { status: OrderStatus.preparing, label: 'Preparing', icon: '👨‍🍳' },
  { status: OrderStatus.out_for_delivery, label: 'On the Way', icon: '🛵' },
  { status: OrderStatus.delivered, label: 'Delivered', icon: '🎉' },
];

const STATUS_ORDER = [
  OrderStatus.pending,
  OrderStatus.accepted,
  OrderStatus.preparing,
  OrderStatus.out_for_delivery,
  OrderStatus.delivered,
];

export function OrderConfirmation({ orderId, onNewOrder }: OrderConfirmationProps) {
  const { data: order, isLoading, refetch, isFetching } = useOrderById(orderId);

  const currentStatusIndex = order
    ? STATUS_ORDER.indexOf(order.status as OrderStatus)
    : 0;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-800 text-foreground mb-2">
          Order Confirmed! 🎉
        </h2>
        <p className="text-muted-foreground">
          Your order has been placed successfully.
        </p>
      </div>

      {/* Order ID Card */}
      <Card className="border border-border shadow-card mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Order ID
              </p>
              <p className="font-display font-700 text-lg text-foreground">{orderId}</p>
            </div>
            {order && <OrderStatusBadge status={order.status as OrderStatus} />}
          </div>

          {/* Progress Steps */}
          {order?.status !== OrderStatus.cancelled && (
            <div className="mt-4">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-border -z-0" />
                <div
                  className="absolute left-0 top-4 h-0.5 bg-primary transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(0, (currentStatusIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
                  }}
                />
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-1.5 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-card border-2 border-border text-muted-foreground'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`text-xs font-medium text-center leading-tight max-w-[60px] ${
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      {isLoading ? (
        <Card className="border border-border shadow-card mb-6">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ) : order ? (
        <Card className="border border-border shadow-card mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <p className="font-medium text-sm text-foreground">Order Details</p>
            </div>
            <div className="space-y-2">
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
              <div className="border-t border-border pt-2 flex justify-between font-display font-700">
                <span>Total</span>
                <span className="text-primary">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Live Status Note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-xl px-4 py-3 mb-6">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Status updates automatically every 8 seconds</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <Button
        variant="outline"
        className="w-full h-11 font-semibold"
        onClick={onNewOrder}
      >
        Place Another Order
      </Button>
    </div>
  );
}
