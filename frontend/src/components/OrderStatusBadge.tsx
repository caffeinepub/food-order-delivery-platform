import React from 'react';
import { OrderStatus } from '../backend';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  showDot?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [OrderStatus.pending]: {
    label: 'Pending',
    className: 'badge-pending',
  },
  [OrderStatus.accepted]: {
    label: 'Accepted',
    className: 'badge-accepted',
  },
  [OrderStatus.preparing]: {
    label: 'Preparing',
    className: 'badge-preparing',
  },
  [OrderStatus.out_for_delivery]: {
    label: 'Out for Delivery',
    className: 'badge-out_for_delivery',
  },
  [OrderStatus.delivered]: {
    label: 'Delivered',
    className: 'badge-delivered',
  },
  [OrderStatus.cancelled]: {
    label: 'Cancelled',
    className: 'badge-cancelled',
  },
};

export default function OrderStatusBadge({ status, showDot = true }: OrderStatusBadgeProps) {
  const config = statusConfig[status as string] ?? {
    label: String(status),
    className: 'badge-pending',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      )}
      {config.label}
    </span>
  );
}
