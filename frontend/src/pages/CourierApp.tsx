import React, { useState } from 'react';
import { Package, RefreshCw, Loader2 } from 'lucide-react';
import { useAllOrders, useUpdateOrderStatus, useCancelOrder } from '../hooks/useQueries';
import OrderCard from '../components/OrderCard';
import OrderFilters from '../components/OrderFilters';
import CourierPinGate from '../components/CourierPinGate';
import MenuManagementSection from '../components/MenuManagementSection';
import { useCourierAccess } from '../hooks/useCourierAccess';
import { CustomerOrder, OrderStatus } from '../backend';

type Tab = 'orders' | 'menu';

export default function CourierApp() {
  const { hasAccess, grantAccess } = useCourierAccess();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  // Always fetch from backend on mount and poll every 15 seconds
  const { data: orders = [], isLoading, isFetching, error, refetch } = useAllOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  if (!hasAccess) {
    return <CourierPinGate onAccess={grantAccess} />;
  }

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  // Sort: active orders first, then by timestamp descending
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const activeStatuses: string[] = [
      OrderStatus.pending,
      OrderStatus.accepted,
      OrderStatus.preparing,
      OrderStatus.out_for_delivery,
    ];
    const aActive = activeStatuses.includes(a.status as string);
    const bActive = activeStatuses.includes(b.status as string);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return Number(b.timestamp) - Number(a.timestamp);
  });

  const pendingCount = orders.filter((o) => o.status === OrderStatus.pending).length;
  const activeCount = orders.filter((o) =>
    ([OrderStatus.accepted, OrderStatus.preparing, OrderStatus.out_for_delivery] as string[]).includes(o.status as string)
  ).length;

  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'the-deccan-bhojan'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-orange-500 sticky top-0 z-40 shadow-orange">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/courier-icon.dim_128x128.png"
              alt="Courier"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight">
                Courier Dashboard
              </h1>
              <p className="text-orange-100 text-xs">The Deccan BHOJAN</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="bg-white text-orange-500 text-xs font-bold px-2.5 py-1 rounded-full">
                {pendingCount} new
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-full bg-orange-400 hover:bg-orange-600 transition-colors disabled:opacity-50"
              title="Refresh orders"
            >
              <RefreshCw className={`h-4 w-4 text-white ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-0 flex gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-orange-500'
                : 'text-orange-100 hover:text-white'
            }`}
          >
            Orders
            {activeCount > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'orders' ? 'bg-orange-100 text-orange-600' : 'bg-orange-400 text-white'
              }`}>
                {activeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'menu'
                ? 'bg-white text-orange-500'
                : 'text-orange-100 hover:text-white'
            }`}
          >
            Menu Management
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {activeTab === 'orders' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                <p className="text-2xl font-display font-bold text-orange-500">{orders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total Orders</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                <p className="text-2xl font-display font-bold text-yellow-500">{pendingCount}</p>
                <p className="text-xs text-gray-500 mt-1">Pending</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                <p className="text-2xl font-display font-bold text-green-500">{activeCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active</p>
              </div>
            </div>

            {/* Filters — uses the existing OrderFilters component interface */}
            <OrderFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              orders={orders}
            />

            {/* Orders List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <p className="mt-4 text-gray-500">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-400 mb-4">Failed to load orders.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-orange-200 mx-auto mb-4" />
                <h3 className="text-lg font-display font-semibold text-gray-600 mb-2">
                  {activeFilter === 'all' ? 'No Orders Yet' : `No ${activeFilter} orders`}
                </h3>
                <p className="text-gray-400">
                  {activeFilter === 'all'
                    ? 'Orders will appear here when customers place them.'
                    : 'Try a different filter to see other orders.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {sortedOrders.map((order: CustomerOrder) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onUpdateStatus={(orderId, status) =>
                      updateStatusMutation.mutate({ orderId, status })
                    }
                    onCancelOrder={(orderId) => cancelOrderMutation.mutate(orderId)}
                    isUpdating={
                      (updateStatusMutation.isPending &&
                        (updateStatusMutation.variables as { orderId: string } | undefined)?.orderId === order.orderId) ||
                      (cancelOrderMutation.isPending &&
                        cancelOrderMutation.variables === order.orderId)
                    }
                  />
                ))}
              </div>
            )}

            {orders.length > 0 && (
              <p className="text-center text-xs text-gray-300 mt-6">
                Orders refresh automatically every 15 seconds
              </p>
            )}
          </>
        )}

        {activeTab === 'menu' && <MenuManagementSection />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-100 py-5 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© {year} The Deccan BHOJAN. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-1">
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
