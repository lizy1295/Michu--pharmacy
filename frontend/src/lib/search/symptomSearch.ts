import { ChronicCondition, SymptomItem } from '@/lib/data/symptomData';

export interface MatchedSymptomTrigger {
  symptomName: string;
  matchedText: string;
  sourceType: 'symptom_name' | 'symptom_description' | 'keyword' | 'alias' | 'condition_name';
  matchType: 'exact' | 'phrase' | 'fuzzy';
  score: number;
}

export interface SymptomSearchResult {
  condition: ChronicCondition;
  score: number; // 0 (best) to 1
  relevancePercentage: number; // 0 to 100
  matchedSymptoms: MatchedSymptomTrigger[];
  topTrigger: string;
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Supports transpositions, insertions, deletions, substitutions.
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Create two work vectors of integer distances
  let v0 = new Array(n + 1);
  let v1 = new Array(n + 1);

  for (let i = 0; i <= n; i++) {
    v0[i] = i;
  }

  for (let i = 0; i < m; i++) {
    v1[0] = i + 1;

    for (let j = 0; j < n; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      v1[j + 1] = Math.min(
        v1[j] + 1,      // insertion
        v0[j + 1] + 1,  // deletion
        v0[j] + cost    // substitution
      );
    }

    for (let j = 0; j <= n; j++) {
      v0[j] = v1[j];
    }
  }

  return v1[n];
}

/**
 * Calculates normalized fuzzy similarity between a query token and a target word.
 * Returns a score between 0 (perfect match) and 1 (no match).
 */
function fuzzyTokenMatch(queryToken: string, targetWord: string): number {
  const q = queryToken.toLowerCase().trim();
  const t = targetWord.toLowerCase().trim();

  if (!q || !t) return 1.0;
  if (q === t) return 0.0; // Perfect match

  // Exact substring or prefix
  if (t.startsWith(q)) {
    return 0.1 * (1 - q.length / Math.max(t.length, 1));
  }
  if (t.includes(q)) {
    return 0.2 * (1 - q.length / Math.max(t.length, 1));
  }
  if (q.includes(t) && t.length >= 3) {
    return 0.25;
  }

  // Levenshtein edit distance for typo tolerance
  const dist = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const normalizedDist = dist / maxLen;

  // Permissible typos based on length
  if (maxLen <= 4 && dist <= 1) {
    return 0.35 * normalizedDist;
  }
  if (maxLen <= 7 && dist <= 2) {
    return 0.45 * normalizedDist;
  }
  if (maxLen > 7 && dist <= 3) {
    return 0.5 * normalizedDist;
  }

  return normalizedDist > 0.65 ? 1.0 : normalizedDist;
}

/**
 * Searches a text phrase with multi-word query tokens and returns the best match score and match type.
 */
