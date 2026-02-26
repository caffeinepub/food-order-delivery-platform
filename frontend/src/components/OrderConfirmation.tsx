import React from 'react';
import { CheckCircle, Clock, Package, Truck, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { OrderStatus } from '../backend';
import { useOrderById } from '../hooks/useQueries';

interface OrderConfirmationProps {
  orderId: string;
  onNewOrder?: () => void;
}

const STEPS = [
  { status: OrderStatus.pending, label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
  { status: OrderStatus.accepted, label: 'Accepted', icon: CheckCircle, description: 'Restaurant accepted your order' },
  { status: OrderStatus.preparing, label: 'Preparing', icon: Package, description: 'Your food is being prepared' },
  { status: OrderStatus.out_for_delivery, label: 'On the Way', icon: Truck, description: 'Your order is out for delivery' },
  { status: OrderStatus.delivered, label: 'Delivered', icon: CheckCircle, description: 'Enjoy your meal!' },
];

const STATUS_ORDER = [
  OrderStatus.pending,
  OrderStatus.accepted,
  OrderStatus.preparing,
  OrderStatus.out_for_delivery,
  OrderStatus.delivered,
];

function getStepIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderConfirmation({ orderId, onNewOrder }: OrderConfirmationProps) {
  // Always fetch from backend — never use local state for status
  const { data: order, isLoading, isError, refetch, isFetching } = useOrderById(orderId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={36} className="animate-spin mb-4 text-orange-400" />
        <p className="text-sm font-medium">Loading your order…</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <XCircle size={36} className="mb-4 text-red-400" />
        <p className="text-sm font-medium text-gray-600">Could not load order details</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const isCancelled = order.status === OrderStatus.cancelled;
  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        {isCancelled ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-1">Order Cancelled</h2>
            <p className="text-gray-500 text-sm">Your order has been cancelled</p>
          </>
        ) : order.status === OrderStatus.delivered ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-1">Delivered! 🎉</h2>
            <p className="text-gray-500 text-sm">Enjoy your meal from The Deccan BHOJAN</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-orange-500" />
            </div>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-1">Order Confirmed!</h2>
            <p className="text-gray-500 text-sm">
              Order #{orderId.slice(-8).toUpperCase()}
            </p>
          </>
        )}

        {/* Live polling indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-xs text-gray-400">
            {isFetching ? 'Updating…' : 'Live updates every 8s'}
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="ml-1 text-gray-400 hover:text-orange-500 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Progress Stepper — always from backend status */}
      {!isCancelled && (
        <div className="mb-8">
          <div className="relative">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-4 mb-4 last:mb-0">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-gray-200 text-gray-300'
                    } ${isActive ? 'ring-4 ring-orange-100' : ''}`}>
                      <Icon size={16} />
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 transition-all ${
                        idx < currentStepIndex ? 'bg-orange-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pt-1.5">
                    <p className={`text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-orange-500 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-orange-50 rounded-2xl p-4 mb-6">
        <h3 className="font-display font-semibold text-gray-900 mb-3 text-sm">Order Summary</h3>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-gray-700">
              <span>{item.itemName} × {Number(item.quantity)}</span>
              <span className="font-medium">₹{(item.price * Number(item.quantity)).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between font-display font-bold text-gray-900">
            <span>Total</span>
            <span className="text-orange-500">₹{order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(isCancelled || order.status === OrderStatus.delivered) && onNewOrder && (
        <button
          onClick={onNewOrder}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-display font-bold py-3 rounded-2xl transition-colors"
        >
          Place New Order
        </button>
      )}
    </div>
  );
}
