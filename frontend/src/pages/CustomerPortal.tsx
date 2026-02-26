import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerProfile, useMenu } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import CustomerNavigation from '../components/CustomerNavigation';
import MenuSection from '../components/MenuSection';
import CartPanel from '../components/CartPanel';
import CheckoutForm from '../components/CheckoutForm';
import OrderConfirmation from '../components/OrderConfirmation';
import MyOrdersView from '../components/MyOrdersView';
import AccountView from '../components/AccountView';
import { ProfileSetupModal } from '../components/ProfileSetupModal';

type View = 'menu' | 'checkout' | 'confirmation' | 'orders' | 'account';

const CONFIRMED_ORDER_KEY = 'foodrush_confirmed_order_id';

export default function CustomerPortal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerProfile();
  const { data: menuItems = [], isLoading: menuLoading } = useMenu();

  const [currentView, setCurrentView] = useState<View>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist confirmedOrderId to sessionStorage so it survives page refresh
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(() => {
    return sessionStorage.getItem(CONFIRMED_ORDER_KEY);
  });

  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  // Show profile setup modal for authenticated users without a profile
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const handleOrderPlaced = (orderId: string) => {
    setConfirmedOrderId(orderId);
    sessionStorage.setItem(CONFIRMED_ORDER_KEY, orderId);
    setCurrentView('confirmation');
    clearCart();
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setConfirmedOrderId(null);
    sessionStorage.removeItem(CONFIRMED_ORDER_KEY);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as View);
    setIsCartOpen(false);
  };

  // Group menu items by category
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-white">
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

        {currentView === 'checkout' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <CheckoutForm
              cartItems={cartItems}
              total={total}
              onOrderPlaced={handleOrderPlaced}
              onBack={() => setCurrentView('menu')}
            />
          </div>
        )}

        {currentView === 'confirmation' && confirmedOrderId && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <OrderConfirmation
              orderId={confirmedOrderId}
              onBackToMenu={handleBackToMenu}
            />
          </div>
        )}

        {currentView === 'confirmation' && !confirmedOrderId && (
          <div className="max-w-2xl mx-auto px-4 py-8 text-center">
            <p className="text-gray-500">No active order found.</p>
            <button
              onClick={() => setCurrentView('menu')}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        )}

        {currentView === 'orders' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <MyOrdersView />
          </div>
        )}

        {currentView === 'account' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <AccountView />
          </div>
        )}
      </main>

      {/* Cart Panel */}
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

      {/* Profile Setup Modal */}
      <ProfileSetupModal
        open={showProfileSetup}
        onComplete={() => {
          // Profile saved — modal will close as userProfile becomes non-null
        }}
      />
    </div>
  );
}
