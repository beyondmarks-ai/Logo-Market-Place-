import { EmailClient } from "@azure/communication-email";
import { SmsClient } from "@azure/communication-sms";
import { DefaultAzureCredential } from "@azure/identity";
import { NextResponse } from "next/server";
import { createOtp, discardOtp, maskEmail, maskPhone } from "../../../../lib/admin-otp";

export const runtime = "nodejs";

const approvedEmails = ["contact@beyondmarks.ai", "beyondmarks.ai@gmail.com"];
const approvedPhones = ["+919902300846", "+919113260846"];

function normalizeIdentifier(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { identifier?: string; password?: string };
    const adminPassword = process.env.ADMIN_PASSWORD;
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
    const endpoint = process.env.AZURE_COMMUNICATION_ENDPOINT;
    const identifier = normalizeIdentifier(body.identifier ?? "");
    const channel = approvedEmails.includes(identifier) ? "email" : approvedPhones.includes(identifier) ? "sms" : null;

    if (!adminPassword || (!connectionString && !endpoint)) {
      return NextResponse.json({ error: "Admin OTP is not configured on the server yet." }, { status: 503 });
    }
    if (!channel || body.password !== adminPassword) {
      return NextResponse.json({ error: "The administrator contact or password is incorrect." }, { status: 401 });
    }
    if (channel === "sms" && !process.env.AZURE_SMS_FROM) {
      return NextResponse.json({ error: "Mobile OTP is coming soon. Please use one of the registered admin email addresses." }, { status: 503 });
    }

    const identity = `${identifier}:${channel}`;
    const { requestId, code } = createOtp(identity);

    try {
      if (channel === "email") {
        const sender = process.env.AZURE_EMAIL_SENDER;
        if (!sender) throw new Error("Email verification is not configured yet.");
        const emailClient = connectionString
          ? new EmailClient(connectionString)
          : new EmailClient(endpoint!, new DefaultAzureCredential());
        const poller = await emailClient.beginSend({
          senderAddress: sender,
          recipients: { to: [{ address: identifier }] },
          content: {
            subject: "Your Beyond Marks admin security code",
            plainText: `Your verification code is ${code}. It expires in 5 minutes. If you did not request this, ignore this message.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:520px;padding:28px;color:#19151f"><h2>Admin verification</h2><p>Use this one-time security code to continue:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 5 minutes. Never share it with anyone.</p></div>`,
          },
        });
        await poller.pollUntilDone();
        return NextResponse.json({ requestId, maskedTarget: maskEmail(identifier), channel });
      }

      const sender = process.env.AZURE_SMS_FROM;
      if (!sender) throw new Error("Mobile verification is not configured yet.");
      const smsClient = connectionString
        ? new SmsClient(connectionString)
        : new SmsClient(endpoint!, new DefaultAzureCredential());
      const results = await smsClient.send({
        from: sender,
        to: [identifier],
        message: `Beyond Marks admin code: ${code}. Expires in 5 minutes. Do not share this code.`,
      });
      if (!results[0]?.successful) throw new Error("Azure could not deliver the SMS.");
      return NextResponse.json({ requestId, maskedTarget: maskPhone(identifier), channel });
    } catch (error) {
      discardOtp(requestId);
      const message = error instanceof Error && error.message.includes("configured") ? error.message : "Azure could not send the verification code.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
  }
}
