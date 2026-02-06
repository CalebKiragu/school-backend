import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ExamService, ExamResultDto } from '../../exam/exam.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('api/exams')
@UseGuards(AuthGuard('jwt'))
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('results')
  @ApiOperation({ summary: 'Get all exam results for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Exam results retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExamResults(@Request() req): Promise<ExamResultDto[]> {
    const phoneNumber = req.user.phoneNumber;
    return this.examService.getExamResults(phoneNumber);
  }

  @Get('results/:studentId')
  @ApiOperation({ summary: 'Get exam results for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student admission number' })
  @ApiResponse({
    status: 200,
    description: 'Student exam results retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExamResultsByStudent(
    @Param('studentId') studentId: string,
    @Request() req,
  ): Promise<ExamResultDto[]> {
    const phoneNumber = req.user.phoneNumber;
    const allResults = await this.examService.getExamResults(phoneNumber);

    // Filter results for specific student
    return allResults.filter((result) => result.adm === studentId);
  }
}
