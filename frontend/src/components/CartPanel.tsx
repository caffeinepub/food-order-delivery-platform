import { type CartItem } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';

interface CartPanelProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  onClose?: () => void;
  isSheet?: boolean;
}

export function CartPanel({
  items,
  total,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onClose,
  isSheet = false,
}: CartPanelProps) {
  const isEmpty = items.length === 0;

  return (
    <div className={`flex flex-col h-full ${isSheet ? '' : 'bg-card border border-border rounded-2xl shadow-card'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-display font-700 text-base text-foreground">Your Cart</h2>
          {!isEmpty && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Items */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-3">🛒</div>
          <p className="font-display font-semibold text-foreground mb-1">Cart is empty</p>
          <p className="text-sm text-muted-foreground">Add items from the menu to get started</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="flex items-start gap-3 p-3 bg-secondary rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground leading-tight truncate">
                    {item.itemName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="font-display font-700 text-sm w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onRemove(item.itemId)}
                    className="w-6 h-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      {!isEmpty && (
        <div className="p-4 border-t border-border space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-display font-700 text-base text-foreground">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          <Button
            className="w-full font-semibold h-11"
            onClick={onCheckout}
          >
            Proceed to Checkout →
          </Button>
        </div>
      )}
    </div>
  );
}
