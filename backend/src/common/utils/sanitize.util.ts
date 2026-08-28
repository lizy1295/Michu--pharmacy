import { Transform } from 'class-transformer';

/**
 * Sanitizes input string to prevent XSS and malicious injection patterns.
 * Strips dangerous HTML tags, inline event handlers, and script payloads.
 * Neutralizes SQL injection comment tokens in plain text inputs.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // 1. Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // 2. Strip dangerous HTML script and iframe tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Remove inline javascript event handlers (e.g. onerror=, onclick=, onload=)
  sanitized = sanitized.replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');

  // 4. Remove javascript: and vbscript: URIs
  sanitized = sanitized.replace(/javascript:[^"'\s]*/gi, '');
  sanitized = sanitized.replace(/vbscript:[^"'\s]*/gi, '');

  // 5. Strip any remaining raw HTML tags for plain text fields
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // 6. Neutralize common raw SQL comment tokens
  sanitized = sanitized.replace(/(--|\/\*|\*\/)/g, '');

  // 7. Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized.trim();
}

/**
 * Class-transformer decorator to automatically sanitize string properties on DTOs.
 */
export function SanitizeString() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeText(value);
    }
    return value;
  });
}
