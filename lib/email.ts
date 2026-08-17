import { EmailClient } from "@azure/communication-email";

export async function sendAccountEmail(to: string, type: "verify" | "reset", token: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const path = type === "verify" ? "/verify-email" : "/reset-password";
  const link = `${appUrl}${path}?token=${encodeURIComponent(token)}`;
  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const sender = process.env.AZURE_EMAIL_SENDER;
  if (!connectionString || !sender) {
    if (process.env.NODE_ENV !== "production") return { delivered: false, previewUrl: link };
    throw new Error("Email delivery is not configured.");
  }
  const client = new EmailClient(connectionString);
  const subject = type === "verify" ? "Verify your Logo Market Place account" : "Reset your Logo Market Place password";
  const intro = type === "verify" ? "Verify your email to activate your account and receive 5 free API credits." : "Use the secure link below to reset your password. It expires in 30 minutes.";
  const poller = await client.beginSend({ senderAddress: sender, recipients: { to: [{ address: to }] }, content: {
    subject,
    plainText: `${intro}\n\n${link}\n\nIf you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#171312"><h1 style="font-size:24px">Logo Market Place</h1><p>${intro}</p><p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#b42318;color:white;text-decoration:none;border-radius:8px">${type === "verify" ? "Verify email" : "Reset password"}</a></p><p style="font-size:12px;color:#6b625d">If you did not request this, ignore this email.</p></div>`,
  }});
  await poller.pollUntilDone();
  return { delivered: true };
}
