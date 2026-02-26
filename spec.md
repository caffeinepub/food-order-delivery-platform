# Specification

## Summary
**Goal:** Simplify the Courier App order workflow by removing all intermediate status stages, leaving only "Deliver" and "Delete" actions on each order card, and trimming the filter bar to match.

**Planned changes:**
- Remove "Accept", "Preparing", and "Out for Delivery" action buttons from each order card in `OrderCard.tsx` and `CourierApp.tsx`
- Add a **Deliver** button to each order card that calls `updateOrderStatus` to set the status directly to `delivered`
- Add a **Delete** button to each order card that shows a confirmation prompt before calling `useDeleteOrder`
- Style both buttons using the app's white and orange (#F97316) theme
- Remove `accepted`, `preparing`, and `out_for_delivery` filter tabs from `OrderFilters.tsx`
- Keep only "All", "Pending", "Delivered", and "Cancelled" filter tabs, with accurate per-status counts

**User-visible outcome:** Each order card in the Courier App shows exactly two action buttons (Deliver and Delete), and the filter bar only displays tabs for All, Pending, Delivered, and Cancelled statuses.
