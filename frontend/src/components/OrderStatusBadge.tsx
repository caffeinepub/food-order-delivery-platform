import { OrderStatus } from '../backend';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  [OrderStatus.pending]: {
    label: 'Pending',
    className: 'status-pending',
    dot: 'bg-yellow-400',
  },
  [OrderStatus.accepted]: {
    label: 'Accepted',
    className: 'status-accepted',
    dot: 'bg-blue-400',
  },
  [OrderStatus.preparing]: {
    label: 'Preparing',
    className: 'status-preparing',
    dot: 'bg-cyan-400',
  },
  [OrderStatus.out_for_delivery]: {
    label: 'Out for Delivery',
    className: 'status-out_for_delivery',
    dot: 'bg-orange-400',
  },
  [OrderStatus.delivered]: {
    label: 'Delivered',
    className: 'status-delivered',
    dot: 'bg-green-400',
  },
  [OrderStatus.cancelled]: {
    label: 'Cancelled',
    className: 'status-cancelled',
    dot: 'bg-red-400',
  },
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[OrderStatus.pending];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border transition-all duration-300 ${config.className} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse-soft`} />
      {config.label}
    </span>
  );
}
