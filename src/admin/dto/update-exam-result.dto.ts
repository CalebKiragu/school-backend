import { IsOptional, IsString } from 'class-validator';

export class UpdateExamResultDto {
  @IsOptional()
  @IsString()
  examName?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  stream?: string;

  @IsOptional()
  @IsString()
  class?: string;
}
