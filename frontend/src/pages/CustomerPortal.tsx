import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerProfile } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import CustomerNavigation from '../components/CustomerNavigation';
import MenuSection from '../components/MenuSection';
import CartPanel from '../components/CartPanel';
import CheckoutForm from '../components/CheckoutForm';
import OrderConfirmation from '../components/OrderConfirmation';
import MyOrdersView from '../components/MyOrdersView';
import AccountView from '../components/AccountView';
import { ProfileSetupModal } from '../components/ProfileSetupModal';
import { useMenu } from '../hooks/useQueries';

type View = 'menu' | 'orders' | 'account' | 'checkout' | 'confirmation';

export default function CustomerPortal() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [currentView, setCurrentView] = useState<View>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  // confirmedOrderId is persisted to sessionStorage so it survives page refresh
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(() => {
    return sessionStorage.getItem('confirmedOrderId');
  });

  // useCart returns `items`, not `cartItems`
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerProfile();
  const { data: menuItems = [], isLoading: menuLoading } = useMenu();

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const handleViewChange = (view: string) => {
    setCurrentView(view as View);
    setIsCartOpen(false);
  };

  const handleOrderPlaced = (orderId: string) => {
    setConfirmedOrderId(orderId);
    sessionStorage.setItem('confirmedOrderId', orderId);
    clearCart();
    setCurrentView('confirmation');
    // Invalidate orders queries so they refetch with the new order
    queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    queryClient.invalidateQueries({ queryKey: ['ordersByCustomer'] });
  };

  const handleNewOrder = () => {
    setConfirmedOrderId(null);
    sessionStorage.removeItem('confirmedOrderId');
    setCurrentView('menu');
  };

  // Group menu items by category
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CustomerNavigation does not accept isAuthenticated prop — it reads identity internally */}
      <CustomerNavigation
        currentView={currentView}
        onViewChange={handleViewChange}
        cartItemCount={itemCount}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <main>
        {currentView === 'menu' && (
          <div>
            {/* Hero Banner */}
            <div className="relative overflow-hidden">
              <img
                src="/assets/generated/hero-banner.dim_1200x400.png"
                alt="The Deccan BHOJAN"
                className="w-full h-48 md:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-900/60 to-transparent flex items-center px-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                    The Deccan BHOJAN
                  </h1>
                  <p className="text-orange-100 mt-2 text-lg">
                    Authentic flavors, delivered fresh
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
              {menuLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
                  <span className="ml-3 text-gray-500">Loading menu...</span>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">No menu items available right now.</p>
                </div>
              ) : (
                categories.map((category) => (
                  <MenuSection
                    key={category}
                    category={category}
                    items={menuItems.filter((item) => item.category === category)}
                    cartItems={cartItems}
                    onAddToCart={addItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'orders' && <MyOrdersView />}

        {currentView === 'account' && <AccountView />}

        {currentView === 'checkout' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* CheckoutForm expects onOrderPlaced, not onOrderConfirmed */}
            <CheckoutForm
              cartItems={cartItems}
              total={total}
              onOrderPlaced={handleOrderPlaced}
              onBack={() => setCurrentView('menu')}
            />
          </div>
        )}

        {currentView === 'confirmation' && confirmedOrderId && (
          <OrderConfirmation
            orderId={confirmedOrderId}
            onNewOrder={handleNewOrder}
          />
        )}

        {currentView === 'confirmation' && !confirmedOrderId && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">No order to display.</p>
            <button
              onClick={() => setCurrentView('menu')}
              className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium underline"
            >
              Browse Menu
            </button>
          </div>
        )}
      </main>

      {/* Cart Panel — expects `items`, not `cartItems` */}
      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        total={total}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
      />

      {/* ProfileSetupModal requires open and onComplete props */}
      <ProfileSetupModal
        open={showProfileSetup}
        onComplete={() => {
          // Profile saved — modal will close as userProfile becomes non-null
        }}
      />
    </div>
  );
}
