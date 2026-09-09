import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT', '587'));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail transport configured → ${host}:${port}`);
    } else {
      this.logger.warn(
        'MAIL_HOST / MAIL_USER / MAIL_PASS not configured. ' +
        'Password-reset emails will be logged to console only.',
      );
    }
  }

  /**
   * Send a password-reset email.
   * Silently logs if transport is not configured (dev fallback).
   */
  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const from =
      this.configService.get<string>('MAIL_FROM') ??
      '"Michu Pharmacy" <noreply@michupharmacy.com>';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2d6a4f 0%,#40916c 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">🏥 Michu Pharmacy</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Ethiopia's Trusted Pharmacy Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a2e;font-weight:700;">Reset Your Password</h2>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                We received a request to reset the password for your Michu Pharmacy account.
                Click the button below to choose a new password. This link expires in
                <strong>30 minutes</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#2d6a4f,#40916c);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#888;font-size:12px;">If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 28px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#40916c;font-size:12px;">${resetUrl}</a>
              </p>
              <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px 18px;">
                <p style="margin:0;color:#795548;font-size:12px;line-height:1.5;">
                  🔒 <strong>Didn't request this?</strong> You can safely ignore this email.
                  Your password will not change unless you click the button above.
                  Never share this link with anyone.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:11px;">
                &copy; ${new Date().getFullYear()} Michu Pharmacy · Addis Ababa, Ethiopia<br/>
                This email was sent to <strong>${to}</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text =
      `Reset your Michu Pharmacy password\n\n` +
      `Visit the following link within 30 minutes:\n${resetUrl}\n\n` +
      `If you did not request this, ignore this email.`;

    if (!this.transporter) {
      // Dev fallback — log reset URL so dev can test without a live SMTP server
      this.logger.warn(`[DEV] Password reset email for ${to}:\n${resetUrl}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from, to, subject: 'Reset your Michu Pharmacy password', html, text });
      this.logger.log(`Password-reset email sent to ${to}`);
    } catch (err) {
      // Do not propagate — prevents timing/email-enumeration leaks
      this.logger.error(`Failed to send password-reset email to ${to}`, (err as Error).message);
    }
  }

  /**
   * Send a 6-digit OTP email for password reset.
   * Silently logs OTP to console in dev mode if transporter is not configured.
   */
  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const from =
      this.configService.get<string>('MAIL_FROM') ??
      '"Michu Pharmacy" <noreply@michupharmacy.com>';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2d6a4f 0%,#40916c 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">🏥 Michu Pharmacy</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Ethiopia's Trusted Pharmacy Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a2e;font-weight:700;">Your Password Recovery Code</h2>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                Use the following 6-digit verification code to reset your Michu Pharmacy password.
                This code is valid for <strong>10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:#f0fdf4;border:2px dashed #40916c;border-radius:12px;padding:24px 16px;text-align:center;margin:0 0 24px;">
                <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#2d6a4f;display:inline-block;padding-left:10px;">
                  ${otp}
                </span>
              </div>
              <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
                <p style="margin:0;color:#795548;font-size:12px;line-height:1.5;">
                  🔒 <strong>Security Warning:</strong> Never share this code with anyone.
                  Michu Pharmacy representatives will never ask you for your verification code.
                </p>
              </div>
              <p style="margin:0;color:#888;font-size:12px;line-height:1.5;">
                If you did not request a password reset, no action is required and your account remains safe.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:11px;">
                &copy; ${new Date().getFullYear()} Michu Pharmacy · Addis Ababa, Ethiopia<br/>
                This email was sent to <strong>${to}</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text =
      `Your Michu Pharmacy verification code is: ${otp}\n\n` +
      `Use this code within 10 minutes to reset your password.\n` +
      `Never share this code with anyone.\n\n` +
      `If you did not request this, you can safely ignore this email.`;

    if (!this.transporter) {
      this.logger.warn(`[DEV] Password reset OTP for ${to}: [ ${otp} ]`);
      return;
    }

    try {
      await this.transporter.sendMail({ from, to, subject: 'Your Michu Pharmacy verification code', html, text });
      this.logger.log(`Password-reset OTP email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password-reset OTP email to ${to}`, (err as Error).message);
    }
  }
}

