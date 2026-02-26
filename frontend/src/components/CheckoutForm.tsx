import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerProfile, usePlaceOrder } from '../hooks/useQueries';
import { type CartItem } from '../hooks/useCart';

interface CheckoutFormProps {
  cartItems: CartItem[];
  total: number;
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export default function CheckoutForm({ cartItems, total, onBack, onOrderPlaced }: CheckoutFormProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile } = useGetCallerProfile();
  const placeOrderMutation = usePlaceOrder();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderItems = cartItems.map((item) => ({
      itemName: item.itemName,
      quantity: BigInt(item.quantity),
      price: item.price,
    }));

    try {
      await placeOrderMutation.mutateAsync({ orderId, items: orderItems });
      onOrderPlaced(orderId);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-orange-100 shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-800 mb-2">Sign In to Continue</h2>
        <p className="text-gray-500 text-sm mb-6">
          You need to sign in to place an order and track your delivery.
        </p>
        <button
          onClick={() => login()}
          disabled={loginStatus === 'logging-in'}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loginStatus === 'logging-in' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
        <button
          onClick={onBack}
          className="mt-3 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </button>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-card overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h2 className="font-display font-bold text-xl text-white">Checkout</h2>
          <p className="text-orange-100 text-sm mt-0.5">{cartItems.length} items · ₹{total.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors resize-none"
              placeholder="Any special requests..."
            />
          </div>

          {/* Order summary */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Order Summary</h3>
            <div className="space-y-1.5">
              {cartItems.map((item) => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.itemName} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-orange-200 mt-3 pt-3 flex justify-between">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-orange-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {placeOrderMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              Failed to place order. Please try again.
            </div>
          )}

          <button
            type="submit"
            disabled={placeOrderMutation.isPending}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-orange"
          >
            {placeOrderMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
              </span>
            ) : (
              `Place Order · ₹${total.toFixed(2)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
