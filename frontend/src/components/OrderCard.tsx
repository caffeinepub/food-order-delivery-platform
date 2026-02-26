import React from 'react';
import { Clock, ChefHat, Truck, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { CustomerOrder, OrderStatus } from '../backend';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: CustomerOrder;
  onUpdateStatus: (orderId: string, status: string) => void;
  onCancelOrder: (orderId: string) => void;
  isUpdating?: boolean;
}

const NEXT_STATUS: Record<string, { label: string; value: string; icon: React.ElementType } | null> = {
  [OrderStatus.pending]: { label: 'Accept Order', value: OrderStatus.accepted, icon: CheckCircle },
  [OrderStatus.accepted]: { label: 'Start Preparing', value: OrderStatus.preparing, icon: ChefHat },
  [OrderStatus.preparing]: { label: 'Out for Delivery', value: OrderStatus.out_for_delivery, icon: Truck },
  [OrderStatus.out_for_delivery]: { label: 'Mark Delivered', value: OrderStatus.delivered, icon: Package },
  [OrderStatus.delivered]: null,
  [OrderStatus.cancelled]: null,
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderCard({ order, onUpdateStatus, onCancelOrder, isUpdating = false }: OrderCardProps) {
  // Status is always sourced from the order prop (which comes from backend data)
  const currentStatus = order.status as OrderStatus;
  const nextAction = NEXT_STATUS[currentStatus] ?? null;
  const canCancel = currentStatus !== OrderStatus.delivered && currentStatus !== OrderStatus.cancelled;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-50">
      {/* Card Header */}
      <div className="bg-orange-50 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="font-body font-semibold text-gray-800 text-sm">
            Order #{order.orderId.slice(-8)}
          </p>
          <p className="font-body text-xs text-gray-400 mt-0.5">
            {formatDate(order.timestamp)}
          </p>
        </div>
        <OrderStatusBadge status={currentStatus} />
      </div>

      {/* Order Items */}
      <div className="px-5 py-4">
        <div className="space-y-1.5 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-body text-sm text-gray-700">
                {item.itemName}
                <span className="text-gray-400 ml-1">× {Number(item.quantity)}</span>
              </span>
              <span className="font-body text-sm font-medium text-gray-700">
                ₹{(item.price * Number(item.quantity)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-4">
          <span className="font-body font-bold text-gray-800 text-sm">Total</span>
          <span className="font-display font-bold text-orange-500">
            ₹{order.totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {nextAction && (
            <button
              onClick={() => onUpdateStatus(order.orderId, nextAction.value)}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-body font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <nextAction.icon className="h-4 w-4" />
              )}
              {isUpdating ? 'Updating...' : nextAction.label}
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onCancelOrder(order.orderId)}
              disabled={isUpdating}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl font-body font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
