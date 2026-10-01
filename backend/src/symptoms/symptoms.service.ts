import { Injectable } from '@nestjs/common';
import {
  CHRONIC_CONDITIONS,
  ChronicCondition,
  QUICK_SYMPTOM_TAGS,
  RED_FLAG_KEYWORDS,
  RedFlagAlert,
} from './data/symptom-rules.data';
import { TriageRequestDto } from './dto/triage-request.dto';
import {
  MatchedConditionDto,
  MatchedSymptomDto,
  TriageResponseDto,
  TriageUrgency,
} from './dto/triage-response.dto';

interface InternalTriggerMatch extends MatchedSymptomDto {}

@Injectable()
export class SymptomsService {
  /**
   * Evaluates patient symptoms using a two-tier clinical rules engine:
   * Tier 1: Emergency red-flag screening (short-circuits and withholds normal results).
   * Tier 2: Typo-tolerant multi-factor fuzzy relevance and triage scoring.
   */
  triage(dto: TriageRequestDto): TriageResponseDto {
    const rawQuery = (dto.query || '').trim();
    const symptomsList = Array.isArray(dto.symptoms)
      ? dto.symptoms.map((s) => s.trim()).filter(Boolean)
      : [];
    const categoryFilter = dto.category?.trim() || 'All';

    // Build consolidated query tokens for red-flag screening
    const combinedTerms = [rawQuery, ...symptomsList].filter(Boolean);
    const consolidatedSearch = combinedTerms.join(' ').toLowerCase().trim();

    // =========================================================================
    // TIER 1: Emergency Red-Flag Screening
    // =========================================================================
    const detectedAlert = this.detectRedFlag(consolidatedSearch, symptomsList);

    if (detectedAlert) {
      return {
        isEmergency: true,
        urgency: 'CRITICAL_EMERGENCY',
        matchedConditions: [], // Intentionally suppressed to prevent delayed emergency care
        matchedSymptoms: [
          {
            symptomName: detectedAlert.title,
            matchedText: detectedAlert.keyword,
            sourceType: 'keyword',
            matchType: 'exact',
            score: 0,
          },
        ],
        explanation: detectedAlert.description,
        guidance: detectedAlert.immediateActions,
        emergencyActions: detectedAlert.immediateActions,
        emergencyHotlines: {
          primary: detectedAlert.emergencyPhone,
          secondary: detectedAlert.secondaryPhone || '0931325959',
          nationalEmergency: '907 / 911',
        },
        citations: [
          {
            organization: 'Ethiopian Ministry of Health (FMoH / EFDA)',
            title: 'National Emergency Clinical Triage & Referral Guidelines',
            year: '2024',
            notes: 'Immediate clinical protocol for acute cardiovascular, respiratory, and neurological emergencies.',
          },
        ],
      };
    }

    // =========================================================================
    // TIER 2: Deterministic Rule-Based Condition Matching
    // =========================================================================
    // If no query or symptoms supplied, return standard condition library
    if (combinedTerms.length === 0) {
      const filtered = categoryFilter === 'All'
        ? CHRONIC_CONDITIONS
        : CHRONIC_CONDITIONS.filter((c) => c.category === categoryFilter);

      const defaultConditions: MatchedConditionDto[] = filtered.map((c) => ({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        category: c.category,
        categoryIcon: c.categoryIcon,
        aliases: c.aliases,
        searchKeywords: c.searchKeywords,
        summary: c.summary,
        overview: c.overview,
        pathophysiology: c.pathophysiology,
        relevancePercentage: 100,
        score: 0.5,
        topTrigger: c.commonSymptoms[0]?.name || 'Standard Chronic Guide',
        matchedSymptoms: [],
        commonSymptoms: c.commonSymptoms,
        whenToSeeDoctor: c.whenToSeeDoctor,
        emergencyTriggers: c.emergencyTriggers,
        lifestyleAndSelfCare: c.lifestyleAndSelfCare,
        pharmacistGuidance: c.pharmacistGuidance,
        commonMedicationClasses: c.commonMedicationClasses,
        sourceCitations: c.sourceCitations,
      }));

      return {
        isEmergency: false,
        urgency: 'routine',
        matchedConditions: defaultConditions,
        matchedSymptoms: [],
        explanation: 'Showing comprehensive chronic condition clinical guides. Enter symptoms to evaluate triage.',
        guidance: [
          'Use the search bar or quick symptom tags to evaluate your specific health symptoms.',
          'Always consult a healthcare provider before initiating or adjusting any medication.',
        ],
        citations: [],
      };
    }

    // Match conditions against consolidated search terms
    const matchedConditions = this.matchConditions(
      combinedTerms,
      categoryFilter,
    );

    // Determine clinical urgency based on matched conditions and symptom severity
    let urgency: TriageUrgency = 'routine';
    let explanation = 'No exact condition matches found for the symptoms provided. Please consult with a licensed pharmacist or physician for a clinical evaluation.';
    let guidance: string[] = [
      'Schedule a consultation with a licensed Michu pharmacist.',
      'Monitor your symptoms closely and seek clinical medical evaluation if symptoms worsen or persist.',
    ];
    let citations: ChronicCondition['sourceCitations'] = [];

    const uniqueSymptomsList: MatchedSymptomDto[] = [];
    const seenSymptomNames = new Set<string>();

    for (const condition of matchedConditions) {
      for (const m of condition.matchedSymptoms) {
        if (!seenSymptomNames.has(m.symptomName)) {
          seenSymptomNames.add(m.symptomName);
          uniqueSymptomsList.push(m);
        }
      }
    }

    if (matchedConditions.length > 0) {
      const topCondition = matchedConditions[0];
      citations = topCondition.sourceCitations;

      // Check for prompt or emergency escalation criteria
      const hasSevereSymptomMatch = topCondition.commonSymptoms.some(
        (s) =>
          s.severity === 'severe' &&
          topCondition.matchedSymptoms.some((m) =>
            m.symptomName.toLowerCase().includes(s.name.toLowerCase()),
          ),
      );

      if (hasSevereSymptomMatch) {
        urgency = 'prompt';
      } else if (topCondition.relevancePercentage >= 40) {
        urgency = 'prompt';
      } else {
        urgency = 'routine';
      }

      explanation = `Symptom profile aligns with ${topCondition.name} (${topCondition.relevancePercentage}% relevance). Triggered by: ${topCondition.topTrigger}.`;
      guidance = topCondition.pharmacistGuidance;
    }

    return {
      isEmergency: false,
      urgency,
      matchedConditions,
      matchedSymptoms: uniqueSymptomsList,
      explanation,
      guidance,
      citations,
    };
  }

