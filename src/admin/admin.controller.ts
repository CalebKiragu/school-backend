import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
import { UpdateFeeBalanceDto } from './dto/update-fee-balance.dto';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Student endpoints
  @Post('students')
  async createStudent(@Body() dto: CreateStudentDto) {
    return await this.adminService.createStudent(dto);
  }

  @Put('students/:id')
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return await this.adminService.updateStudent(id, dto);
  }

  @Delete('students/:id')
  async deleteStudent(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteStudent(id);
    return { message: 'Student deleted successfully' };
  }

  // Event endpoints - Allow string identifiers for demo data
  @Post('events')
  async createEvent(@Body() dto: CreateEventDto) {
    return await this.adminService.createEvent(dto);
  }

  @Put('events/:identifier')
  async updateEvent(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateEventDto,
  ) {
    // Try to parse as number first, otherwise use as string identifier
    const id = /^\d+$/.test(identifier) ? Number(identifier) : identifier;
    return await this.adminService.updateEvent(id, dto);
  }

  @Delete('events/:identifier')
  async deleteEvent(@Param('identifier') identifier: string) {
    // Try to parse as number first, otherwise use as string identifier
    const id = /^\d+$/.test(identifier) ? Number(identifier) : identifier;
    await this.adminService.deleteEvent(id);
    return { message: 'Event deleted successfully' };
  }

  // Test endpoint to debug validation issues
  @Get('test/:identifier')
  testEndpoint(@Param('identifier') identifier: string) {
    return { message: 'Test successful', identifier, type: typeof identifier };
  }

  // Exam result endpoints - Allow string identifiers for demo data
  @Post('exam-results')
  async createExamResult(@Body() dto: CreateExamResultDto) {
    return await this.adminService.createExamResult(dto);
  }

  @Put('exam-results/:identifier')
  async updateExamResult(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateExamResultDto,
  ) {
    // Try to parse as number first, otherwise use as string identifier
    const id = /^\d+$/.test(identifier) ? Number(identifier) : identifier;
    return await this.adminService.updateExamResult(id, dto);
  }

  @Delete('exam-results/:identifier')
  async deleteExamResult(@Param('identifier') identifier: string) {
    // Try to parse as number first, otherwise use as string identifier
    const id = /^\d+$/.test(identifier) ? Number(identifier) : identifier;
    await this.adminService.deleteExamResult(id);
    return { message: 'Exam result deleted successfully' };
  }

  // Fee balance endpoint
  @Put('fee-balances/:id')
  async updateFeeBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeBalanceDto,
  ) {
    return await this.adminService.updateFeeBalance(id, dto);
  }
}
