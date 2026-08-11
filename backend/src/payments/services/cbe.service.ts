import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CbeInitResponse {
  success: boolean;
  checkoutUrl?: string;
  providerTransactionId?: string;
  providerReference?: string;
  rawResponse?: any;
  message?: string;
}

export interface CbeVerifyResponse {
  success: boolean;
  paid: boolean;
  providerTransactionId?: string;
  status: string;
  message?: string;
  rawResponse?: any;
}

@Injectable()
export class CbeService {
  private readonly logger = new Logger(CbeService.name);

  constructor(private readonly configService: ConfigService) {}

  private get isSandbox(): boolean {
    const sandboxEnv = this.configService.get<string>('PAYMENT_SANDBOX_MODE', 'true');
    const merchantId = this.configService.get<string>('CBE_MERCHANT_ID');
    return sandboxEnv === 'true' || !merchantId || merchantId === 'your_cbe_merchant_id';
  }

  private get merchantId(): string {
    return this.configService.get<string>('CBE_MERCHANT_ID', 'MICHU_CBE_MERCHANT');
  }

  private get apiKey(): string {
    return this.configService.get<string>('CBE_API_KEY', 'cbe_api_key_secret');
  }

  private get apiSecret(): string {
    return this.configService.get<string>('CBE_API_SECRET', 'cbe_api_secret_key');
  }

  private get tillNumber(): string {
    return this.configService.get<string>('CBE_TILL_NUMBER', '998877');
  }

  /**
   * Generates HMAC-SHA256 signature for CBE request
   */
  signPayload(payloadString: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Initiates payment with CBE Birr Gateway
   */
  async initiatePayment(data: {
    paymentNumber: string;
    amount: number;
    title: string;
    notifyUrl: string;
    returnUrl: string;
  }): Promise<CbeInitResponse> {
    const providerReference = `CBE-REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (this.isSandbox) {
      this.logger.log(`[CBE Sandbox] Initiated payment ${data.paymentNumber} for ${data.amount} ETB`);
      return {
        success: true,
        providerReference,
        providerTransactionId: `CBE-TXN-${Date.now()}`,
        checkoutUrl: `https://cbebirr.cbe.com.et/pay?ref=${providerReference}&till=${this.tillNumber}&amount=${data.amount}`,
        rawResponse: {
          status: 'SUCCESS',
          code: '200',
          data: {
            referenceNo: providerReference,
            tillNo: this.tillNumber,
            paymentUrl: `https://cbebirr.cbe.com.et/pay?ref=${providerReference}&amount=${data.amount}`,
          },
        },
      };
    }

    try {
      const payload = {
        merchantId: this.merchantId,
        tillNumber: this.tillNumber,
        referenceNumber: data.paymentNumber,
        amount: data.amount,
        currency: 'ETB',
        narrative: data.title,
        callbackUrl: data.notifyUrl,
        redirectUrl: data.returnUrl,
        timestamp: new Date().toISOString(),
      };

      const payloadStr = JSON.stringify(payload);
      const signature = this.signPayload(payloadStr);

      const apiEndpoint = this.configService.get<string>(
        'CBE_API_ENDPOINT',
        'https://api.cbe.com.et/cbebirr/v1/checkout/initiate',
      );

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CBE-API-KEY': this.apiKey,
          'X-CBE-SIGNATURE': signature,
        },
        body: payloadStr,
      });

      const result = await response.json();

      if (result && (result.status === 'SUCCESS' || result.code === 200)) {
        return {
          success: true,
          providerReference: result.data?.referenceNumber || providerReference,
          providerTransactionId: result.data?.transactionId || result.data?.cbeTransactionId,
          checkoutUrl: result.data?.paymentUrl || result.data?.checkoutUrl,
          rawResponse: result,
        };
      }

      return {
        success: false,
        message: result?.message || 'CBE Birr payment initiation failed',
        rawResponse: result,
      };
    } catch (error: any) {
      this.logger.error('CBE initiation error', error?.stack || error);
      return {
        success: false,
        message: error?.message || 'Network error connecting to CBE Birr API',
      };
    }
  }

  /**
   * Verifies CBE Birr transaction status
   */
  async verifyPayment(paymentNumber: string, providerReference?: string): Promise<CbeVerifyResponse> {
    if (this.isSandbox) {
      this.logger.log(`[CBE Sandbox] Verification query for ${paymentNumber}`);
      return {
        success: true,
        paid: true,
        providerTransactionId: providerReference || `CBE-TXN-VERIFIED-${Date.now()}`,
        status: 'PAID',
        message: 'Sandbox CBE Birr payment verified successfully',
      };
    }

    try {
      const queryEndpoint = this.configService.get<string>(
        'CBE_QUERY_ENDPOINT',
        `https://api.cbe.com.et/cbebirr/v1/checkout/verify/${paymentNumber}`,
      );

      const signature = this.signPayload(paymentNumber);

      const response = await fetch(queryEndpoint, {
        method: 'GET',
        headers: {
          'X-CBE-API-KEY': this.apiKey,
          'X-CBE-SIGNATURE': signature,
        },
      });

      const result = await response.json();
      const status = result?.data?.status || result?.status;

      if (status === 'COMPLETED' || status === 'PAID' || status === 'SUCCESS') {
        return {
          success: true,
          paid: true,
          providerTransactionId: result.data?.transactionId || result.data?.cbeRefNo,
          status: 'PAID',
          rawResponse: result,
        };
      }

      return {
        success: true,
        paid: false,
        status: status || 'PENDING',
        message: result?.message || 'Payment pending or incomplete',
        rawResponse: result,
      };
    } catch (error: any) {
      this.logger.error('CBE verify error', error?.stack || error);
      return {
        success: false,
        paid: false,
        status: 'ERROR',
        message: error?.message || 'Failed to query CBE Birr verification status',
      };
    }
  }

  /**
   * Validates webhook callback signature from CBE
   */
  validateWebhookSignature(payloadString: string, signature: string): boolean {
    if (this.isSandbox) return true;
    if (!signature) return false;
    const computed = this.signPayload(payloadString);
    return computed === signature;
  }
}