  /**
   * Retrieves all chronic conditions and reference categories for catalog / reference views.
   */
  getConditions(category?: string) {
    const list = category && category !== 'All'
      ? CHRONIC_CONDITIONS.filter((c) => c.category === category)
      : CHRONIC_CONDITIONS;

    const categories = ['All', ...Array.from(new Set(CHRONIC_CONDITIONS.map((c) => c.category)))];

    return {
      conditions: list,
      categories,
      quickSymptomTags: QUICK_SYMPTOM_TAGS,
      total: list.length,
    };
  }

  // ===========================================================================
  // PRIVATE HELPER METHODS (Rules & Matching Engine)
  // ===========================================================================

  /**
   * Scans input tokens for acute emergency red-flag keywords.
   */
  private detectRedFlag(consolidated: string, individualSymptoms: string[]): RedFlagAlert | null {
    if (!consolidated) return null;

    for (const alert of RED_FLAG_KEYWORDS) {
      const kw = alert.keyword.toLowerCase();

      // Check substring in consolidated string
      if (consolidated.includes(kw) || (kw.includes(consolidated) && consolidated.length >= 4)) {
        return alert;
      }

      // Check individual symptoms list
      for (const sym of individualSymptoms) {
        const cleanSym = sym.toLowerCase();
        if (cleanSym.includes(kw) || (kw.includes(cleanSym) && cleanSym.length >= 4)) {
          return alert;
        }
      }
    }

    return null;
  }

