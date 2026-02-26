# Specification

## Summary
**Goal:** Fix order persistence and status synchronization bugs across the backend, Customer Portal, and Courier App for The Deccan BHOJAN.

**Planned changes:**
- Refactor the backend `placeOrder` function to store all orders in a single canonical stable map keyed by `orderId`, independent of the caller's principal.
- Fix `getAllOrders` to return every entry from the unified orders map with no per-caller filtering.
- Fix `getOrdersByCustomer` to query the same canonical map filtered only by the stored `customerId` field.
- Update the Customer Portal to re-fetch orders from the backend via `getOrdersByCustomer` on mount and navigation, making backend data the authoritative source instead of transient React or sessionStorage state.
- Fix the `OrderConfirmation` component to poll `getOrderById` every 8 seconds and display the live backend status in the progress stepper, including on hard refresh.
- Fix the `MyOrdersView` component and `useOrdersByCustomer` hook to poll for updated statuses every 15 seconds and invalidate/refetch after any order mutation.
- Fix the Courier App dashboard to re-fetch all orders via `getAllOrders` on every mount, source order status from backend data, poll every 15 seconds, and invalidate after `acceptOrder` or `updateOrderStatus` mutations.

**User-visible outcome:** Orders placed by customers persist across page refreshes on both the Customer Portal and Courier App. Status updates made by the courier are reflected on the Customer Portal within 15 seconds without a manual reload, and the Courier App no longer resets order statuses to "Accept Order" after a refresh.
