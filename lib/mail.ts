import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail({
  to,
  otp,
  userName,
}: {
  to: string;
  otp: string;
  userName: string;
}) {
  try {
    const data = await resend.emails.send({
      from: "FleetCo <noreply@fleetcotelematics.com>",
      to,
      subject: "Password Reset OTP - FleetCo",
      html: `
  <div style="background-color:#f6f8fa; padding:40px 0; font-family:Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.05); overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(to right, #004953, #004953); padding:24px; text-align:center;">
        <div style="width:56px; height:56px; margin:0 auto; background:white; border-radius:16px; display:inline-flex; align-items:center; justify-content:center; color:#004953; font-size:24px; font-weight:700; box-shadow:0 0 10px rgba(255,255,255,0.2);">
          <div>FC</div>
        </div>
        <div style="margin-top:10px;">
          <span style="font-size:28px; font-weight:700; color:white;">FleetCo</span>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <h2 style="color:#111827; margin-bottom:16px;">Password Reset Request</h2>
        <p style="color:#374151; line-height:1.6; margin-bottom:24px;">
          Hi ${userName},
        </p>
        <p style="color:#374151; line-height:1.6; margin-bottom:24px;">
          We received a request to reset your password. Use the OTP code below to complete the process:
        </p>

        <!-- OTP Display -->
        <div style="margin:32px 0; padding:24px; background:linear-gradient(135deg, #004953 0%, #006b7a 100%); border-radius:12px; text-align:center;">
          <p style="margin:0 0 8px; color:rgba(255,255,255,0.9); font-size:14px; font-weight:500; letter-spacing:1px;">YOUR OTP CODE</p>
          <div style="font-size:42px; font-weight:700; color:white; letter-spacing:8px; font-family:'Courier New', monospace;">
            ${otp}
          </div>
          <p style="margin:12px 0 0; color:rgba(255,255,255,0.8); font-size:13px;">
            This code expires in 3 minutes
          </p>
        </div>

        <div style="background-color:#fef3c7; border-left:4px solid #f59e0b; padding:16px; border-radius:8px; margin:24px 0;">
          <p style="margin:0; color:#92400e; font-size:14px; line-height:1.5;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately.
          </p>
        </div>

        <p style="color:#6b7280; font-size:14px; line-height:1.5; margin-top:24px;">
          For security reasons, this OTP will expire in 3 minutes. If you need a new code, you can request another one from the password reset page.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color:#f9fafb; text-align:center; padding:16px; color:#9ca3af; font-size:12px;">
        © ${new Date().getFullYear()} FleetCo Telematics. All rights reserved.
      </div>
    </div>
  </div>
      `,
    });

    return data;
  } catch (error) {
    console.error("OTP email sending failed:", error);
    throw error;
  }
}
