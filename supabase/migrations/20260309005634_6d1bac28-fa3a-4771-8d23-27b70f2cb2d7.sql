-- Remove OTP verification system
DROP TABLE IF EXISTS public.order_otp CASCADE;

-- Remove OTP-related functions
DROP FUNCTION IF EXISTS public.create_order_otp(uuid, text);
DROP FUNCTION IF EXISTS public.verify_order_otp(uuid, text);
DROP FUNCTION IF EXISTS public.generate_otp();