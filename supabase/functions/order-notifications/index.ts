import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Discord webhook URL - set this as a Supabase secret
const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

async function sendDiscordNotification(order: any) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("Discord webhook URL not configured");
    return;
  }

  const embed = {
    title: "🚨 NEW ORDER ALERT",
    color: 0x10B981, // Primary green color
    fields: [
      {
        name: "Order ID",
        value: `#${order.id.slice(0, 8)}`,
        inline: true
      },
      {
        name: "Customer",
        value: `${order.customer_name}\n📞 ${order.customer_phone}`,
        inline: true
      },
      {
        name: "Amount",
        value: `Rs.${order.total_amount.toLocaleString()}`,
        inline: true
      },
      {
        name: "Items",
        value: order.items ? order.items.substring(0, 300) : "No items listed",
        inline: false
      },
      {
        name: "Address",
        value: order.delivery_address.substring(0, 200),
        inline: false
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "HUKAM.pk Order System"
    }
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
        content: `@here New COD order worth Rs.${order.total_amount.toLocaleString()}!`
      })
    });

    if (!response.ok) {
      console.error('Discord notification failed:', await response.text());
    } else {
      console.log('Discord notification sent successfully');
    }
  } catch (error) {
    console.error('Discord notification error:', error);
  }
}

async function sendTelegramNotification(order: any) {
  const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured");
    return;
  }

  const message = `
🚨 *NEW ORDER ALERT* 🚨

💰 Amount: Rs.${order.total_amount.toLocaleString()}
🆔 Order: #${order.id.slice(0, 8)}
👤 Customer: ${order.customer_name}
📞 Phone: ${order.customer_phone}

📦 Items:
${order.items ? order.items.substring(0, 400) : "No items listed"}

🏠 Address:
${order.delivery_address}

⏰ Time: ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}

#NewOrder #COD #HUKAM
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.error('Telegram notification failed:', await response.text());
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order } = await req.json();

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send notifications in parallel
    await Promise.all([
      sendDiscordNotification(order),
      sendTelegramNotification(order)
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "External notifications sent",
        discord: !!DISCORD_WEBHOOK_URL,
        telegram: !!(Deno.env.get("TELEGRAM_BOT_TOKEN") && Deno.env.get("TELEGRAM_CHAT_ID"))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("External notification error:", error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});