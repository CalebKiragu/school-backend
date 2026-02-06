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
}

export interface SubjectResult {
  subject: string;
  score: number;
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
      console.log('Database error:', error.message);
    }

    // Demo data fallback
    const demoData = [
      {
        adm: '3262',
        studentName: 'MARTIN WAMALWA',
        examName: 'CAT1',
        results: 'ENG:45KIS:66MAT:76BIO:23PHY:66CHEM:76CRE:78AGR:66ENTRY:8',
        class: 'FORM1',
        datePosted: new Date('2019-02-24'),
        formattedResults: this.parseResultString(
          'ENG:45KIS:66MAT:76BIO:23PHY:66CHEM:76CRE:78AGR:66ENTRY:8',
        ),
      },
      {
        adm: '3270',
        studentName: 'KEVIN OMONDI',
        examName: 'CAT1',
        results: 'ENG:70KIS:87MAT:76BIO:70PHY:87CHEM:76GEO:56COMP:76ENTRY:8',
        class: 'FORM1',
        datePosted: new Date('2019-02-24'),
        formattedResults: this.parseResultString(
          'ENG:70KIS:87MAT:76BIO:70PHY:87CHEM:76GEO:56COMP:76ENTRY:8',
        ),
      },
    ];

    // Return demo data for demo phone numbers
    const demoPhones = [
      '+254724027217',
      '+254728986084',
      '+254715648891',
      '+254714732457',
      '+254123456789',
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
    let match;

    while ((match = regex.exec(resultString)) !== null) {
      subjects.push({
        subject: match[1],
        score: parseInt(match[2]),
      });
    }

    return subjects;
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
