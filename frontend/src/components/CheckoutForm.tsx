import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, User, Phone, LogIn } from 'lucide-react';
import { type CartItem } from '../hooks/useCart';
import { usePlaceOrder, useGetCallerProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type OrderItem } from '../backend';
import { Button as UIButton } from '@/components/ui/button';

interface CheckoutFormProps {
  cartItems: CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function CheckoutForm({ cartItems, total, onBack, onSuccess }: CheckoutFormProps) {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile } = useGetCallerProfile();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const placeOrder = usePlaceOrder();

  // Pre-fill from profile when available
  useEffect(() => {
    if (profile) {
      if (profile.name && !name) setName(profile.name);
      if (profile.phone && !phone) setPhone(profile.phone);
    }
  }, [profile]);

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(phone.trim()))
      newErrors.phone = 'Enter a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const orderId = generateOrderId();

    const items: OrderItem[] = cartItems.map((item) => ({
      itemName: item.itemName,
      quantity: BigInt(item.quantity),
      price: item.price,
    }));

    try {
      await placeOrder.mutateAsync({ orderId, items });
      onSuccess(orderId);
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cart
        </button>
        <Card className="border border-border shadow-card">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-700 text-foreground mb-2">
              Sign in to place your order
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              You need to be signed in to complete your order and track it afterwards.
            </p>
            <UIButton
              onClick={async () => {
                try { await login(); } catch { /* handled */ }
              }}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Continue
            </UIButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to cart
      </button>

      <Card className="border border-border shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-xl">Complete Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  className={`pl-9 ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  className={`pl-9 ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Order Summary</p>
              <div className="bg-secondary rounded-xl p-3 space-y-1.5">
                {cartItems.map((item) => (
                  <div key={item.itemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.itemName} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-display font-700 text-base">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {placeOrder.isError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                Failed to place order. Please try again.
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-base"
              disabled={placeOrder.isPending}
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Place Order · $${total.toFixed(2)}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
