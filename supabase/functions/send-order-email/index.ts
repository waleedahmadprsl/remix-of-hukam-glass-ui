import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getTransporter() {
  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) throw new Error("Gmail credentials not configured");
  
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  const fromName = "HUKAM.PK";
  const fromEmail = Deno.env.get("GMAIL_USER") || "hello@likehukam.com";
  
  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });
  console.log("Email sent:", info.messageId, "to:", to);
  return { success: true, messageId: info.messageId };
}

function orderConfirmationHTML(customerName: string, orderId: string, totalAmount: number, items: string) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">HUKAM</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Order Nahi, HUKAM Kijiye!</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="font-size: 32px;">✅</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 8px; font-size: 22px;">Order Confirmed!</h2>
        <p style="color: #6b7280; margin: 0; font-size: 15px;">Assalam-o-Alaikum ${customerName}!</p>
      </div>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Order ID</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">#${orderId.slice(0, 8)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Total Amount</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #10b981; font-size: 16px;">Rs. ${totalAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Payment</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">Cash on Delivery</td>
          </tr>
        </table>
      </div>
      
      ${items ? `
      <div style="margin-bottom: 20px;">
        <p style="color: #374151; font-weight: 600; font-size: 14px; margin: 0 0 12px;">Your Items:</p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px;">
          ${items.split('\n').map(line => `<p style="color: #4b5563; font-size: 13px; margin: 4px 0; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">${line}</p>`).join('')}
        </div>
      </div>` : ''}
      
      <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #065f46; font-weight: 600; margin: 0 0 12px; font-size: 14px;">⚡ What's Next?</p>
        <ul style="color: #047857; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Our rider will contact you within 60 minutes</li>
          <li>Please keep your phone accessible</li>
          <li>Prepare exact cash for smooth delivery</li>
          <li>Inspect products before payment</li>
        </ul>
      </div>
      
      <div style="text-align: center; padding: 16px 0;">
        <a href="https://likehukam.com/track-order" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Track Your Order</a>
      </div>
    </div>
    
    <div style="background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Need help? WhatsApp us at +92 342 680 7645</p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2026 HUKAM.PK — Mirpur's #1 Quick Commerce</p>
    </div>
  </div>`;
}

function statusUpdateHTML(customerName: string, orderId: string, status: string, totalAmount: number, trackingId?: string) {
  const statusConfig: Record<string, { emoji: string; color: string; bg: string; message: string }> = {
    confirmed: { emoji: "📦", color: "#2563eb", bg: "#eff6ff", message: "Your order has been confirmed and is being prepared!" },
    dispatched: { emoji: "🏍️", color: "#7c3aed", bg: "#f5f3ff", message: "Your order is out for delivery! Our rider is heading to you." },
    delivered: { emoji: "✅", color: "#10b981", bg: "#ecfdf5", message: "Your order has been delivered successfully! Thank you for shopping with HUKAM!" },
    canceled: { emoji: "❌", color: "#ef4444", bg: "#fef2f2", message: "Your order has been canceled. Contact us on WhatsApp for questions." },
    return_requested: { emoji: "🔄", color: "#f59e0b", bg: "#fffbeb", message: "Your return request has been submitted. We'll review it shortly." },
    return_approved: { emoji: "✅", color: "#10b981", bg: "#ecfdf5", message: "Your return has been approved. Please send the item back." },
    returned: { emoji: "📦", color: "#6b7280", bg: "#f9fafb", message: "Your return is complete and refund has been processed." },
  };
  
  const config = statusConfig[status] || { emoji: "📢", color: "#6b7280", bg: "#f9fafb", message: `Your order status has been updated to: ${status}` };

  const trackingSection = (status === "dispatched" && trackingId) ? `
      <div style="background: #f5f3ff; border: 2px dashed #7c3aed; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Tracking ID</p>
        <p style="color: #7c3aed; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 2px;">${trackingId}</p>
        <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">Use this ID to track your shipment</p>
      </div>` : '';
  
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, ${config.color}, ${config.color}dd); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">HUKAM</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Order Status Update</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 12px;">${config.emoji}</span>
        <h2 style="color: #111827; margin: 0 0 8px; font-size: 22px;">Order ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</h2>
        <p style="color: #6b7280; margin: 0; font-size: 15px;">Assalam-o-Alaikum ${customerName}!</p>
      </div>
      
      <div style="background: ${config.bg}; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid ${config.color};">
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.6;">${config.message}</p>
      </div>

      ${trackingSection}
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Order ID</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">#${orderId.slice(0, 8)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Total</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: ${config.color}; font-size: 15px;">Rs. ${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; padding: 16px 0;">
        <a href="https://likehukam.com/track-order" style="display: inline-block; background: ${config.color}; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Track Your Order</a>
      </div>
    </div>
    
    <div style="background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Need help? WhatsApp us at +92 342 680 7645</p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2026 HUKAM.PK — Mirpur's #1 Quick Commerce</p>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, customerName, orderId, status, totalAmount, items, trackingId } = await req.json();
    console.log(`Email request: type=${type}, to=${email}, orderId=${orderId}, status=${status}`);

    if (!email) {
      return new Response(JSON.stringify({ error: "No email provided" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === "order_confirmation") {
      const subject = `✅ Order Confirmed - HUKAM #${orderId?.slice(0, 8) || ""}`;
      const html = orderConfirmationHTML(customerName, orderId || "", totalAmount, items || "");
      
      // Send customer email
      const result = await sendEmail(email, subject, html);

      // Send admin notification too
      const adminEmail = Deno.env.get("GMAIL_USER") || "hello@likehukam.com";
      if (adminEmail && adminEmail !== email) {
        const adminSubject = `🛍️ New Order #${orderId?.slice(0, 8)} - Rs.${totalAmount} - ${customerName}`;
        await sendEmail(adminEmail, adminSubject, html).catch(e => console.error("Admin email failed:", e));
      }

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
                const itemsList = shopItems.map((i: any) => `${i.product_title} (Qty: ${i.quantity}) - Rs.${i.unit_price * i.quantity}`).join("<br>");
                const vendorSubject = `📦 New Order for ${shop.name} - HUKAM #${orderId.slice(0, 8)}`;
                const vendorHtml = `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>New Order for ${shop.name}</h2><p>Order #${orderId.slice(0, 8)} | Customer: ${customerName}</p><p><strong>Items:</strong><br>${itemsList}</p><p>Please prepare for dispatch ASAP.</p><p>— HUKAM.PK</p></div>`;
                await sendEmail(shop.email, vendorSubject, vendorHtml).catch(e => console.error("Vendor email failed:", e));
              }
            }
          }
        }
      } catch (vendorErr) {
        console.error("Vendor email error:", vendorErr);
      }

      return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === "status_update") {
      const subject = `${status === "delivered" ? "✅" : status === "dispatched" ? "🏍️" : status === "confirmed" ? "📦" : "📢"} Order ${(status || "").charAt(0).toUpperCase() + (status || "").slice(1)} - HUKAM #${orderId?.slice(0, 8) || ""}`;
      const html = statusUpdateHTML(customerName, orderId || "", status, totalAmount, trackingId);
      
      const result = await sendEmail(email, subject, html);

      return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
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