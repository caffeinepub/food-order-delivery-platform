import { type CustomerOrder, OrderStatus } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Loader2, ChevronDown, ChevronUp, Package, Clock } from 'lucide-react';
import { useState } from 'react';
import { useUpdateOrderStatus, useCancelOrder } from '../hooks/useQueries';

interface OrderCardProps {
  order: CustomerOrder;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; emoji: string }>> = {
  [OrderStatus.pending]: { status: OrderStatus.accepted, label: 'Accept Order', emoji: '✅' },
  [OrderStatus.accepted]: { status: OrderStatus.preparing, label: 'Start Preparing', emoji: '👨‍🍳' },
  [OrderStatus.preparing]: { status: OrderStatus.out_for_delivery, label: 'Out for Delivery', emoji: '🛵' },
  [OrderStatus.out_for_delivery]: { status: OrderStatus.delivered, label: 'Mark Delivered', emoji: '🎉' },
};

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();

  const nextAction = NEXT_STATUS[order.status as OrderStatus];
  const canCancel =
    order.status === OrderStatus.pending || order.status === OrderStatus.accepted;

  const handleAdvance = async () => {
    if (!nextAction) return;
    await updateStatus.mutateAsync({ orderId: order.orderId, status: nextAction.status });
  };

  const handleCancel = async () => {
    await cancelOrder.mutateAsync(order.orderId);
  };

  const isUpdating = updateStatus.isPending || cancelOrder.isPending;

  return (
    <Card className="border border-border shadow-card card-hover overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-700 text-sm text-foreground truncate">
                  {order.orderId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate font-mono text-xs">
                  {order.customerId.toString().slice(0, 12)}…
                </span>
              </div>
            </div>
            <OrderStatusBadge status={order.status as OrderStatus} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(order.timestamp)}</span>
            </div>
            <span className="font-display font-700 text-base text-primary">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Items Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 bg-secondary hover:bg-accent transition-colors text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          </div>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Expanded Items */}
        {expanded && (
          <div className="px-4 py-3 bg-secondary border-t border-border space-y-1.5 animate-fade-in">
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
        )}

        {/* Actions */}
        {(nextAction || canCancel) &&
          order.status !== OrderStatus.delivered &&
          order.status !== OrderStatus.cancelled && (
            <div className="p-4 pt-3 flex gap-2 border-t border-border">
              {nextAction && (
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs font-semibold gap-1.5"
                  onClick={handleAdvance}
                  disabled={isUpdating}
                >
                  {isUpdating && updateStatus.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{nextAction.emoji}</span>
                  )}
                  {nextAction.label}
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  {cancelOrder.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Cancel'
                  )}
                </Button>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
