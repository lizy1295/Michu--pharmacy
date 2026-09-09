import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Supported payment methods that Chapa can route.
 * Add 'cbebirr' | 'awash' here when Chapa enables them on your account.
 */
export type ChapaPaymentMethod = 'telebirr' | 'cbe' | 'awash';

export interface ChapaInitResult {
  success: boolean;
  checkoutUrl?: string;
  /** Chapa's own transaction reference (tx_ref echo) */
  chapaReference?: string;
  /** Raw Chapa response, stored for debugging */
  rawResponse?: Record<string, unknown>;
  message?: string;
}

export interface ChapaVerifyResult {
  success: boolean;
  status?: string; // 'success' | 'pending' | 'failed'
  txRef?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  rawResponse?: Record<string, unknown>;
  message?: string;
}

/**
 * ChapaService
 *
 * Wraps the official Chapa payment gateway API:
 *   POST https://api.chapa.co/v1/transaction/initialize
 *
 * Key design decisions
 * --------------------
 * 1. CHAPA_SECRET_KEY lives ONLY in backend env — never exposed to the frontend.
 * 2. Amount is always taken from the DB order total — never from the frontend request.
 * 3. paymentMethod is forwarded as Chapa's `payment_method` field so the gateway
 *    routes to the correct provider (telebirr, cbebirr, awash_pay, etc.).
 * 4. When CHAPA_SECRET_KEY is absent or a placeholder the service runs in sandbox
 *    mode and returns a synthetic checkout URL so local dev works without credentials.
 */
@Injectable()
export class ChapaService {
  private readonly logger = new Logger(ChapaService.name);

  constructor(private readonly configService: ConfigService) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  private get secretKey(): string {
    return this.configService.get<string>('CHAPA_SECRET_KEY', '');
  }

  private get baseUrl(): string {
    return this.configService.get<string>('CHAPA_BASE_URL', 'https://api.chapa.co');
  }

