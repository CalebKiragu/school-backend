import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResultsUssdView } from './entities/exam-results-ussd.view';

export interface ExamResultDto {
  adm: string;
  studentName: string;
  examName: string;
  results: string;
  class: string;
  datePosted: Date;
  formattedResults: SubjectResult[];
  meanGrade?: string;
  overallPosition?: string;
  totalStudents?: number;
}

export interface SubjectResult {
  subject: string;
  score: number;
  grade: string;
}

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamResultsUssdView)
    private readonly examResultsRepository: Repository<ExamResultsUssdView>,
  ) {}

  async getExamResults(phoneNumber: string): Promise<ExamResultDto[]> {
    try {
      const results = await this.examResultsRepository.find({
        where: [{ parentPhone1: phoneNumber }, { parentPhone2: phoneNumber }],
      });

      if (results.length > 0) {
        return results.map((result) => ({
          adm: result.adm,
          studentName: result.studentName,
          examName: result.examName,
          results: result.results,
          class: result.class,
          datePosted: result.datePosted,
          formattedResults: this.parseResultString(result.results),
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('Database error:', errorMessage);
    }

    // Demo data fallback with grades and positioning
    const demoData = [
      {
        adm: '58641',
        studentName: 'MARTIN WAMALWA',
        examName: 'End of Term 1 Exams',
        results: 'ENG:78KIS:72MAT:85BIO:68PHY:82CHEM:79CRE:75AGR:71',
        class: 'FORM 2',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:78KIS:72MAT:85BIO:68PHY:82CHEM:79CRE:75AGR:71',
        ),
        meanGrade: 'B+',
        overallPosition: '3',
        totalStudents: 49,
      },
      {
        adm: '58642',
        studentName: 'KEVIN OMONDI',
        examName: 'End of Term 1 Exams',
        results: 'ENG:82KIS:79MAT:88BIO:85PHY:90CHEM:87GEO:76COMP:84',
        class: 'FORM 3',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:82KIS:79MAT:88BIO:85PHY:90CHEM:87GEO:76COMP:84',
        ),
        meanGrade: 'A-',
        overallPosition: '2',
        totalStudents: 52,
      },
    ];

    // Return demo data for demo phone numbers
    const demoPhones = [
      '+254724027217',
      '+254728986084',
      '+254715648891',
      '+254714732457',
      '+254123456789',
      '+254748944951', // Admin phone
    ];
    if (demoPhones.includes(phoneNumber)) {
      return demoData;
    }

    return [];
  }

  parseResultString(resultString: string): SubjectResult[] {
    // Parse format like "ENG:45KIS:66MAT:76BIO:23PHY:66CHEM:76CRE:78AGR:66ENTRY:8"
    const subjects: SubjectResult[] = [];
    const regex = /([A-Z]+):(\d+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(resultString)) !== null) {
      const scoreStr = match[2];
      if (scoreStr) {
        const score = parseInt(scoreStr, 10);
        const subjectName = match[1];
        if (subjectName) {
          subjects.push({
            subject: subjectName,
            score: score,
            grade: this.calculateGrade(score),
          });
        }
      }
    }

    return subjects;
  }

  calculateGrade(score: number): string {
    if (score >= 80) return 'A';
    if (score >= 75) return 'A-';
    if (score >= 70) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 60) return 'B-';
    if (score >= 55) return 'C+';
    if (score >= 50) return 'C';
    if (score >= 45) return 'C-';
    if (score >= 40) return 'D+';
    if (score >= 35) return 'D';
    if (score >= 30) return 'D-';
    return 'E';
  }

  formatResultsForUssd(results: ExamResultDto[]): string {
    if (results.length === 0) {
      return 'CON Exam Results not available at the moment\n0:Back';
    }

    let response = 'CON ';
    results.forEach((result) => {
      const date = new Date(result.datePosted);
      const formattedDate = date.toLocaleDateString('en-GB');
      response += `Results for ${result.studentName} for ${result.examName} as at ${formattedDate}\n\n${result.results}\n\n`;
    });
    response += '0:Main menu';

    return response;
  }
}
