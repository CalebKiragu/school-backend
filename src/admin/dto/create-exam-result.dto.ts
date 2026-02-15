import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateExamResultDto {
  @IsNotEmpty()
  @IsString()
  adm: string;

  @IsNotEmpty()
  @IsString()
  studentName: string;

  @IsNotEmpty()
  @IsString()
  examName: string;

  @IsNotEmpty()
  @IsString()
  results: string;

  @IsNotEmpty()
  @IsString()
  stream: string;

  @IsNotEmpty()
  @IsString()
  class: string;

  @IsNotEmpty()
  @IsNumber()
  schoolId: number;
}