  /**
   * Maps our internal payment method values to Chapa's accepted strings.
   * Extend this map when new methods become available on your Chapa account.
   */
  private toChapaMethod(method: ChapaPaymentMethod): string {
    const map: Record<ChapaPaymentMethod, string> = {
      telebirr: 'telebirr',
      cbe: 'cbebirr',
      awash: 'awash_pay',
    };
    return map[method] ?? method;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialize a Chapa payment session.
   *
   * @param txRef     Unique payment reference (e.g. "PAY-1753000000000-42")
   * @param amount    Order total from the database (decimal)
   * @param email     Customer email for Chapa's receipt
   * @param firstName Customer first name
   * @param lastName  Customer last name
   * @param method    Payment method to route through Chapa
   * @param title     Human-readable order description
   * @param returnUrl Where Chapa redirects the customer after payment
   * @param callbackUrl  Backend URL for Chapa's server-to-server webhook (Phase 3)
   */
  async initializeTransaction(params: {
    txRef: string;
    amount: number;
    email: string;
    firstName: string;
    lastName: string;
    method: ChapaPaymentMethod;
    title: string;
    returnUrl: string;
    callbackUrl?: string;
  }): Promise<ChapaInitResult> {
    if (!this.secretKey || this.secretKey.trim() === '') {
      this.logger.error('[Chapa] CHAPA_SECRET_KEY is not configured on the backend');
      return {
        success: false,
        message: 'Chapa secret key is not configured',
      };
    }

    // ── Live Chapa API call ────────────────────────────────────────────────
    const endpoint = `${this.baseUrl}/v1/transaction/initialize`;

    const body: Record<string, unknown> = {
      amount: params.amount.toFixed(2),
      currency: 'ETB',
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      tx_ref: params.txRef,
      title: params.title,
      customization: {
        title: params.title,
      },
      payment_method: this.toChapaMethod(params.method),
      return_url: params.returnUrl,
    };

    if (params.callbackUrl) {
      body['callback_url'] = params.callbackUrl;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const raw = (await response.json()) as Record<string, any>;

      if (raw?.status === 'success' && raw?.data?.checkout_url) {
        this.logger.log(`[Chapa] Transaction initialized — tx_ref=${params.txRef}`);
        return {
          success: true,
          checkoutUrl: raw.data.checkout_url as string,
          chapaReference: params.txRef,
          rawResponse: raw,
        };
      }

      // Chapa returned a non-success body — surface the message safely
      const message = (raw?.message as string) ?? 'Chapa initialization failed';
      this.logger.error(`[Chapa] Initialization error — tx_ref=${params.txRef} msg="${message}"`);
      return {
        success: false,
        message,
        rawResponse: raw,
      };
    } catch (err: unknown) {
      // Network / parse error — log internally but do NOT expose raw error to caller
      const safeMessage = 'Payment gateway is temporarily unavailable. Please try again.';
      this.logger.error(
        `[Chapa] Network/parse error for tx_ref=${params.txRef}`,
        err instanceof Error ? err.stack : String(err),
      );
      return {
        success: false,
        message: safeMessage,
      };
    }
  }

  private get webhookSecret(): string {
    return this.configService.get<string>('CHAPA_WEBHOOK_SECRET', '');
  }

  /**
   * Validate incoming webhook signature from Chapa.
   *
   * @param rawPayload The raw request body string or object
   * @param signature  The signature header ('x-chapa-signature' or 'chapa-signature')
   */
  validateWebhookSignature(rawPayload: any, signature: string | undefined): boolean {
    const secret = this.webhookSecret;
    if (!secret || !signature) {
      this.logger.warn('[Chapa] Missing CHAPA_WEBHOOK_SECRET or incoming signature header');
      return false;
    }

    try {
      const payloadString =
        typeof rawPayload === 'string'
          ? rawPayload
          : Buffer.isBuffer(rawPayload)
            ? rawPayload.toString('utf8')
            : JSON.stringify(rawPayload);

      const computedHash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      const computedBuf = Buffer.from(computedHash, 'utf8');
      const sigBuf = Buffer.from(signature.trim(), 'utf8');

      if (computedBuf.length !== sigBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(computedBuf, sigBuf);
    } catch (err) {
      this.logger.error('[Chapa] Error validating webhook signature', err);
      return false;
    }
  }

  /**
   * Verify transaction directly with Chapa's official Transaction Verification API:
   *   GET https://api.chapa.co/v1/transaction/verify/{tx_ref}
   *
   * @param txRef Unique transaction reference (e.g. "PAY-1725800000000-42")
   */
  async verifyTransaction(txRef: string): Promise<ChapaVerifyResult> {
    if (!this.secretKey || this.secretKey.trim() === '') {
      this.logger.error('[Chapa] CHAPA_SECRET_KEY is not configured on the backend');
      return {
        success: false,
        message: 'Chapa secret key is not configured',
      };
    }

    const endpoint = `${this.baseUrl}/v1/transaction/verify/${encodeURIComponent(txRef)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const raw = (await response.json()) as Record<string, any>;

      if (raw?.status === 'success' && raw?.data) {
        const data = raw.data;
        const isTxSuccess = data.status === 'success';

        this.logger.log(`[Chapa Verify] tx_ref=${txRef} status=${data.status} amount=${data.amount}`);

        return {
          success: isTxSuccess,
          status: data.status,
          txRef: data.tx_ref ?? txRef,
          reference: data.reference ?? data.tx_ref,
          amount: data.amount != null ? Number(data.amount) : undefined,
          currency: data.currency,
          paymentMethod: data.method,
          rawResponse: raw,
        };
      }

      const message = (raw?.message as string) ?? 'Transaction verification failed';
      this.logger.warn(`[Chapa Verify] Failed verification for tx_ref=${txRef}: ${message}`);
      return {
        success: false,
        status: raw?.data?.status ?? 'failed',
        message,
        rawResponse: raw,
      };
    } catch (err: unknown) {
      this.logger.error(
        `[Chapa Verify] Network error verifying tx_ref=${txRef}`,
        err instanceof Error ? err.stack : String(err),
      );
      return {
        success: false,
        message: 'Gateway verification request failed',
      };
    }
  }
}

