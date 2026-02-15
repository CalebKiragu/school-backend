import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentContact } from '../student/entities/student-contact.entity';
import { UpcomingEvent } from '../event/entities/upcoming-event.entity';
import { ExamResult } from '../exam/entities/exam-result.entity';
import { FeePayment } from '../fee/entities/fee-payment.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
import { UpdateFeeBalanceDto } from './dto/update-fee-balance.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(StudentContact)
    private readonly studentRepository: Repository<StudentContact>,
    @InjectRepository(UpcomingEvent)
    private readonly eventRepository: Repository<UpcomingEvent>,
    @InjectRepository(ExamResult)
    private readonly examRepository: Repository<ExamResult>,
    @InjectRepository(FeePayment)
    private readonly feeRepository: Repository<FeePayment>,
  ) {}

  // Student CRUD
  async createStudent(dto: CreateStudentDto): Promise<StudentContact> {
    const student = this.studentRepository.create({
      ...dto,
      datePosted: new Date(),
    });
    return await this.studentRepository.save(student);
  }

  async updateStudent(
    id: number,
    dto: UpdateStudentDto,
  ): Promise<StudentContact> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    Object.assign(student, dto);
    return await this.studentRepository.save(student);
  }

  async deleteStudent(id: number): Promise<void> {
    const result = await this.studentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }

  // Event CRUD
  async createEvent(dto: CreateEventDto): Promise<UpcomingEvent> {
    const event = this.eventRepository.create({
      ...dto,
      datePosted: new Date(),
    });
    return await this.eventRepository.save(event);
  }

  async updateEvent(id: number, dto: UpdateEventDto): Promise<UpcomingEvent> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    Object.assign(event, dto);
    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: number): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  // Exam Result CRUD
  async createExamResult(dto: CreateExamResultDto): Promise<ExamResult> {
    const result = this.examRepository.create({
      ...dto,
      datePosted: new Date(),
    });
    return await this.examRepository.save(result);
  }

  async updateExamResult(
    id: number,
    dto: UpdateExamResultDto,
  ): Promise<ExamResult> {
    const result = await this.examRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException(`Exam result with ID ${id} not found`);
    }
    Object.assign(result, dto);
    return await this.examRepository.save(result);
  }

  async deleteExamResult(id: number): Promise<void> {
    const result = await this.examRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exam result with ID ${id} not found`);
    }
  }

  // Fee Balance Update
  async updateFeeBalance(
    id: number,
    dto: UpdateFeeBalanceDto,
  ): Promise<FeePayment> {
    const payment = await this.feeRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Fee payment with ID ${id} not found`);
    }
    payment.feeBalance = dto.feeBalance;
    payment.datePosted = new Date();
    return await this.feeRepository.save(payment);
  }
}
