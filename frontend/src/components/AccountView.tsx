import { useState, useEffect } from 'react';
import { LogIn, User, Phone, Save, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerProfile, useSaveCallerProfile, useGetMyOrders } from '../hooks/useQueries';
import { OrderStatus } from '../backend';

interface AccountViewProps {
  onLogin: () => void;
}

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccountView({ onLogin }: AccountViewProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const { data: orders, isLoading: ordersLoading } = useGetMyOrders();
  const saveProfile = useSaveCallerProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [saved, setSaved] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-700 text-foreground mb-2">
          Sign in to view your account
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Access your profile, saved info, and order history by signing in.
        </p>
        <Button onClick={onLogin} className="gap-2">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    );
  }

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(phone.trim()))
      newErrors.phone = 'Enter a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim(), phone: phone.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error handled by mutation state
    }
  };

  const recentOrders = [...(orders ?? [])]
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h2 className="font-display text-2xl font-800 text-foreground">My Account</h2>

      {/* Profile Card */}
      <Card className="border border-border shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="account-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="account-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                      setSaved(false);
                    }}
                    className={`pl-9 ${errors.name ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="account-phone"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                      setSaved(false);
                    }}
                    className={`pl-9 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {saveProfile.isError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  Failed to save profile. Please try again.
                </p>
              )}

              {saved && (
                <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                  ✓ Profile saved successfully!
                </p>
              )}

              <Button
                type="submit"
                size="sm"
                className="gap-2"
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="border border-border shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-700 text-sm text-foreground truncate">
                        {order.orderId}
                      </span>
                      <OrderStatusBadge status={order.status as OrderStatus} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(order.timestamp)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className="font-display font-700 text-sm text-primary">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}

              {(orders?.length ?? 0) > 3 && (
                <>
                  <Separator />
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Showing 3 of {orders?.length} orders. View all in My Orders.
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
