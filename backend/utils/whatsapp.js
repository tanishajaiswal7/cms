const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,   // ✅ correct
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, message) => {
  try {
    if (!to) {
      console.log("⚠️ No phone number provided");
      return;
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // whatsapp:+14155238886
      to: `whatsapp:${to}`,               // ✅ prefix + country code
      body: message,
    });

    console.log("📲 WhatsApp sent to", to);
  } catch (err) {
    console.error("❌ WhatsApp error:", err.message);
  }
};

module.exports = sendWhatsApp;
