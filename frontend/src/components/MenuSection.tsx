import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { type MenuItem } from '../backend';
import { type CartItem } from '../hooks/useCart';

interface MenuSectionProps {
  category: string;
  items: MenuItem[];
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function MenuSection({
  category,
  items,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
}: MenuSectionProps) {
  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find((ci) => ci.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display font-bold text-xl text-gray-800">{category}</h2>
        <div className="flex-1 h-px bg-orange-100" />
        <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
          {items.length} items
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const qty = getCartQuantity(item.itemId);
          return (
            <div
              key={item.itemId}
              className="bg-white rounded-xl border border-orange-100 shadow-card card-hover overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-gray-800 text-sm leading-tight">
                    {item.name}
                  </h3>
                  <span className="text-orange-600 font-bold text-sm whitespace-nowrap">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                )}

                {qty === 0 ? (
                  <button
                    onClick={() => onAddToCart(item)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-orange-50 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, qty - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 text-orange-600 rounded-md transition-colors border border-orange-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-orange-700 text-sm">{qty}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, qty + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
