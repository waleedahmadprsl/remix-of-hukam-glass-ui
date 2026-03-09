import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEB3FORMS_KEY = "30b97afd-15a6-456e-84e0-08bedd37e77f";

async function sendWeb3FormsEmail(subject: string, message: string, replyTo?: string) {
  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_KEY);
  formData.append("subject", subject);
  formData.append("from_name", "HUKAM.PK Orders");
  formData.append("message", message);
  if (replyTo) {
    formData.append("replyto", replyTo);
  }
  
  try {
    const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
    const result = await response.json();
    console.log("Web3Forms response:", JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("Web3Forms fetch error:", err);
    return { success: false, message: String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, customerName, orderId, status, totalAmount, items } = await req.json();
    console.log(`Email request: type=${type}, email=${email}, orderId=${orderId}, status=${status}`);

    if (type === "order_confirmation") {
      const subject = `✅ New Order #${orderId?.slice(0, 8) || ""} - Rs.${totalAmount} - ${customerName}`;
      const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️  NEW ORDER RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer: ${customerName}
Email: ${email || "N/A"}
Order ID: #${orderId?.slice(0, 8) || ""}
Total: Rs. ${totalAmount}
Payment: Cash on Delivery

${items ? `Items:\n${items}\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ ACTION: Prepare items for dispatch within 60 minutes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HUKAM.PK - Mirpur's #1 Quick Commerce`;

      // Send admin notification
      const result = await sendWeb3FormsEmail(subject, message, email || undefined);

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
            const shopGroups: Record<string, typeof orderItems> = {};
            for (const item of orderItems) {
              const key = item.shop_id || "own";
              if (!shopGroups[key]) shopGroups[key] = [];
              shopGroups[key].push(item);
            }

            for (const [shopId, shopItems] of Object.entries(shopGroups)) {
              if (shopId === "own") continue;
              const { data: shop } = await supabase.from("shops").select("name, email").eq("id", shopId).single();
              if (shop?.email) {
                const itemsList = shopItems.map((i: any) => `• ${i.product_title} (Qty: ${i.quantity}) - Rs.${i.unit_price * i.quantity}`).join("\n");
                const shopSubject = `📦 New Order for ${shop.name} - HUKAM #${orderId.slice(0, 8)}`;
                const shopMessage = `New order received for ${shop.name}!\n\nOrder ID: #${orderId.slice(0, 8)}\nCustomer: ${customerName}\n\nYour Items:\n${itemsList}\n\nPlease prepare for dispatch ASAP.\n\nHUKAM.PK | WhatsApp: +92 342 680 7645`;
                await sendWeb3FormsEmail(shopSubject, shopMessage);
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
      const statusLabels: Record<string, string> = {
        confirmed: "📦 Confirmed",
        dispatched: "🏍️ Out for Delivery",
        delivered: "✅ Delivered",
        canceled: "❌ Canceled",
        return_requested: "🔄 Return Requested",
        return_approved: "✅ Return Approved",
        returned: "📦 Returned",
      };
      
      const subject = `${statusLabels[status] || "📢 Update"} - Order #${orderId?.slice(0, 8) || ""} - ${customerName}`;
      const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢  ORDER STATUS UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer: ${customerName}
Email: ${email || "N/A"}
Order ID: #${orderId?.slice(0, 8) || ""}
New Status: ${(status || "").toUpperCase()}
Total: Rs. ${totalAmount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HUKAM.PK | WhatsApp: +92 342 680 7645`;

      const result = await sendWeb3FormsEmail(subject, message, email || undefined);
      
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