function matchPhrase(query: string, targetText: string): { score: number; matchType: 'exact' | 'phrase' | 'fuzzy' } {
  const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const cleanTarget = targetText.toLowerCase().replace(/[^\w\s]/g, ' ').trim();

  if (!cleanQuery || !cleanTarget) return { score: 1.0, matchType: 'fuzzy' };

  // 1. Exact full phrase match
  if (cleanTarget === cleanQuery) {
    return { score: 0.0, matchType: 'exact' };
  }

  // 2. Substring phrase match
  if (cleanTarget.includes(cleanQuery)) {
    const ratio = cleanQuery.length / cleanTarget.length;
    return { score: 0.05 + 0.15 * (1 - ratio), matchType: 'phrase' };
  }

  // 3. Token-by-token fuzzy matching
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);
  const targetWords = cleanTarget.split(/\s+/).filter(w => w.length > 1);

  if (queryTokens.length === 0 || targetWords.length === 0) {
    return { score: 1.0, matchType: 'fuzzy' };
  }

  let totalScore = 0;
  let matchedTokensCount = 0;

  for (const qToken of queryTokens) {
    let bestWordScore = 1.0;

    for (const tWord of targetWords) {
      const score = fuzzyTokenMatch(qToken, tWord);
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

  // Must match at least 50% of query tokens for multi-token queries
  const matchRatio = matchedTokensCount / queryTokens.length;
  if (matchRatio < 0.5) {
    return { score: 1.0, matchType: 'fuzzy' };
  }

  const avgScore = (totalScore / queryTokens.length) * (1.5 - 0.5 * matchRatio);
  return {
    score: Math.min(1.0, Math.max(0.0, avgScore)),
    matchType: avgScore < 0.25 ? 'phrase' : 'fuzzy'
  };
}

/**
 * Searches the 10 chronic conditions for matching symptoms using fuzzy and typo-tolerant search.
 * Returns results ranked by relevance with specific matched symptom triggers.
 */
export function searchSymptomDatabase(
  query: string,
  conditions: ChronicCondition[],
  categoryFilter: string = 'All'
): SymptomSearchResult[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    // If no query, return conditions in default order (filtered by category if selected)
    const list = categoryFilter === 'All'
      ? conditions
      : conditions.filter(c => c.category === categoryFilter);

    return list.map(c => ({
      condition: c,
      score: 0.5,
      relevancePercentage: 100,
      matchedSymptoms: [],
      topTrigger: c.commonSymptoms[0]?.name || 'Standard Chronic Guide'
    }));
  }

  const results: SymptomSearchResult[] = [];

  for (const condition of conditions) {
    // Check category filter
    if (categoryFilter !== 'All' && condition.category !== categoryFilter) {
      continue;
    }

    const matchedTriggers: MatchedSymptomTrigger[] = [];
    let bestScore = 1.0;

    // 1. Check Common Symptoms (Primary focus)
    for (const symptom of condition.commonSymptoms) {
      // Check symptom name
      const nameMatch = matchPhrase(cleanQuery, symptom.name);
      if (nameMatch.score < 0.6) {
        matchedTriggers.push({
          symptomName: symptom.name,
          matchedText: symptom.name,
          sourceType: 'symptom_name',
          matchType: nameMatch.matchType,
          score: nameMatch.score
        });
        if (nameMatch.score < bestScore) {
          bestScore = nameMatch.score;
        }
      }

      // Check symptom description
      const descMatch = matchPhrase(cleanQuery, symptom.description);
      if (descMatch.score < 0.55) {
        matchedTriggers.push({
          symptomName: symptom.name,
          matchedText: symptom.description,
          sourceType: 'symptom_description',
          matchType: descMatch.matchType,
          score: descMatch.score + 0.05 // Slight penalty compared to name
        });
        if (descMatch.score + 0.05 < bestScore) {
          bestScore = descMatch.score + 0.05;
        }
      }
    }

    // 2. Check Search Keywords
    for (const kw of condition.searchKeywords) {
      const kwMatch = matchPhrase(cleanQuery, kw);
      if (kwMatch.score < 0.55) {
        matchedTriggers.push({
          symptomName: `Keyword: ${kw}`,
          matchedText: kw,
          sourceType: 'keyword',
          matchType: kwMatch.matchType,
          score: kwMatch.score + 0.08
        });
        if (kwMatch.score + 0.08 < bestScore) {
          bestScore = kwMatch.score + 0.08;
        }
      }
    }

    // 3. Check Condition Name & ShortName
    const nameMatch = matchPhrase(cleanQuery, condition.name);
    const shortNameMatch = matchPhrase(cleanQuery, condition.shortName);
    const minConditionNameScore = Math.min(nameMatch.score, shortNameMatch.score);

    if (minConditionNameScore < 0.55) {
      matchedTriggers.push({
        symptomName: condition.name,
        matchedText: condition.name,
        sourceType: 'condition_name',
        matchType: nameMatch.matchType,
        score: minConditionNameScore + 0.02
      });
      if (minConditionNameScore + 0.02 < bestScore) {
        bestScore = minConditionNameScore + 0.02;
      }
    }

    // 4. Check Aliases
    for (const alias of condition.aliases) {
      const aliasMatch = matchPhrase(cleanQuery, alias);
      if (aliasMatch.score < 0.55) {
        matchedTriggers.push({
          symptomName: `Alias: ${alias}`,
          matchedText: alias,
          sourceType: 'alias',
          matchType: aliasMatch.matchType,
          score: aliasMatch.score + 0.05
        });
        if (aliasMatch.score + 0.05 < bestScore) {
          bestScore = aliasMatch.score + 0.05;
        }
      }
    }

    // 5. If matches found below threshold (0.65), record result
    if (matchedTriggers.length > 0 && bestScore < 0.65) {
      // Sort triggers by best score
      matchedTriggers.sort((a, b) => a.score - b.score);

      // Deduplicate triggers by symptomName
      const uniqueTriggers: MatchedSymptomTrigger[] = [];
      const seen = new Set<string>();

      for (const t of matchedTriggers) {
        if (!seen.has(t.symptomName)) {
          seen.add(t.symptomName);
          uniqueTriggers.push(t);
        }
      }

      // Calculate composite score (more matching symptoms = higher relevance boost)
      const diversityBonus = Math.min(0.2, (uniqueTriggers.length - 1) * 0.05);
      const finalScore = Math.max(0.01, bestScore - diversityBonus);
      const relevancePercentage = Math.round(Math.max(10, Math.min(99, (1 - finalScore) * 100)));

      // Extract top trigger explanation
      const top = uniqueTriggers[0];
      const topTriggerText = top
        ? `${top.symptomName} (${top.matchType === 'exact' ? 'Exact Match' : top.matchType === 'phrase' ? 'Matched Phrase' : 'Fuzzy Match'})`
        : condition.commonSymptoms[0]?.name || 'Symptom Match';

      results.push({
        condition,
        score: finalScore,
        relevancePercentage,
        matchedSymptoms: uniqueTriggers,
        topTrigger: topTriggerText
      });
    }
  }

  // Sort ranked by relevance: lowest score first (highest relevance percentage)
  results.sort((a, b) => a.score - b.score);

  return results;
}
