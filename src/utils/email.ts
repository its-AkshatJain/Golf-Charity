import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY!);

// Use Resend's testing domain since we likely don't have a verified domain
const FROM_EMAIL = "Play for Purpose <onboarding@resend.dev>"; 

export async function sendSubscriptionUpdate(to: string, status: string, plan: string) {
  if (!process.env.RESEND_EMAIL_API_KEY) return;
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Subscription Update: ${status}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h2>Your Subscription Status</h2>
          <p>Hi there,</p>
          <p>Your subscription is now <strong style="text-transform: uppercase;">${status}</strong> on the <strong>${plan}</strong> plan.</p>
          <p>Thank you for playing and supporting a great cause.</p>
        </div>
      `,
    });
    console.log("Sent subscription email:", data);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendWinnerNotification(to: string, amount: number, matchType: string) {
  if (!process.env.RESEND_EMAIL_API_KEY) return;
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "🎉 You won a draw!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fffaf0; padding: 30px; border-radius: 15px; border: 2px solid #e63946;">
          <h2 style="color: #e63946; font-size: 24px; margin-top: 0;">Congratulations!</h2>
          <p>Your scores matched the <strong>${matchType}</strong> tier!</p>
          <p>You have won <strong>$${amount.toFixed(2)}</strong>.</p>
          <p>Please log in to your dashboard to view your winnings and upload your scorecard proof.</p>
          <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
        </div>
      `,
    });
    console.log("Sent winner email:", data);
  } catch (error) {
    console.error("Failed to send winner email:", error);
  }
}

export async function sendDrawPublishedNotification(emails: string[], prizePool: number, drawnNumbers: number[]) {
  if (!process.env.RESEND_EMAIL_API_KEY || emails.length === 0) return;
  
  // Resend free tier has strict limits, so we slice to max 50 for testing.
  const toList = emails.slice(0, 50);

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: toList, // some free tiers block bcc entirely, use "to" array
      subject: "Monthly Draw Results are Out!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h2>The latest draw has been published!</h2>
          <p>The winning numbers are: <strong>${drawnNumbers.join(", ")}</strong></p>
          <p>Total Prize Pool: <strong>$${prizePool.toFixed(2)}</strong></p>
          <p>Check your dashboard to see if you won!</p>
          <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 12px 24px; background: #e63946; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">View Results</a>
        </div>
      `,
    });
    console.log("Sent draw published emails:", data);
  } catch (error) {
    console.error("Failed to send broadcast info:", error);
  }
}
