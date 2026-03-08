import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEB3FORMS_KEY = "30b97afd-15a6-456e-84e0-08bedd37e77f";

async function sendEmail(to: string, subject: string, message: string) {
  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_KEY);
  formData.append("subject", subject);
  formData.append("from_name", "HUKAM.PK");
  formData.append("to", to);
  formData.append("message", message);
  const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, customerName, orderId, status, totalAmount, items } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "No email provided" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === "order_confirmation") {
      const subject = `HUKAM Order Confirmed! #${orderId?.slice(0, 8) || ""}`;
      const message = `Assalam-o-Alaikum ${customerName}!\n\nYour HUKAM order has been placed successfully! 🎉\n\nOrder ID: #${orderId?.slice(0, 8) || ""}\nTotal: Rs.${totalAmount}\n\n${items ? `Items:\n${items}\n\n` : ""}Our rider will contact you within 60 minutes.\n\nPayment: Cash on Delivery (Check & Pay)\n\nThank you for choosing HUKAM!\nHUKAM.PK - Mirpur's #1 Quick Commerce`;
      
      // Send customer email
      const result = await sendEmail(email, subject, message);

      // Send vendor-specific emails
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        if (supabaseUrl && supabaseKey && orderId) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_title, quantity, unit_price, shop_id")
            .eq("order_id", orderId);

          if (orderItems && orderItems.length > 0) {
            // Group by shop_id
            const shopGroups: Record<string, typeof orderItems> = {};
            for (const item of orderItems) {
              const key = item.shop_id || "own";
              if (!shopGroups[key]) shopGroups[key] = [];
              shopGroups[key].push(item);
            }

            // For each shop with an email, send their specific items
            for (const [shopId, shopItems] of Object.entries(shopGroups)) {
              if (shopId === "own") continue;
              const { data: shop } = await supabase.from("shops").select("name, email").eq("id", shopId).single();
              if (shop?.email) {
                const itemsList = shopItems.map((i: any) => `${i.product_title} (Qty: ${i.quantity}) - Rs.${i.unit_price * i.quantity}`).join("\n");
                const shopSubject = `New HUKAM Order for ${shop.name} — #${orderId.slice(0, 8)}`;
                const shopMessage = `New order received!\n\nOrder ID: #${orderId.slice(0, 8)}\nCustomer: ${customerName}\n\nYour Items:\n${itemsList}\n\nPlease prepare the items for dispatch.\n\nHUKAM.PK Marketplace`;
                await sendEmail(shop.email, shopSubject, shopMessage);
              }
            }
          }
        }
      } catch (vendorErr) {
        console.error("Vendor email error:", vendorErr);
      }

      return new Response(JSON.stringify({ success: result.success, message: result.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === "status_update") {
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed! Our team is preparing it now. 📦",
        dispatched: "Your order is on the way! Our rider is heading to your location. 🏍️",
        delivered: "Your order has been delivered! Thank you for shopping with HUKAM! ✅",
        canceled: "Your order has been canceled. If you have questions, please contact us on WhatsApp. ❌",
      };
      const subject = `HUKAM Order Update - ${(status || "").charAt(0).toUpperCase() + (status || "").slice(1)} #${orderId?.slice(0, 8) || ""}`;
      const message = `Assalam-o-Alaikum ${customerName}!\n\n${statusMessages[status] || `Your order status has been updated to: ${status}`}\n\nOrder ID: #${orderId?.slice(0, 8) || ""}\nTotal: Rs.${totalAmount}\n\nFor any questions, message us on WhatsApp: +92 342 680 7645\n\nHUKAM.PK - Mirpur's #1 Quick Commerce`;
      const result = await sendEmail(email, subject, message);
      return new Response(JSON.stringify({ success: result.success, message: result.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid email type" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
