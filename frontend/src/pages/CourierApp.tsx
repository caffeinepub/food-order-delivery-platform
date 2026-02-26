import React, { useState, useCallback } from 'react';
import { RefreshCw, Loader2, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { CustomerOrder, OrderStatus } from '../backend';
import { useAllOrders, useDeleteOrder } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import OrderCard from '../components/OrderCard';
import OrderFilters from '../components/OrderFilters';
import CourierPinGate from '../components/CourierPinGate';
import { useCourierAccess } from '../hooks/useCourierAccess';
import MenuManagementSection from '../components/MenuManagementSection';

type FilterType = 'all' | 'pending' | 'delivered' | 'cancelled';

// Optimistic local status overrides — keyed by orderId
type LocalStatusMap = Record<string, OrderStatus>;

export default function CourierApp() {
  const { hasAccess, grantAccess } = useCourierAccess();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [localStatuses, setLocalStatuses] = useState<LocalStatusMap>({});
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: backendOrders = [], isLoading, isError, refetch, isFetching } = useAllOrders();
  const deleteOrderMutation = useDeleteOrder();

  // Merge backend orders with local optimistic overrides
  const orders: CustomerOrder[] = backendOrders.map(order => ({
    ...order,
    status: localStatuses[order.orderId] ?? order.status,
  }));

  const handleRefresh = useCallback(() => {
    setLocalStatuses({});
    refetch();
  }, [refetch]);

  const handleDeliver = useCallback((orderId: string) => {
    setDeliveringOrderId(orderId);
    // Optimistic update — backend lacks updateOrderStatus
    setLocalStatuses(prev => ({ ...prev, [orderId]: OrderStatus.delivered }));
    setDeliveringOrderId(null);
    queryClient.invalidateQueries({ queryKey: ['allOrders'] });
  }, [queryClient]);

  const handleDelete = useCallback((orderId: string) => {
    setDeletingOrderId(orderId);
    deleteOrderMutation.mutate(orderId, {
      onSettled: () => {
        setDeletingOrderId(null);
      },
    });
  }, [deleteOrderMutation]);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const counts = {
    pending: orders.filter(o => o.status === OrderStatus.pending).length,
    delivered: orders.filter(o => o.status === OrderStatus.delivered).length,
    cancelled: orders.filter(o => o.status === OrderStatus.cancelled).length,
  };

  if (!hasAccess) {
    return <CourierPinGate onAccess={grantAccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/courier-icon.dim_128x128.png" alt="Courier" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="font-display font-bold text-gray-900 text-lg leading-tight">Courier Dashboard</h1>
              <p className="text-xs text-gray-500">The Deccan BHOJAN</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Menu Management
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'menu' ? (
          <MenuManagementSection />
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Pending', count: counts.pending, icon: <Clock size={14} />, color: 'text-yellow-600 bg-yellow-50' },
                { label: 'Delivered', count: counts.delivered, icon: <CheckCircle size={14} />, color: 'text-green-600 bg-green-50' },
                { label: 'Cancelled', count: counts.cancelled, icon: <AlertCircle size={14} />, color: 'text-red-600 bg-red-50' },
              ].map(stat => (
                <div key={stat.label} className={`rounded-xl p-2 text-center ${stat.color}`}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">{stat.icon}</div>
                  <div className="font-display font-bold text-lg leading-tight">{stat.count}</div>
                  <div className="text-xs font-medium opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <OrderFilters
              activeFilter={activeFilter}
              onFilterChange={(f) => setActiveFilter(f as FilterType)}
              orders={orders}
            />

            {/* Orders List */}
            <div className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Loader2 size={32} className="animate-spin mb-3 text-orange-400" />
                  <p className="text-sm font-medium">Loading orders…</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 text-red-400">
                  <AlertCircle size={32} className="mb-3" />
                  <p className="text-sm font-medium">Failed to load orders</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium underline"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Package size={40} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">
                    {activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders`}
                  </p>
                </div>
              ) : (
                filteredOrders
                  .slice()
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map(order => (
                    <OrderCard
                      key={order.orderId}
                      order={order}
                      onDeliver={handleDeliver}
                      onDelete={handleDelete}
                      isDelivering={deliveringOrderId === order.orderId}
                      isDeleting={deletingOrderId === order.orderId}
                    />
                  ))
              )}
            </div>

            {orders.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-6">
                Orders refresh automatically every 15 seconds
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
