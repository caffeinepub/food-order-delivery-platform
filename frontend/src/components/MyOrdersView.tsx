import React from 'react';
import { ShoppingBag, Loader2, RefreshCw } from 'lucide-react';
import { useGetMyOrders } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OrderStatusBadge from './OrderStatusBadge';
import { OrderStatus } from '../backend';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyOrdersView() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: orders = [], isLoading, isFetching, error, refetch } = useGetMyOrders();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-12 w-12 text-orange-200 mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold text-gray-700 mb-2">Sign In to View Orders</h2>
        <p className="text-gray-400 font-body">Please sign in to see your order history.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-500 font-body">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 font-body mb-4">Failed to load orders.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-orange-500 text-white rounded-full font-body text-sm hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-800">My Orders</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-body text-orange-500 border border-orange-200 rounded-full hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 text-orange-200 mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-gray-600 mb-2">No Orders Yet</h3>
          <p className="text-gray-400 font-body">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-orange-50 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-body font-semibold text-gray-800 text-sm">
                    Order #{order.orderId.slice(-8)}
                  </p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">
                    {formatDate(order.timestamp)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status as OrderStatus} />
              </div>

              {/* Order Items */}
              <div className="px-5 py-4">
                <div className="space-y-1.5 mb-3">
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
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-body font-bold text-gray-800 text-sm">Total</span>
                  <span className="font-display font-bold text-orange-500">
                    ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Polling indicator */}
      {sortedOrders.length > 0 && (
        <p className="text-center text-xs text-gray-300 font-body mt-6">
          Status updates automatically every 15 seconds
        </p>
      )}
    </div>
  );
}
