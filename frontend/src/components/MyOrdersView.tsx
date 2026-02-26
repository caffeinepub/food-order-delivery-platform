import React from 'react';
import { RefreshCw, Loader2, Package, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../backend';
import { useOrdersByCustomer } from '../hooks/useQueries';
import OrderStatusBadge from './OrderStatusBadge';

export default function MyOrdersView() {
  // useOrdersByCustomer polls every 15s and refetches on mount
  const { data: orders = [], isLoading, isError, refetch, isFetching } = useOrdersByCustomer();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-gray-900">My Orders</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
        <span className="text-xs text-gray-400">
          {isFetching ? 'Updating…' : 'Auto-refreshes every 15s'}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3 text-orange-400" />
          <p className="text-sm font-medium">Loading your orders…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-red-400">
          <AlertCircle size={32} className="mb-3" />
          <p className="text-sm font-medium text-gray-600">Failed to load orders</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium underline"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Package size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No orders yet</p>
          <p className="text-xs mt-1">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders
            .slice()
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map(order => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-card border border-orange-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
                  <div>
                    <span className="font-display font-semibold text-gray-900 text-sm">
                      #{order.orderId.slice(-8).toUpperCase()}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatDate(order.timestamp)} · {formatTime(order.timestamp)}
                    </span>
                  </div>
                  {/* Status badge always from backend data */}
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Items */}
                <div className="px-4 py-3 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-700">
                      <span>{item.itemName} × {Number(item.quantity)}</span>
                      <span className="text-gray-500">₹{(item.price * Number(item.quantity)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-display font-bold text-orange-500">₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
