# Specification

## Summary
**Goal:** Add Internet Identity authentication, customer profiles, My Orders and Account views, and a dedicated Customer Portal navigation bar to the Food Delivery App.

**Planned changes:**
- Integrate Internet Identity login/logout into the Customer Portal navigation bar, supporting passkeys, Google, Apple, and Microsoft sign-in methods
- Add protected routes for My Orders and Account tabs that redirect unauthenticated users to a login prompt
- Add backend customer profile system storing name and phone number keyed by Internet Identity principal, with `getProfile` and `saveProfile` functions
- Update `placeOrder` to record the caller's principal as `customerId` and add `getOrdersByCustomer` to return orders by principal
- Add a Customer Portal navigation bar with three tabs: Browse Menu, My Orders, and Account
- Remove any cross-app navigation links between the Customer Portal and the Courier App
- Build a My Orders view displaying the authenticated user's full order history (orderId, date/time, items, total, status badge), sorted newest first, with an empty state
- Build an Account view displaying and allowing editing of the user's saved name and phone, plus a summary of recent orders
- Pre-fill checkout form name and phone from the saved profile when the user is authenticated
- Create a backend migration file (`backend/migration.mo`) with pre/post-upgrade hooks to preserve existing orders and menu items while adding the new customer profiles stable map

**User-visible outcome:** Customers can log in with Internet Identity, view and edit their profile, see their full order history, and have checkout pre-filled from their saved profile — all within a self-contained Customer Portal with its own navigation.
