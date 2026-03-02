import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEB3FORMS_KEY = "30b97afd-15a6-456e-84e0-08bedd37e77f";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, customerName, orderId, status, totalAmount, items } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "No email provided" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let subject = "";
    let message = "";

    if (type === "order_confirmation") {
      subject = `HUKAM Order Confirmed! #${orderId?.slice(0, 8) || ""}`;
      message = `Assalam-o-Alaikum ${customerName}!\n\nYour HUKAM order has been placed successfully! 🎉\n\nOrder ID: #${orderId?.slice(0, 8) || ""}\nTotal: Rs.${totalAmount}\n\n${items ? `Items:\n${items}\n\n` : ""}Our rider will contact you within 60 minutes.\n\nPayment: Cash on Delivery (Check & Pay)\n\nThank you for choosing HUKAM!\nHUKAM.PK - Mirpur's #1 Quick Commerce`;
    } else if (type === "status_update") {
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed! Our team is preparing it now. 📦",
        dispatched: "Your order is on the way! Our rider is heading to your location. 🏍️",
        delivered: "Your order has been delivered! Thank you for shopping with HUKAM! ✅",
        canceled: "Your order has been canceled. If you have questions, please contact us on WhatsApp. ❌",
      };
      subject = `HUKAM Order Update - ${(status || "").charAt(0).toUpperCase() + (status || "").slice(1)} #${orderId?.slice(0, 8) || ""}`;
      message = `Assalam-o-Alaikum ${customerName}!\n\n${statusMessages[status] || `Your order status has been updated to: ${status}`}\n\nOrder ID: #${orderId?.slice(0, 8) || ""}\nTotal: Rs.${totalAmount}\n\nFor any questions, message us on WhatsApp: +92 342 680 7645\n\nHUKAM.PK - Mirpur's #1 Quick Commerce`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid email type" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send via Web3Forms
    const formData = new FormData();
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("subject", subject);
    formData.append("from_name", "HUKAM.PK");
    formData.append("to", email);
    formData.append("message", message);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });
    
    const result = await response.json();

    return new Response(JSON.stringify({ success: result.success, message: result.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
