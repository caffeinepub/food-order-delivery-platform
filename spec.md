# Specification

## Summary
**Goal:** Add a PIN-based access gate to the Courier App at `/courier`, replacing any existing Internet Identity / role-based access checks with a simple PIN entry screen.

**Planned changes:**
- Add a PIN entry screen that renders when a user visits `/courier` without a stored access token; the screen uses the app's warm orange/cream theme.
- Entering PIN `1953` grants access and shows the full Courier App dashboard; any other PIN shows a visible error message.
- Persist the granted access state in `localStorage` so the dashboard is shown on page refresh without re-entering the PIN.
- Add a "Lock" button in the Courier App UI that clears the stored access state and returns the user to the PIN entry screen.
- Remove or bypass any existing Internet Identity / role-based access control checks in `CourierApp.tsx` that currently block users.

**User-visible outcome:** Visiting `/courier` shows a themed PIN entry screen. Entering `1953` grants immediate access to the full dashboard, which persists across refreshes. A Lock button lets the courier log out back to the PIN screen.
