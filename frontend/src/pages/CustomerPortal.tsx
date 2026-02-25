import { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CustomerNavigation, type CustomerView } from '../components/CustomerNavigation';
import { MenuSection } from '../components/MenuSection';
import { CartPanel } from '../components/CartPanel';
import { CheckoutForm } from '../components/CheckoutForm';
import { OrderConfirmation } from '../components/OrderConfirmation';
import { MyOrdersView } from '../components/MyOrdersView';
import { AccountView } from '../components/AccountView';
import { ProfileSetupModal } from '../components/ProfileSetupModal';
import { useMenu, useSeedMenu, useGetCallerProfile } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type MenuItem } from '../backend';

type CheckoutView = 'checkout' | 'confirmation';

export function CustomerPortal() {
  const [activeView, setActiveView] = useState<CustomerView>('menu');
  const [checkoutView, setCheckoutView] = useState<CheckoutView | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: menuItems, isLoading, isError } = useMenu();
  const seedMenu = useSeedMenu();
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  // Profile for setup modal
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerProfile();
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Seed menu on first load if empty
  useEffect(() => {
    if (!isLoading && menuItems && menuItems.length === 0 && !seedMenu.isPending && !seedMenu.isSuccess) {
      seedMenu.mutate();
    }
  }, [isLoading, menuItems, seedMenu]);

  // Group menu items by category
  const categorizedMenu = (menuItems ?? []).reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(categorizedMenu).sort();

  const handleOrderSuccess = (orderId: string) => {
    setConfirmedOrderId(orderId);
    clearCart();
    setCheckoutView('confirmation');
    setCartOpen(false);
  };

  const handleNewOrder = () => {
    setConfirmedOrderId(null);
    setCheckoutView(null);
    setActiveView('menu');
  };

  const handleLoginPrompt = async () => {
    try {
      await login();
    } catch {
      // handled by hook
    }
  };

  // Render checkout/confirmation overlay regardless of active tab
  if (checkoutView === 'confirmation' && confirmedOrderId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CustomerNavigation activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <OrderConfirmation orderId={confirmedOrderId} onNewOrder={handleNewOrder} />
          </div>
        </main>
      </div>
    );
  }

  if (checkoutView === 'checkout') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CustomerNavigation activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <CheckoutForm
              cartItems={cartItems}
              total={total}
              onBack={() => setCheckoutView(null)}
              onSuccess={handleOrderSuccess}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CustomerNavigation activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1">
        {/* My Orders View */}
        {activeView === 'my-orders' && (
          <MyOrdersView onLogin={handleLoginPrompt} />
        )}

        {/* Account View */}
        {activeView === 'account' && (
          <AccountView onLogin={handleLoginPrompt} />
        )}

        {/* Browse Menu View */}
        {activeView === 'menu' && (
          <div>
            {/* Hero Banner */}
            <div className="relative overflow-hidden">
              <img
                src="/assets/generated/hero-banner.dim_1200x400.png"
                alt="Delicious food delivery"
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 hero-gradient opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="font-display text-3xl sm:text-4xl font-800 text-white drop-shadow-lg mb-2">
                  Order Delicious Food 🍔
                </h1>
                <p className="text-white/90 text-sm sm:text-base drop-shadow max-w-md">
                  Fresh ingredients, bold flavors, delivered fast to your door
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex gap-8">
                {/* Menu Area */}
                <div className="flex-1 min-w-0">
                  {seedMenu.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-xl px-4 py-3 mb-6">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Setting up the menu for the first time...
                    </div>
                  )}

                  {isLoading || seedMenu.isPending ? (
                    <div className="space-y-8">
                      {[1, 2, 3].map((i) => (
                        <div key={i}>
                          <Skeleton className="h-7 w-32 mb-4" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((j) => (
                              <Skeleton key={j} className="h-40 rounded-2xl" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <AlertCircle className="w-10 h-10 text-destructive mb-3" />
                      <p className="font-display font-semibold text-foreground mb-1">
                        Failed to load menu
                      </p>
                      <p className="text-sm text-muted-foreground">Please refresh the page to try again.</p>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="text-5xl mb-3">🍽️</div>
                      <p className="font-display font-semibold text-foreground mb-1">Menu is empty</p>
                      <p className="text-sm text-muted-foreground">Check back soon!</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <MenuSection
                        key={category}
                        category={category}
                        items={categorizedMenu[category]}
                        cartItems={cartItems}
                        onAdd={addItem}
                        onUpdateQuantity={updateQuantity}
                      />
                    ))
                  )}
                </div>

                {/* Desktop Cart Sidebar */}
                <aside className="hidden lg:block w-80 flex-shrink-0">
                  <div className="sticky top-24">
                    <CartPanel
                      items={cartItems}
                      total={total}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      onCheckout={() => setCheckoutView('checkout')}
                    />
                  </div>
                </aside>
              </div>
            </div>

            {/* Mobile Cart FAB */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg relative"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Shopping Cart</SheetTitle>
                  </SheetHeader>
                  <CartPanel
                    items={cartItems}
                    total={total}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    onCheckout={() => {
                      setCartOpen(false);
                      setCheckoutView('checkout');
                    }}
                    onClose={() => setCartOpen(false)}
                    isSheet
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </main>

      {/* Profile Setup Modal for first-time users */}
      <ProfileSetupModal
        open={showProfileSetup}
        onComplete={() => {
          // Profile saved, modal will close via query invalidation
        }}
      />
    </div>
  );
}
