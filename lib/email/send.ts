import { Resend } from "resend";
import { env } from "@/lib/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{
  success: boolean;
  error?: string;
}> {
  // 🚫 If email is not configured, skip sending
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) {
    console.log("Email service not configured. Skipping email send.");
    return { success: true };
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      react: options.react,
    });

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Email sent successfully:", data);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
