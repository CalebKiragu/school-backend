import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExamService, ExamResultDto } from './exam.service';
import { ExamResultsUssdView } from './entities/exam-results-ussd.view';

describe('ExamService', () => {
  let service: ExamService;

  const mockExamResultsRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: getRepositoryToken(ExamResultsUssdView),
          useValue: mockExamResultsRepository,
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExamResults', () => {
    it('should return exam results for a phone number', async () => {
      const phoneNumber = '+254712345678';
      const mockExamResults = [
        {
          adm: '12345',
          studentName: 'John Doe',
          examName: 'End Term 1',
          results: 'ENG:75KIS:80MAT:85',
          class: 'Form 1',
          datePosted: new Date('2024-01-15'),
        },
      ];

      mockExamResultsRepository.find.mockResolvedValue(mockExamResults);

      const result = await service.getExamResults(phoneNumber);

      expect(result).toHaveLength(1);
      expect(result[0].adm).toBe('12345');
      expect(result[0].studentName).toBe('John Doe');
      expect(result[0].formattedResults).toEqual([
        { subject: 'ENG', score: 75, grade: 'A-' },
        { subject: 'KIS', score: 80, grade: 'A' },
        { subject: 'MAT', score: 85, grade: 'A' },
      ]);
    });

    it('should return empty array when no exam results found', async () => {
      const phoneNumber = '+254712345678';
      mockExamResultsRepository.find.mockResolvedValue([]);

      const result = await service.getExamResults(phoneNumber);

      expect(result).toEqual([]);
    });
  });

  describe('parseResultString', () => {
    it('should parse result string correctly', () => {
      const resultString = 'ENG:75KIS:80MAT:85BIO:70';

      const result = service.parseResultString(resultString);

      expect(result).toEqual([
        { subject: 'ENG', score: 75, grade: 'A-' },
        { subject: 'KIS', score: 80, grade: 'A' },
        { subject: 'MAT', score: 85, grade: 'A' },
        { subject: 'BIO', score: 70, grade: 'B+' },
      ]);
    });

    it('should handle empty result string', () => {
      const resultString = '';

      const result = service.parseResultString(resultString);

      expect(result).toEqual([]);
    });

    it('should handle malformed result string', () => {
      const resultString = 'INVALID_FORMAT';

      const result = service.parseResultString(resultString);

      expect(result).toEqual([]);
    });
  });

  describe('formatResultsForUssd', () => {
    it('should format exam results for USSD display', () => {
      const examResults: ExamResultDto[] = [
        {
          adm: '12345',
          studentName: 'John Doe',
          examName: 'End Term 1',
          results: 'ENG:75KIS:80MAT:85',
          class: 'Form 1',
          datePosted: new Date('2024-01-15'),
          formattedResults: [
            { subject: 'ENG', score: 75, grade: 'A-' },
            { subject: 'KIS', score: 80, grade: 'A' },
            { subject: 'MAT', score: 85, grade: 'A' },
          ],
        },
      ];

      const result = service.formatResultsForUssd(examResults);

      expect(result).toContain('END Exam Results');
      expect(result).toContain('John Doe');
      expect(result).toContain('End Term 1');
      expect(result).toContain('ENG: 75 (A-)');
    });

    it('should return not available message for empty exam results', () => {
      const result = service.formatResultsForUssd([]);

      expect(result).toBe('END Exam Results not available at the moment.');
    });
  });
});
