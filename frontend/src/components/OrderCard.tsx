import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { CustomerOrder, OrderStatus } from '../backend';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: CustomerOrder;
  onDeliver?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
  isDelivering?: boolean;
  isDeleting?: boolean;
}

export default function OrderCard({ order, onDeliver, onDelete, isDelivering, isDeleting }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const currentStatus = order.status;
  const isBusy = isDelivering || isDeleting;
  const isActionable = currentStatus !== OrderStatus.delivered && currentStatus !== OrderStatus.cancelled;

  const handleDeliver = () => {
    if (onDeliver) {
      onDeliver(order.orderId);
    }
  };

  const handleDeleteClick = () => {
    setConfirmingDelete(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmingDelete(false);
    if (onDelete) {
      onDelete(order.orderId);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmingDelete(false);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-orange-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
        <div>
          <span className="font-display font-semibold text-gray-900 text-sm">
            #{order.orderId.slice(-8).toUpperCase()}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {formatDate(order.timestamp)} · {formatTime(order.timestamp)}
          </span>
        </div>
        <OrderStatusBadge status={currentStatus} />
      </div>

      {/* Customer & Total */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="font-display font-bold text-orange-500 text-lg">
          ₹{order.totalPrice.toFixed(2)}
        </div>
      </div>

      {/* Expandable Items */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 pb-2 flex items-center gap-1 text-xs text-orange-500 font-medium hover:text-orange-600 transition-colors"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide items' : 'Show items'}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-gray-700">
              <span>{item.itemName} × {Number(item.quantity)}</span>
              <span className="text-gray-500">₹{(item.price * Number(item.quantity)).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Banner */}
      {confirmingDelete && (
        <div className="mx-4 mb-3 p-3 bg-orange-50 border border-orange-300 rounded-xl">
          <p className="text-sm font-medium text-gray-800 mb-2">
            Permanently delete this order?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteConfirm}
              disabled={isBusy}
              className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm py-1.5 px-3 rounded-lg transition-colors"
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Yes, Delete
            </button>
            <button
              onClick={handleDeleteCancel}
              disabled={isBusy}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 font-medium text-sm py-1.5 px-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions for active orders */}
      {isActionable && (
        <div className="px-4 pb-4 flex gap-2">
          {/* Deliver Button */}
          <button
            onClick={handleDeliver}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm py-2 px-3 rounded-xl transition-colors"
          >
            {isDelivering ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Deliver
          </button>

          {/* Delete Button */}
          {!confirmingDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isBusy}
              className="flex items-center justify-center gap-1.5 border border-orange-300 text-orange-500 hover:bg-orange-50 disabled:opacity-60 font-medium text-sm py-2 px-3 rounded-xl transition-colors"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          )}
        </div>
      )}

      {/* Completed / Cancelled state */}
      {!isActionable && (
        <div className="px-4 pb-4 space-y-2">
          <div className={`text-center text-sm font-medium py-2 rounded-xl ${
            currentStatus === OrderStatus.delivered
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}>
            {currentStatus === OrderStatus.delivered ? '✓ Order Delivered' : '✗ Order Cancelled'}
          </div>
          {!confirmingDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-1.5 border border-orange-300 text-orange-500 hover:bg-orange-50 disabled:opacity-60 font-medium text-sm py-2 px-3 rounded-xl transition-colors"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
