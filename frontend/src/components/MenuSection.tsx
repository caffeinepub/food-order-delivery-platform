import { type MenuItem } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { type CartItem } from '../hooks/useCart';

interface MenuSectionProps {
  category: string;
  items: MenuItem[];
  cartItems: CartItem[];
  onAdd: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Burgers: '🍔',
  Sides: '🍟',
  Drinks: '🥤',
  Pizza: '🍕',
  Salads: '🥗',
  Desserts: '🍰',
};

export function MenuSection({
  category,
  items,
  cartItems,
  onAdd,
  onUpdateQuantity,
}: MenuSectionProps) {
  const emoji = CATEGORY_EMOJI[category] ?? '🍽️';

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{emoji}</span>
        <h2 className="font-display text-xl font-700 text-foreground">{category}</h2>
        <span className="text-sm text-muted-foreground">({items.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const cartItem = cartItems.find((c) => c.itemId === item.itemId);
          const qty = cartItem?.quantity ?? 0;

          return (
            <Card
              key={item.itemId}
              className="card-hover border border-border overflow-hidden"
            >
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground text-base leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                    <span className="font-display font-700 text-lg text-primary">
                      ${item.price.toFixed(2)}
                    </span>
                    {qty === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => onAdd(item)}
                        className="gap-1.5 h-8 px-3 text-xs font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.itemId, qty - 1)}
                          className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-display font-700 text-sm w-5 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.itemId, qty + 1)}
                          className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
