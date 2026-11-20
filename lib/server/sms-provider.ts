export function normalizeBotswanaMobile(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  if (/^7\d{7}$/.test(compact)) return `+267${compact}`;
  if (/^\+2677\d{7}$/.test(compact)) return compact;
  return null;
}

export function isBotswanaMobile(value: string) {
  return normalizeBotswanaMobile(value) !== null;
}

export async function sendSms(phoneNumber: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const senderId = process.env.TWILIO_SENDER_ID;

  if (!accountSid || !authToken || !senderId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Twilio SMS credentials are required to send production phone verification codes.");
    }
    console.info(`[dev sms] ${phoneNumber}: ${message}`);
    return;
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: senderId, To: phoneNumber, Body: message }),
  });
  if (!response.ok) throw new Error(`SMS provider rejected the request (${response.status}).`);
}
