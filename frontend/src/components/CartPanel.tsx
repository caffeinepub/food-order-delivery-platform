import React from 'react';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { type CartItem } from '../hooks/useCart';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  total: number;
}

export default function CartPanel({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total,
}: CartPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-orange-500 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <ShoppingCart className="w-12 h-12 text-orange-200 mb-3" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add items from the menu to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.itemId}
                className="bg-white border border-orange-100 rounded-xl p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-gray-800 text-sm leading-tight">{item.itemName}</p>
                  <button
                    onClick={() => onRemoveItem(item.itemId)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white hover:bg-orange-100 text-orange-600 rounded-md transition-colors border border-orange-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-orange-700 text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-orange-600 text-sm">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-orange-100 p-4 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-orange-600 text-lg">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-orange"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
