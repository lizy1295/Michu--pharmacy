import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
 * Supports Email and SMS (SMS Ethiopia API) delivery.
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider | null = null;

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('SMS_ETHIOPIA_API_KEY');
    if (apiKey) {
      this.setSmsProvider({
        sendSms: (toPhone, message) => this.sendViaSmsEthiopia(toPhone, message, apiKey),
      });
      this.logger.log('SMS Ethiopia Provider automatically initialized with API Key.');
    }
  }

  /**
   * Register a custom SMS provider adapter.
   */
  setSmsProvider(provider: SmsProvider): void {
    this.smsProvider = provider;
    this.logger.log('SMS provider registered successfully.');
  }

  /**
   * Dispatches the 6-digit OTP to the user via Email and/or SMS depending on provided details.
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
   * Sends OTP via SMS Ethiopia or logs to dev console if no provider configured.
   */
  private async sendSmsOtp(phone: string, otp: string): Promise<void> {
    const message = `Your Michu Pharmacy verification code is: ${otp}. Valid for 10 minutes. Never share this code.`;
    const apiKey = this.configService.get<string>('SMS_ETHIOPIA_API_KEY');

    if (this.smsProvider || apiKey) {
      try {
        const provider = this.smsProvider ?? {
          sendSms: (to, msg) => this.sendViaSmsEthiopia(to, msg, apiKey!),
        };
        const success = await provider.sendSms(phone, message);
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

  /**
   * SMS Ethiopia API Adapter implementation (https://smsethiopia.et/api/sms/send)
   */
  private async sendViaSmsEthiopia(toPhone: string, message: string, apiKey: string): Promise<boolean> {
    let msisdn = toPhone.replace(/\D/g, ''); // retain digits only
    if (msisdn.startsWith('0')) {
      msisdn = '251' + msisdn.substring(1);
    } else if (msisdn.startsWith('9') || msisdn.startsWith('7')) {
      msisdn = '251' + msisdn;
    }

    this.logger.log(`[SMS Ethiopia] Sending SMS to ${msisdn} with API Key ${apiKey ? '***' + apiKey.slice(-4) : 'MISSING'}`);

    try {
      const response = await fetch('https://smsethiopia.et/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'KEY': apiKey,
        },
        body: JSON.stringify({
          msisdn,
          text: message,
        }),
      });

      const responseText = await response.text();
      this.logger.log(`[SMS Ethiopia] Response HTTP ${response.status}: ${responseText}`);

      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {}

      if (response.ok || (data && (data.status === 'success' || data.status === 'ok' || data.code === 200))) {
        this.logger.log(`SMS Ethiopia successfully delivered code to ${msisdn}`);
        return true;
      }

      this.logger.warn(`SMS Ethiopia error response for ${msisdn}: ${responseText}`);
      return false;
    } catch (err: any) {
      this.logger.error(`SMS Ethiopia HTTP request failed for ${msisdn}: ${err.message}`);
      return false;
    }
  }
}

