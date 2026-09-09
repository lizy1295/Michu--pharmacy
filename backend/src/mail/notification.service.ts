import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

export interface SmsProvider {
  sendSms(toPhone: string, message: string): Promise<boolean>;
}

export interface OtpRecipient {
  email?: string;
  phone?: string;
}

/**
 * Multi-channel notification service for OTP verification codes.
 * Ready for both email and SMS delivery.
 *
 * Pluggable SMS architecture allows dropping in Ethio Telecom,
 * Telebirr SMS, Twilio, or Africa's Talking SMS providers without
 * touching core authentication logic.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider | null = null;

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a custom SMS provider adapter (e.g. Telebirr, Ethio Telecom, Twilio).
   */
  setSmsProvider(provider: SmsProvider): void {
    this.smsProvider = provider;
    this.logger.log('Custom SMS provider registered successfully.');
  }

  /**
   * Dispatches the 6-digit OTP to the user via their preferred or available channel.
   * Priority: Email if provided; additionally or alternatively SMS if phone provided.
   */
  async sendOtp(recipient: OtpRecipient, otp: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (recipient.email) {
      promises.push(this.mailService.sendPasswordResetOtp(recipient.email, otp));
    }

    if (recipient.phone) {
      promises.push(this.sendSmsOtp(recipient.phone, otp));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Sends OTP via SMS. Falls back to development console logging if no SMS provider is active.
   */
  private async sendSmsOtp(phone: string, otp: string): Promise<void> {
    const message = `Your Michu Pharmacy verification code is: ${otp}. Valid for 10 minutes. Never share this code.`;

    if (this.smsProvider) {
      try {
        const success = await this.smsProvider.sendSms(phone, message);
        if (success) {
          this.logger.log(`Password reset SMS sent to ${phone}`);
        } else {
          this.logger.warn(`SMS provider reported failure delivering to ${phone}`);
        }
      } catch (err) {
        this.logger.error(`Failed to send SMS to ${phone}`, (err as Error).message);
      }
      return;
    }

    // Dev fallback for SMS
    this.logger.warn(`[DEV SMS] Password recovery code for ${phone}: [ ${otp} ]`);
  }
}
