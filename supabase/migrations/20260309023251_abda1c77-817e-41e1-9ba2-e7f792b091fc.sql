
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings are publicly readable"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Store settings updatable by authenticated"
  ON public.store_settings FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Store settings insertable by authenticated"
  ON public.store_settings FOR INSERT TO authenticated
  WITH CHECK (true);

-- Seed default settings row
INSERT INTO public.store_settings (settings) VALUES ('{
  "storeName": "HUKAM",
  "tagline": "Order Nahi, HUKAM Kijiye.",
  "contactEmail": "contact@hukam.pk",
  "contactPhone": "+92 327 7786498",
  "whatsappNumber": "923277786498",
  "address": "Mirpur, AJK",
  "city": "Mirpur",
  "shippingRatePerShop": 50,
  "freeShippingThreshold": 0,
  "currency": "PKR",
  "codEnabled": true,
  "jazzcashEnabled": false,
  "easypaisaEnabled": false,
  "bankTransferEnabled": false
}'::jsonb);
