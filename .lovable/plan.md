
## Plan: Remove OTP Verification & Simplify Notifications

### Current Issues to Address
The user wants to remove OTP verification from checkout (feels odd to customers) and eliminate Discord/Telegram notifications, keeping only email and admin panel notifications.

### Technical Analysis

**Current OTP Flow:**
- Checkout stores order data in `pendingOrderData` state
- Shows `OTPVerificationModal` for phone verification 
- Uses Supabase RPC functions: `create_order_otp`, `verify_order_otp`
- Only creates actual order after OTP verification

**Current Notification System:**
- Email notifications via `send-order-email` edge function ✓ (keep)
- Discord/Telegram notifications via `order-notifications` edge function ✗ (remove)
- Admin panel browser notifications (playBeep + toast) ✓ (keep)

### Changes Required

#### 1. Simplify Checkout Flow (src/pages/Checkout.tsx)
- Remove OTP-related imports and state variables
- Remove `showOTPModal`, `pendingOrderData`, `handleOTPVerified`
- Simplify `handleSubmit` to directly create order without verification
- Remove call to `order-notifications` edge function
- Keep email notifications and Web3Forms integration

#### 2. Clean Up Edge Functions
- Delete `supabase/functions/order-notifications/index.ts` entirely
- Keep `supabase/functions/send-order-email/index.ts` unchanged

#### 3. Remove OTP Component
- Delete `src/components/OTPVerificationModal.tsx` 
- Component is no longer needed

#### 4. Database Cleanup
- Remove `order_otp` table (contains OTP codes)
- Drop RPC functions: `create_order_otp`, `verify_order_otp`, `generate_otp`

#### 5. Admin Panel Notifications
- Keep existing browser-based notifications in `AdminOrders.tsx`
- `playBeep()` + toast notifications work fine for local admin alerts

### Implementation Steps

1. **Database Migration:** Remove OTP table and functions
2. **Delete Edge Function:** Remove order-notifications
3. **Update Checkout:** Simplify to direct order placement
4. **Remove OTP Modal:** Delete component file
5. **Test Flow:** Verify orders place directly without verification

### Benefits
- Faster, friction-free checkout experience
- Simpler notification architecture
- Reduced complexity and maintenance
- Better conversion rates (no verification barrier)

### Preserved Functionality
- Email notifications to customers ✓
- Admin panel real-time alerts ✓ 
- Order tracking and management ✓
- All existing features except OTP verification
