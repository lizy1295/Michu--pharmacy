/**
 * symptoms.ts — Public Symptom Triage API Client
 *
 * Calls the public NestJS backend endpoint POST /api/v1/symptoms/triage.
 * This endpoint is intentionally PUBLIC and requires no authentication.
 *
 * Uses raw `fetch` (not `apiFetch`) because apiFetch attaches a Bearer token
 * and this is a public endpoint. The caller is responsible for fallback logic.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Request / Response types — mirroring the backend DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface TriageRequest {
  query?: string;
  symptoms?: string[];
  category?: string;
}

export type TriageUrgency = 'CRITICAL_EMERGENCY' | 'emergency' | 'prompt' | 'routine';

export interface MatchedSymptomDto {
  symptomName: string;
  matchedText: string;
  sourceType: 'symptom_name' | 'symptom_description' | 'keyword' | 'alias' | 'condition_name';
  matchType: 'exact' | 'phrase' | 'fuzzy';
  score: number;
}

export interface MatchedConditionDto {
  id: string;
  name: string;
  shortName: string;
  category: string;
  categoryIcon: string;
  aliases: string[];
  searchKeywords: string[];
  summary: string;
  overview: string;
  pathophysiology: string;
  relevancePercentage: number;
  score: number;
  topTrigger: string;
  matchedSymptoms: MatchedSymptomDto[];
  commonSymptoms: Array<{
    name: string;
    description: string;
    severity?: 'mild' | 'moderate' | 'severe' | 'common' | 'occasional';
    category?: string;
  }>;
  whenToSeeDoctor: Array<{
    urgency: 'routine' | 'prompt' | 'emergency';
    title: string;
    description: string;
  }>;
  emergencyTriggers: string[];
  lifestyleAndSelfCare: string[];
  pharmacistGuidance: string[];
  commonMedicationClasses: Array<{
    name: string;
    purpose: string;
    example: string;
  }>;
  sourceCitations: Array<{
    organization: string;
    title: string;
    year?: string;
    url?: string;
    notes?: string;
  }>;
}

export interface EmergencyHotlinesDto {
  primary: string;
  secondary: string;
  nationalEmergency: string;
}

export interface TriageResponse {
  isEmergency: boolean;
  urgency: TriageUrgency;
  matchedConditions: MatchedConditionDto[];
  matchedSymptoms: MatchedSymptomDto[];
  explanation?: string;
  guidance?: string[];
  emergencyActions?: string[];
  emergencyHotlines?: EmergencyHotlinesDto;
  citations?: Array<{
    organization: string;
    title: string;
    year?: string;
    url?: string;
    notes?: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/symptoms/triage
 *
 * Sends a symptom query to the NestJS backend triage engine.
 * Returns ranked matched conditions and urgency classification.
 *
 * This is a PUBLIC endpoint — no Bearer token is attached.
 *
 * @throws Error on network failure or non-OK HTTP status
 */
export async function triageSymptoms(request: TriageRequest): Promise<TriageResponse> {
  const res = await fetch(`${API_URL}/symptoms/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string | string[] }).message ?? `Triage request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return res.json() as Promise<TriageResponse>;
}
