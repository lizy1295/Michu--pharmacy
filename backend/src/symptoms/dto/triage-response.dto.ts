import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class TriageResponseDto {
  @ApiProperty({
    example: false,
    description: 'Whether an immediate life-threatening emergency was triggered',
  })
  isEmergency!: boolean;

  @ApiProperty({
    enum: ['CRITICAL_EMERGENCY', 'emergency', 'prompt', 'routine'],
    example: 'routine',
    description: 'Calculated urgency level based on deterministic triage rules',
  })
  urgency!: TriageUrgency;

  @ApiProperty({
    description: 'Ranked list of matching conditions in descending relevance order',
  })
  matchedConditions!: MatchedConditionDto[];

  @ApiProperty({
    description: 'Specific triggering symptoms identified during evaluation',
  })
  matchedSymptoms!: MatchedSymptomDto[];

  @ApiPropertyOptional({
    description: 'Clinical summary explanation of the triage result',
  })
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Clinical self-care guidance or pharmacist counseling tips',
    type: [String],
  })
  guidance?: string[];

  @ApiPropertyOptional({
    description: 'Immediate first-aid life-saving action protocol when an emergency is detected',
    type: [String],
  })
  emergencyActions?: string[];

  @ApiPropertyOptional({
    description: 'Telephone emergency hotlines for immediate clinical dispatch',
  })
  emergencyHotlines?: EmergencyHotlinesDto;

  @ApiPropertyOptional({
    description: 'Accredited medical source citations supporting this guidance',
  })
  citations?: Array<{
    organization: string;
    title: string;
    year?: string;
    url?: string;
    notes?: string;
  }>;
}
