import React from 'react';
import { CheckCircle, Clock, ChefHat, Truck, Package, XCircle, Loader2 } from 'lucide-react';
import { useOrderById } from '../hooks/useQueries';
import { OrderStatus } from '../backend';

interface OrderConfirmationProps {
  orderId: string;
  onBackToMenu: () => void;
}

const STATUS_STEPS = [
  { key: OrderStatus.pending, label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
  { key: OrderStatus.accepted, label: 'Accepted', icon: CheckCircle, description: 'Restaurant accepted your order' },
  { key: OrderStatus.preparing, label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared' },
  { key: OrderStatus.out_for_delivery, label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way' },
  { key: OrderStatus.delivered, label: 'Delivered', icon: Package, description: 'Enjoy your meal!' },
];

function getStepIndex(status: OrderStatus): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function OrderConfirmation({ orderId, onBackToMenu }: OrderConfirmationProps) {
  const { data: order, isLoading, error } = useOrderById(orderId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-500 font-body">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 font-body mb-6">We couldn't find your order. It may have been placed while offline.</p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-body font-medium hover:bg-orange-600 transition-colors"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const isCancelled = order.status === OrderStatus.cancelled;
  const currentStepIndex = isCancelled ? -1 : getStepIndex(order.status);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 px-6 py-5">
        <div className="flex items-center gap-3">
          {isCancelled ? (
            <XCircle className="h-8 w-8 text-white" />
          ) : (
            <CheckCircle className="h-8 w-8 text-white" />
          )}
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              {isCancelled ? 'Order Cancelled' : 'Order Confirmed!'}
            </h2>
            <p className="text-orange-100 text-sm font-body">Order #{orderId.slice(-8)}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Stepper */}
        {!isCancelled && (
          <div className="mb-8">
            <h3 className="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Order Status
            </h3>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-orange-500 transition-all duration-500"
                style={{
                  height: currentStepIndex > 0
                    ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                    : '0%',
                }}
              />

              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      <div
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-orange-500 border-orange-500'
                            : isCurrent
                            ? 'bg-white border-orange-500 shadow-orange'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isCompleted
                              ? 'text-white'
                              : isCurrent
                              ? 'text-orange-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`font-body font-semibold text-sm ${
                            isPending ? 'text-gray-300' : 'text-gray-800'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`font-body text-xs mt-0.5 ${
                            isPending ? 'text-gray-200' : 'text-gray-500'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="ml-auto pt-1.5">
                          <span className="inline-flex items-center gap-1 text-xs font-body font-medium text-orange-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            Current
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Order Summary
          </h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50">
                <div>
                  <span className="font-body font-medium text-gray-800">{item.itemName}</span>
                  <span className="text-gray-400 font-body text-sm ml-2">× {Number(item.quantity)}</span>
                </div>
                <span className="font-body font-semibold text-gray-700">
                  ₹{(item.price * Number(item.quantity)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 mt-1">
            <span className="font-body font-bold text-gray-800">Total</span>
            <span className="font-display font-bold text-orange-500 text-lg">
              ₹{order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBackToMenu}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-body font-semibold hover:bg-orange-600 transition-colors"
          >
            Back to Menu
          </button>
        </div>

        {/* Polling indicator */}
        <p className="text-center text-xs text-gray-300 font-body mt-4">
          Status updates automatically every 8 seconds
        </p>
      </div>
    </div>
  );
}