  /**
   * Executes deterministic multi-factor fuzzy relevance matching against all conditions.
   */
  private matchConditions(
    queryTokens: string[],
    categoryFilter: string,
  ): MatchedConditionDto[] {
    const fullQueryString = queryTokens.join(' ').trim();
    const results: MatchedConditionDto[] = [];

    for (const condition of CHRONIC_CONDITIONS) {
      if (categoryFilter !== 'All' && condition.category !== categoryFilter) {
        continue;
      }

      const matchedTriggers: InternalTriggerMatch[] = [];
      let bestScore = 1.0;

      // 1. Check Common Symptoms (Primary factor)
      for (const symptom of condition.commonSymptoms) {
        const nameMatch = this.matchPhrase(fullQueryString, symptom.name);
        if (nameMatch.score < 0.6) {
          matchedTriggers.push({
            symptomName: symptom.name,
            matchedText: symptom.name,
            sourceType: 'symptom_name',
            matchType: nameMatch.matchType,
            score: nameMatch.score,
          });
          if (nameMatch.score < bestScore) bestScore = nameMatch.score;
        }

        const descMatch = this.matchPhrase(fullQueryString, symptom.description);
        if (descMatch.score < 0.55) {
          matchedTriggers.push({
            symptomName: symptom.name,
            matchedText: symptom.description,
            sourceType: 'symptom_description',
            matchType: descMatch.matchType,
            score: descMatch.score + 0.05,
          });
          if (descMatch.score + 0.05 < bestScore) bestScore = descMatch.score + 0.05;
        }
      }

      // 2. Check Search Keywords
      for (const kw of condition.searchKeywords) {
        const kwMatch = this.matchPhrase(fullQueryString, kw);
        if (kwMatch.score < 0.55) {
          matchedTriggers.push({
            symptomName: `Keyword: ${kw}`,
            matchedText: kw,
            sourceType: 'keyword',
            matchType: kwMatch.matchType,
            score: kwMatch.score + 0.08,
          });
          if (kwMatch.score + 0.08 < bestScore) bestScore = kwMatch.score + 0.08;
        }
      }

      // 3. Check Condition Name & ShortName
      const nameMatch = this.matchPhrase(fullQueryString, condition.name);
      const shortNameMatch = this.matchPhrase(fullQueryString, condition.shortName);
      const minNameScore = Math.min(nameMatch.score, shortNameMatch.score);

      if (minNameScore < 0.55) {
        matchedTriggers.push({
          symptomName: condition.name,
          matchedText: condition.name,
          sourceType: 'condition_name',
          matchType: nameMatch.matchType,
          score: minNameScore + 0.02,
        });
        if (minNameScore + 0.02 < bestScore) bestScore = minNameScore + 0.02;
      }

      // 4. Check Aliases
      for (const alias of condition.aliases) {
        const aliasMatch = this.matchPhrase(fullQueryString, alias);
        if (aliasMatch.score < 0.55) {
          matchedTriggers.push({
            symptomName: `Alias: ${alias}`,
            matchedText: alias,
            sourceType: 'alias',
            matchType: aliasMatch.matchType,
            score: aliasMatch.score + 0.05,
          });
          if (aliasMatch.score + 0.05 < bestScore) bestScore = aliasMatch.score + 0.05;
        }
      }

      // 5. If matches found below threshold (0.65), record result
      if (matchedTriggers.length > 0 && bestScore < 0.65) {
        matchedTriggers.sort((a, b) => a.score - b.score);

        // Deduplicate triggers by symptomName
        const uniqueTriggers: InternalTriggerMatch[] = [];
        const seen = new Set<string>();

        for (const t of matchedTriggers) {
          if (!seen.has(t.symptomName)) {
            seen.add(t.symptomName);
            uniqueTriggers.push(t);
          }
        }

        // Apply diversity bonus for multiple matching symptoms
        const diversityBonus = Math.min(0.2, (uniqueTriggers.length - 1) * 0.05);
        const finalScore = Math.max(0.01, bestScore - diversityBonus);
        const relevancePercentage = Math.round(
          Math.max(10, Math.min(99, (1 - finalScore) * 100)),
        );

        const top = uniqueTriggers[0];
        const topTriggerText = top
          ? `${top.symptomName} (${top.matchType === 'exact' ? 'Exact Match' : top.matchType === 'phrase' ? 'Matched Phrase' : 'Fuzzy Match'})`
          : condition.commonSymptoms[0]?.name || 'Symptom Match';

        results.push({
          id: condition.id,
          name: condition.name,
          shortName: condition.shortName,
          category: condition.category,
          categoryIcon: condition.categoryIcon,
          aliases: condition.aliases,
          searchKeywords: condition.searchKeywords,
          summary: condition.summary,
          overview: condition.overview,
          pathophysiology: condition.pathophysiology,
          relevancePercentage,
          score: finalScore,
          topTrigger: topTriggerText,
          matchedSymptoms: uniqueTriggers,
          commonSymptoms: condition.commonSymptoms,
          whenToSeeDoctor: condition.whenToSeeDoctor,
          emergencyTriggers: condition.emergencyTriggers,
          lifestyleAndSelfCare: condition.lifestyleAndSelfCare,
          pharmacistGuidance: condition.pharmacistGuidance,
          commonMedicationClasses: condition.commonMedicationClasses,
          sourceCitations: condition.sourceCitations,
        });
      }
    }

    // Sort ranked by lowest score first (highest relevance percentage)
    results.sort((a, b) => a.score - b.score);
    return results;
  }

