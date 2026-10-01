import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TriageRequestDto } from './dto/triage-request.dto';
import { TriageResponseDto } from './dto/triage-response.dto';
import { SymptomsService } from './symptoms.service';

@ApiTags('Symptoms')
@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  /**
   * Evaluate symptoms and return deterministic clinical triage recommendations.
   * Public endpoint — no authentication required.
   */
  @Post('triage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate symptoms and return clinical triage recommendations (Public)',
    description:
      'Performs two-tier clinical triage: Tier 1 screens for immediate life-threatening red-flags (suppresses chronic conditions and returns emergency action protocols); Tier 2 performs fuzzy relevance scoring against accredited chronic condition guides.',
  })
  @ApiBody({ type: TriageRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Triage assessment result with urgency level, guidance, and matched conditions',
    type: TriageResponseDto,
  })
  triage(@Body() dto: TriageRequestDto): TriageResponseDto {
    return this.symptomsService.triage(dto);
  }

  /**
   * Get all chronic condition clinical guides and available categories.
   * Public endpoint — no authentication required.
   */
  @Get('conditions')
  @ApiOperation({
    summary: 'Get all available chronic condition guides and categories (Public)',
    description:
      'Returns the full reference library of 10 chronic condition clinical guides, categories, and quick symptom tags.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Optional filter by clinical category (e.g. "Respiratory", "Cardiovascular")',
  })
  @ApiResponse({
    status: 200,
    description: 'List of condition guides and categories',
  })
  getConditions(@Query('category') category?: string) {
    return this.symptomsService.getConditions(category);
  }
}
