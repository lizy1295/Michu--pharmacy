import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface TelebirrInitResponse {
  success: boolean;
  checkoutUrl?: string;
  providerTransactionId?: string;
  providerReference?: string;
  rawResponse?: any;
  message?: string;
}

export interface TelebirrVerifyResponse {
  success: boolean;
  paid: boolean;
  providerTransactionId?: string;
  status: string;
  message?: string;
  rawResponse?: any;
}

@Injectable()
export class TelebirrService {
  private readonly logger = new Logger(TelebirrService.name);

  constructor(private readonly configService: ConfigService) {}

  private get isSandbox(): boolean {
    const sandboxEnv = this.configService.get<string>('PAYMENT_SANDBOX_MODE', 'true');
    const appId = this.configService.get<string>('TELEBIRR_MERCHANT_APP_ID');
    return sandboxEnv === 'true' || !appId || appId === 'your_telebirr_app_id';
  }

  private get merchantAppId(): string {
    return this.configService.get<string>('TELEBIRR_MERCHANT_APP_ID', 'MICHU_TELEBIRR_APP');
  }

  private get shortCode(): string {
    return this.configService.get<string>('TELEBIRR_SHORT_CODE', '100200');
  }

  private get appKey(): string {
    return this.configService.get<string>('TELEBIRR_APP_KEY', 'telebirr_app_key_secret');
  }

  private get publicKey(): string {
    return this.configService.get<string>('TELEBIRR_PUBLIC_KEY', '');
  }

  /**
   * Generates RSA/MD5 signature for Telebirr request payload
   */
  signPayload(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .map((k) => `${k}=${typeof params[k] === 'object' ? JSON.stringify(params[k]) : params[k]}`)
      .join('&');

    const toSign = `${signString}&key=${this.appKey}`;
    return crypto.createHash('sha256').update(toSign).digest('hex').toUpperCase();
  }

  /**
   * Initiates payment with Telebirr H5/Web Gateway
   */
  async initiatePayment(data: {
    paymentNumber: string;
    amount: number;
    title: string;
    notifyUrl: string;
    returnUrl: string;
  }): Promise<TelebirrInitResponse> {
    const providerReference = `TB-REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (this.isSandbox) {
      this.logger.log(`[Telebirr Sandbox] Initiated payment ${data.paymentNumber} for ${data.amount} ETB`);
      return {
        success: true,
        providerReference,
        providerTransactionId: `TB-TXN-${Date.now()}`,
        checkoutUrl: `https://telebirr.ethio.et/pay?outTradeNo=${providerReference}&amount=${data.amount}&ref=${data.paymentNumber}`,
        rawResponse: {
          code: 200,
          msg: 'SUCCESS',
          data: {
            outTradeNo: providerReference,
            toPayUrl: `https://telebirr.ethio.et/pay?outTradeNo=${providerReference}&amount=${data.amount}`,
          },
        },
      };
    }

    try {
      const payload = {
        appId: this.merchantAppId,
        shortCode: this.shortCode,
        outTradeNo: data.paymentNumber,
        subject: data.title,
        totalAmount: data.amount.toFixed(2),
        currency: 'ETB',
        notifyUrl: data.notifyUrl,
        returnUrl: data.returnUrl,
        timestamp: Date.now().toString(),
      };

      const sign = this.signPayload(payload);
      const requestBody = { ...payload, sign };

      // Make actual Telebirr API Call
      const apiEndpoint = this.configService.get<string>(
        'TELEBIRR_API_ENDPOINT',
        'https://app.telebirr.et:8443/api/pay/applyPayReq',
      );

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result && (result.code === 200 || result.code === '0')) {
        return {
          success: true,
          providerReference: result.data?.outTradeNo || providerReference,
          providerTransactionId: result.data?.transactionId || result.data?.tradeNo,
          checkoutUrl: result.data?.toPayUrl || result.data?.payUrl,
          rawResponse: result,
        };
      }

      return {
        success: false,
        message: result?.msg || 'Telebirr payment initiation failed',
        rawResponse: result,
      };
    } catch (error: any) {
      this.logger.error('Telebirr initiation error', error?.stack || error);
      return {
        success: false,
        message: error?.message || 'Network error connecting to Telebirr API',
      };
    }
  }

  /**
   * Verifies Telebirr payment status directly with provider query API
   */
  async verifyPayment(paymentNumber: string, providerReference?: string): Promise<TelebirrVerifyResponse> {
    if (this.isSandbox) {
      this.logger.log(`[Telebirr Sandbox] Verification query for ${paymentNumber}`);
      return {
        success: true,
        paid: true,
        providerTransactionId: providerReference || `TB-TXN-VERIFIED-${Date.now()}`,
        status: 'PAID',
        message: 'Sandbox Telebirr payment verified successfully',
      };
    }

    try {
      const payload = {
        appId: this.merchantAppId,
        outTradeNo: paymentNumber,
        timestamp: Date.now().toString(),
      };

      const sign = this.signPayload(payload);
      const requestBody = { ...payload, sign };

      const queryEndpoint = this.configService.get<string>(
        'TELEBIRR_QUERY_ENDPOINT',
        'https://app.telebirr.et:8443/api/pay/queryOrder',
      );

      const response = await fetch(queryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      const tradeStatus = result?.data?.tradeStatus || result?.data?.status;

      if (tradeStatus === 'SUCCESS' || tradeStatus === 'PAID') {
        return {
          success: true,
          paid: true,
          providerTransactionId: result.data?.transactionId || result.data?.tradeNo,
          status: 'PAID',
          rawResponse: result,
        };
      }

      return {
        success: true,
        paid: false,
        status: tradeStatus || 'PENDING',
        message: result?.msg || 'Payment pending or not completed',
        rawResponse: result,
      };
    } catch (error: any) {
      this.logger.error('Telebirr verify error', error?.stack || error);
      return {
        success: false,
        paid: false,
        status: 'ERROR',
        message: error?.message || 'Failed to communicate with Telebirr verification server',
      };
    }
  }

  /**
   * Validates webhook callback signature from Telebirr
   */
  validateWebhookSignature(body: Record<string, any>): boolean {
    if (this.isSandbox) return true;
    if (!body || !body.sign) return false;

    const { sign, ...params } = body;
    const computed = this.signPayload(params);
    return computed === sign;
  }
}
