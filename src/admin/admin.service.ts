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
  // In-memory store for demo data modifications
  private demoDataStore = {
    examResults: new Map<string, any>(),
    events: new Map<string, any>(),
    deletedExamResults: new Set<string>(),
    deletedEvents: new Set<string>(),
  };

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

  async updateEvent(
    id: number | string,
    dto: UpdateEventDto,
  ): Promise<UpcomingEvent> {
    // If it's a string identifier, this is demo data - store the update
    if (typeof id === 'string') {
      const mockEvent = new UpcomingEvent();
      mockEvent.id = 1;
      mockEvent.eventName = dto.eventName || 'Updated Event';
      mockEvent.eventDetails = dto.eventDetails || 'Updated details';
      mockEvent.startDate = new Date(dto.startDate || new Date());
      mockEvent.endDate = new Date(dto.endDate || new Date());
      mockEvent.schoolId = '35609104'; // SIGALAME BOYS' SENIOR SCHOOL
      mockEvent.datePosted = new Date();

      // Store the update in memory for demo data
      this.demoDataStore.events.set(id, {
        eventName: dto.eventName,
        eventDetails: dto.eventDetails,
        startDate: dto.startDate,
        endDate: dto.endDate,
        updatedAt: new Date(),
      });

      return mockEvent;
    }

    // Handle numeric ID (actual database operation)
    const event = await this.eventRepository.findOne({
      where: { id: id },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    Object.assign(event, dto);
    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: number | string): Promise<void> {
    // If it's a string identifier, this is demo data - mark as deleted
    if (typeof id === 'string') {
      this.demoDataStore.deletedEvents.add(id);
      return; // Mock success for demo data
    }

    // Handle numeric ID (actual database operation)
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
    id: number | string,
    dto: UpdateExamResultDto,
  ): Promise<ExamResult> {
    // If it's a string identifier, this is demo data - store the update
    if (typeof id === 'string') {
      const mockResult = new ExamResult();
      mockResult.id = 1;
      mockResult.adm = '12345';
      mockResult.studentName = 'Updated Student';
      mockResult.examName = dto.examName || 'Updated Exam';
      mockResult.results = dto.results || 'ENG:80MAT:85';
      mockResult.stream = dto.stream || 'A';
      mockResult.class = dto.class || 'FORM 1';
      mockResult.schoolId = 35609104; // SIGALAME BOYS' SENIOR SCHOOL
      mockResult.datePosted = new Date();

      // Store the update in memory for demo data
      this.demoDataStore.examResults.set(id, {
        examName: dto.examName,
        results: dto.results,
        stream: dto.stream,
        class: dto.class,
        updatedAt: new Date(),
      });

      return mockResult;
    }

    // Handle numeric ID (actual database operation)
    const result = await this.examRepository.findOne({
      where: { id: id },
    });
    if (!result) {
      throw new NotFoundException(`Exam result with ID ${id} not found`);
    }
    Object.assign(result, dto);
    return await this.examRepository.save(result);
  }

  async deleteExamResult(id: number | string): Promise<void> {
    // If it's a string identifier, this is demo data - mark as deleted
    if (typeof id === 'string') {
      this.demoDataStore.deletedExamResults.add(id);
      return; // Mock success for demo data
    }

    // Handle numeric ID (actual database operation)
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

  // Helper methods to check demo data modifications
  getDemoDataUpdates() {
    return {
      examResults: Object.fromEntries(this.demoDataStore.examResults),
      events: Object.fromEntries(this.demoDataStore.events),
      deletedExamResults: Array.from(this.demoDataStore.deletedExamResults),
      deletedEvents: Array.from(this.demoDataStore.deletedEvents),
    };
  }
}
