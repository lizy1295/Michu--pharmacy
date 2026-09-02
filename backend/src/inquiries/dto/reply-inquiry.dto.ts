import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class ReplyInquiryDto {
  @ApiProperty({ example: 'Ayat Branch is open 24 hours daily.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @SanitizeString()
  staffReply!: string;
}
