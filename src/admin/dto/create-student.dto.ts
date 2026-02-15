import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsNumber()
  adm: number;

  @IsNotEmpty()
  @IsString()
  studentName: string;

  @IsNotEmpty()
  @IsString()
  parentPhone1: string;

  @IsNotEmpty()
  @IsString()
  parentPhone2: string;

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