  /**
   * Levenshtein distance between two strings with insertions, deletions, substitutions.
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    if (m === 0) return n;
    if (n === 0) return m;

    const v0 = new Array(n + 1);
    const v1 = new Array(n + 1);

    for (let i = 0; i <= n; i++) {
      v0[i] = i;
    }

    for (let i = 0; i < m; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < n; j++) {
        const cost = s1[i] === s2[j] ? 0 : 1;
        v1[j + 1] = Math.min(
          v1[j] + 1,
          v0[j + 1] + 1,
          v0[j] + cost,
        );
      }
      for (let j = 0; j <= n; j++) {
        v0[j] = v1[j];
      }
    }

    return v1[n];
  }

  /**
   * Normalized fuzzy similarity between a query token and a target word (0 = perfect, 1 = no match).
   */
  private fuzzyTokenMatch(queryToken: string, targetWord: string): number {
    const q = queryToken.toLowerCase().trim();
    const t = targetWord.toLowerCase().trim();

    if (!q || !t) return 1.0;
    if (q === t) return 0.0;

    if (t.startsWith(q)) {
      return 0.1 * (1 - q.length / Math.max(t.length, 1));
    }
    if (t.includes(q)) {
      return 0.2 * (1 - q.length / Math.max(t.length, 1));
    }
    if (q.includes(t) && t.length >= 3) {
      return 0.25;
    }

    const dist = this.levenshteinDistance(q, t);
    const maxLen = Math.max(q.length, t.length);
    const normalizedDist = dist / maxLen;

    if (maxLen <= 4 && dist <= 1) return 0.35 * normalizedDist;
    if (maxLen <= 7 && dist <= 2) return 0.45 * normalizedDist;
    if (maxLen > 7 && dist <= 3) return 0.5 * normalizedDist;

    return normalizedDist > 0.65 ? 1.0 : normalizedDist;
  }

  /**
   * Matches multi-word phrase against target text.
   */
  private matchPhrase(
    query: string,
    targetText: string,
  ): { score: number; matchType: 'exact' | 'phrase' | 'fuzzy' } {
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    const cleanTarget = targetText.toLowerCase().replace(/[^\w\s]/g, ' ').trim();

    if (!cleanQuery || !cleanTarget) return { score: 1.0, matchType: 'fuzzy' };

    // 1. Exact full match
    if (cleanTarget === cleanQuery) {
      return { score: 0.0, matchType: 'exact' };
    }

    // 2. Substring match
    if (cleanTarget.includes(cleanQuery)) {
      const ratio = cleanQuery.length / cleanTarget.length;
      return { score: 0.05 + 0.15 * (1 - ratio), matchType: 'phrase' };
    }

    // 3. Token-by-token fuzzy matching
    const queryTokens = cleanQuery.split(/\s+/).filter((t) => t.length > 1);
    const targetWords = cleanTarget.split(/\s+/).filter((w) => w.length > 1);

    if (queryTokens.length === 0 || targetWords.length === 0) {
      return { score: 1.0, matchType: 'fuzzy' };
    }

    let totalScore = 0;
    let matchedTokensCount = 0;

    for (const qToken of queryTokens) {
      let bestWordScore = 1.0;

      for (const tWord of targetWords) {
        const score = this.fuzzyTokenMatch(qToken, tWord);
        if (score < bestWordScore) {
          bestWordScore = score;
        }
        if (bestWordScore === 0) break;
      }

      if (bestWordScore <= 0.6) {
        matchedTokensCount++;
        totalScore += bestWordScore;
      } else {
        totalScore += 1.0;
      }
    }

    // Must match at least 50% of query tokens
    const matchRatio = matchedTokensCount / queryTokens.length;
    if (matchRatio < 0.5) {
      return { score: 1.0, matchType: 'fuzzy' };
    }

    const avgScore = (totalScore / queryTokens.length) * (1.5 - 0.5 * matchRatio);
    return {
      score: Math.min(1.0, Math.max(0.0, avgScore)),
      matchType: avgScore < 0.25 ? 'phrase' : 'fuzzy',
    };
  }
}
