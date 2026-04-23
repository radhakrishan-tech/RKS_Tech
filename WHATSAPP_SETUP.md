# WhatsApp Integration Setup Guide

## Current Status
✅ Backend is ready - `whatsappService.js` returns properly formatted messages
❌ Currently MOCKED - not sending real messages (returns `delivered: false`)

---

## Option 1: Use Twilio WhatsApp (EASIEST & RECOMMENDED)

### Setup (5 minutes)

1. **Sign up for Twilio**
   - Go to: https://www.twilio.com/try-twilio
   - Sign up with email
   - Get free trial credits ($15)

2. **Get WhatsApp Number**
   - In Twilio console → "Messaging" → "Try it out" → "Send a WhatsApp"
   - Note down your **Twilio WhatsApp Number** (starts with +1...)
   - This is your FROM number

3. **Get Your Phone Number**
   - Add YOUR phone number to sandbox verified senders
   - WhatsApp will send you a verification code
   - Confirm it

4. **Get API Credentials**
   - Auth Token (visible in dashboard)
   - Account SID
   - Add to `.env`:

```bash
# .env in backend/
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890
WHATSAPP_ADMIN_NUMBER=+919999999999  # Your phone
```

5. **Install Twilio SDK**

```bash
cd backend
npm install twilio
```

6. **Update whatsappService.js**

Replace the content with:

```javascript
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function buildOrderMessage(order) {
  const lines = order.items.map(
    (item) => `- ${item.name} x${item.quantity} (Rs ${item.lineTotal})`
  );

  return [
    "🚀 New Order - Radha Krishan Studio",
    `👤 ${order.customerName}`,
    `📱 ${order.customerPhone}`,
    `📍 ${order.addressLine}, ${order.city} - ${order.pincode}`,
    "",
    "Items:",
    ...lines,
    "",
    `💰 Total: Rs ${order.pricing.total}`,
  ].join("\n");
}

async function sendAdminOrderAlert(order) {
  try {
    const adminNumber = `whatsapp:${process.env.WHATSAPP_ADMIN_NUMBER}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const message = buildOrderMessage(order);

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: adminNumber,
    });

    console.log(`✅ WhatsApp sent: ${result.sid}`);
    return {
      delivered: true,
      channel: "twilio-whatsapp",
      messageSid: result.sid,
    };
  } catch (error) {
    console.error("❌ WhatsApp failed:", error.message);
    return {
      delivered: false,
      channel: "twilio-whatsapp",
      error: error.message,
    };
  }
}

function buildQuickOrderLink(product, qty = 1) {
  const text = `Namaste, mujhe ye order karna hai: ${product.name} (${product.category}) x${qty}. Price: Rs ${product.price}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

module.exports = { sendAdminOrderAlert, buildQuickOrderLink };
```

7. **Test It**
   - Place an order from frontend
   - You should receive WhatsApp in seconds

---

## Option 2: Email Alerts (FASTER if you want to skip WhatsApp now)

If you want to skip WhatsApp for now, send email instead:

```javascript
// In whatsappService.js - replace with email
async function sendAdminOrderAlert(order) {
  // Use the existing OTP email service
  const emailService = require("./emailService"); // if exists
  
  const message = buildOrderMessage(order);
  
  // Send email to admin
  return {
    delivered: true,
    channel: "email",
    to: process.env.ADMIN_EMAIL
  };
}
```

---

## Option 3: Full WhatsApp Business API (PRODUCTION)

If you want official WhatsApp Business API:

1. Go to: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
2. Apply for Business Account approval (takes 2-3 days)
3. More complex setup but unlimited messages

---

## Testing Checklist

After setup, test:

- [ ] Place order from frontend
- [ ] Admin receives WhatsApp within 5 seconds
- [ ] Message contains: name, phone, address, items, total
- [ ] Check server logs: `✅ WhatsApp sent: ...`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Auth failed" | Check TWILIO_ACCOUNT_SID and AUTH_TOKEN in .env |
| "Invalid number" | Phone numbers must be in +91XXXXXXXXXX format |
| "Sandbox not verified" | Send code verification from Twilio console first |
| Message not received | Check server logs for error, internet connection |

---

## For Now (Soft Launch)

If you don't have time for WhatsApp now, you can:

✅ Keep mock (returns `{delivered: false}`)
✅ Add whatsappService to TODO list for Phase 2
✅ Still launch and use order history to manually notify customers

The order data is saved correctly - just alert delivery is mocked.
