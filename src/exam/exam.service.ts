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

    // Parent-student mapping for demo data
    const parentStudentMap: Record<string, ExamResultDto[]> = {
      '+254724027217': [
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
      ],
      '+254728986084': [
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
      ],
      '+254701234567': [
        {
          adm: '12077',
          studentName: 'XAVIER KELVIN',
          examName: 'End of Term 1 Exams',
          results: 'ENG:65KIS:70MAT:72BIO:68PHY:75CHEM:71CRE:69AGR:73',
          class: 'FORM 1',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:65KIS:70MAT:72BIO:68PHY:75CHEM:71CRE:69AGR:73',
          ),
          meanGrade: 'B-',
          overallPosition: '12',
          totalStudents: 45,
        },
      ],
      '+254702345678': [
        {
          adm: '11586',
          studentName: 'DAVID BWIRE',
          examName: 'End of Term 1 Exams',
          results: 'ENG:88KIS:85MAT:92BIO:89PHY:91CHEM:90GEO:82COMP:87',
          class: 'FORM 4',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:88KIS:85MAT:92BIO:89PHY:91CHEM:90GEO:82COMP:87',
          ),
          meanGrade: 'A',
          overallPosition: '1',
          totalStudents: 48,
        },
      ],
      '+254703456789': [
        {
          adm: '12047',
          studentName: 'DYBAL ANGOYA',
          examName: 'End of Term 1 Exams',
          results: 'ENG:72KIS:68MAT:75BIO:70PHY:78CHEM:74CRE:71AGR:69',
          class: 'FORM 2',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:72KIS:68MAT:75BIO:70PHY:78CHEM:74CRE:71AGR:69',
          ),
          meanGrade: 'B',
          overallPosition: '8',
          totalStudents: 49,
        },
      ],
      '+254704567890': [
        {
          adm: '12668',
          studentName: 'RAYMOND MANDOLI',
          examName: 'End of Term 1 Exams',
          results: 'ENG:58KIS:62MAT:65BIO:60PHY:68CHEM:63CRE:59AGR:61',
          class: 'FORM 1',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:58KIS:62MAT:65BIO:60PHY:68CHEM:63CRE:59AGR:61',
          ),
          meanGrade: 'C+',
          overallPosition: '25',
          totalStudents: 45,
        },
      ],
      '+254705678901': [
        {
          adm: '11569',
          studentName: 'WILLINGTONE OJAMBO',
          examName: 'End of Term 1 Exams',
          results: 'ENG:80KIS:77MAT:83BIO:79PHY:85CHEM:82GEO:75COMP:81',
          class: 'FORM 3',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:80KIS:77MAT:83BIO:79PHY:85CHEM:82GEO:75COMP:81',
          ),
          meanGrade: 'A-',
          overallPosition: '4',
          totalStudents: 52,
        },
      ],
      '+254706789012': [
        {
          adm: '12643',
          studentName: 'ALLAN SEMBU',
          examName: 'End of Term 1 Exams',
          results: 'ENG:70KIS:73MAT:78BIO:72PHY:76CHEM:75CRE:68AGR:74',
          class: 'FORM 2',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:70KIS:73MAT:78BIO:72PHY:76CHEM:75CRE:68AGR:74',
          ),
          meanGrade: 'B',
          overallPosition: '10',
          totalStudents: 49,
        },
      ],
      '+254707890123': [
        {
          adm: '12701',
          studentName: 'DEOGRACIOUS WANDO',
          examName: 'End of Term 1 Exams',
          results: 'ENG:62KIS:65MAT:68BIO:64PHY:70CHEM:67CRE:63AGR:66',
          class: 'FORM 1',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:62KIS:65MAT:68BIO:64PHY:70CHEM:67CRE:63AGR:66',
          ),
          meanGrade: 'C+',
          overallPosition: '20',
          totalStudents: 45,
        },
      ],
      '+254708901234': [
        {
          adm: '11831',
          studentName: 'AINE WESONGA',
          examName: 'End of Term 1 Exams',
          results: 'ENG:85KIS:82MAT:89BIO:86PHY:88CHEM:87GEO:80COMP:85',
          class: 'FORM 4',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:85KIS:82MAT:89BIO:86PHY:88CHEM:87GEO:80COMP:85',
          ),
          meanGrade: 'A-',
          overallPosition: '3',
          totalStudents: 48,
        },
      ],
      '+254709012345': [
        {
          adm: '11168',
          studentName: 'VINCENT OWEN',
          examName: 'End of Term 1 Exams',
          results: 'ENG:75KIS:78MAT:81BIO:76PHY:80CHEM:79GEO:72COMP:77',
          class: 'FORM 3',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:75KIS:78MAT:81BIO:76PHY:80CHEM:79GEO:72COMP:77',
          ),
          meanGrade: 'B+',
          overallPosition: '7',
          totalStudents: 52,
        },
      ],
      '+254710123456': [
        {
          adm: '11789',
          studentName: 'PRINCE JOEL',
          examName: 'End of Term 1 Exams',
          results: 'ENG:68KIS:71MAT:74BIO:69PHY:73CHEM:72CRE:67AGR:70',
          class: 'FORM 2',
          datePosted: new Date('2026-01-15'),
          formattedResults: this.parseResultString(
            'ENG:68KIS:71MAT:74BIO:69PHY:73CHEM:72CRE:67AGR:70',
          ),
          meanGrade: 'B-',
          overallPosition: '15',
          totalStudents: 49,
        },
      ],
    };

    // All students data for admin users
    const allStudentsData = [
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
      {
        adm: '12077',
        studentName: 'XAVIER KELVIN',
        examName: 'End of Term 1 Exams',
        results: 'ENG:65KIS:70MAT:72BIO:68PHY:75CHEM:71CRE:69AGR:73',
        class: 'FORM 1',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:65KIS:70MAT:72BIO:68PHY:75CHEM:71CRE:69AGR:73',
        ),
        meanGrade: 'B-',
        overallPosition: '12',
        totalStudents: 45,
      },
      {
        adm: '11586',
        studentName: 'DAVID BWIRE',
        examName: 'End of Term 1 Exams',
        results: 'ENG:88KIS:85MAT:92BIO:89PHY:91CHEM:90GEO:82COMP:87',
        class: 'FORM 4',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:88KIS:85MAT:92BIO:89PHY:91CHEM:90GEO:82COMP:87',
        ),
        meanGrade: 'A',
        overallPosition: '1',
        totalStudents: 48,
      },
      {
        adm: '12047',
        studentName: 'DYBAL ANGOYA',
        examName: 'End of Term 1 Exams',
        results: 'ENG:72KIS:68MAT:75BIO:70PHY:78CHEM:74CRE:71AGR:69',
        class: 'FORM 2',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:72KIS:68MAT:75BIO:70PHY:78CHEM:74CRE:71AGR:69',
        ),
        meanGrade: 'B',
        overallPosition: '8',
        totalStudents: 49,
      },
      {
        adm: '12668',
        studentName: 'RAYMOND MANDOLI',
        examName: 'End of Term 1 Exams',
        results: 'ENG:58KIS:62MAT:65BIO:60PHY:68CHEM:63CRE:59AGR:61',
        class: 'FORM 1',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:58KIS:62MAT:65BIO:60PHY:68CHEM:63CRE:59AGR:61',
        ),
        meanGrade: 'C+',
        overallPosition: '25',
        totalStudents: 45,
      },
      {
        adm: '11569',
        studentName: 'WILLINGTONE OJAMBO',
        examName: 'End of Term 1 Exams',
        results: 'ENG:80KIS:77MAT:83BIO:79PHY:85CHEM:82GEO:75COMP:81',
        class: 'FORM 3',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:80KIS:77MAT:83BIO:79PHY:85CHEM:82GEO:75COMP:81',
        ),
        meanGrade: 'A-',
        overallPosition: '4',
        totalStudents: 52,
      },
      {
        adm: '12643',
        studentName: 'ALLAN SEMBU',
        examName: 'End of Term 1 Exams',
        results: 'ENG:70KIS:73MAT:78BIO:72PHY:76CHEM:75CRE:68AGR:74',
        class: 'FORM 2',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:70KIS:73MAT:78BIO:72PHY:76CHEM:75CRE:68AGR:74',
        ),
        meanGrade: 'B',
        overallPosition: '10',
        totalStudents: 49,
      },
      {
        adm: '12701',
        studentName: 'DEOGRACIOUS WANDO',
        examName: 'End of Term 1 Exams',
        results: 'ENG:62KIS:65MAT:68BIO:64PHY:70CHEM:67CRE:63AGR:66',
        class: 'FORM 1',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:62KIS:65MAT:68BIO:64PHY:70CHEM:67CRE:63AGR:66',
        ),
        meanGrade: 'C+',
        overallPosition: '20',
        totalStudents: 45,
      },
      {
        adm: '11831',
        studentName: 'AINE WESONGA',
        examName: 'End of Term 1 Exams',
        results: 'ENG:85KIS:82MAT:89BIO:86PHY:88CHEM:87GEO:80COMP:85',
        class: 'FORM 4',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:85KIS:82MAT:89BIO:86PHY:88CHEM:87GEO:80COMP:85',
        ),
        meanGrade: 'A-',
        overallPosition: '3',
        totalStudents: 48,
      },
      {
        adm: '11168',
        studentName: 'VINCENT OWEN',
        examName: 'End of Term 1 Exams',
        results: 'ENG:75KIS:78MAT:81BIO:76PHY:80CHEM:79GEO:72COMP:77',
        class: 'FORM 3',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:75KIS:78MAT:81BIO:76PHY:80CHEM:79GEO:72COMP:77',
        ),
        meanGrade: 'B+',
        overallPosition: '7',
        totalStudents: 52,
      },
      {
        adm: '11789',
        studentName: 'PRINCE JOEL',
        examName: 'End of Term 1 Exams',
        results: 'ENG:68KIS:71MAT:74BIO:69PHY:73CHEM:72CRE:67AGR:70',
        class: 'FORM 2',
        datePosted: new Date('2026-01-15'),
        formattedResults: this.parseResultString(
          'ENG:68KIS:71MAT:74BIO:69PHY:73CHEM:72CRE:67AGR:70',
        ),
        meanGrade: 'B-',
        overallPosition: '15',
        totalStudents: 49,
      },
    ];

    // Admin phones - return all students
    const adminPhones = [
      '+254720613991', // Principal
      '+254748944951', // Wandera (Admin)
      '+254742218359', // Admin User
    ];

    if (adminPhones.includes(phoneNumber)) {
      return allStudentsData;
    }

    // Parent phones - return only their student(s)
    if (parentStudentMap[phoneNumber]) {
      return parentStudentMap[phoneNumber];
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
      return 'END Exam Results not available at the moment.';
    }

    if (results.length === 1) {
      // Single student - show detailed results
      const result = results[0];
      if (!result) {
        return 'END Exam Results not available.';
      }
      const date = new Date(result.datePosted);
      const formattedDate = date.toLocaleDateString('en-GB');

      // Format subjects with grades
      let subjectsText = '';
      result.formattedResults.forEach((subject, index) => {
        subjectsText += `${subject.subject}: ${subject.score} (${subject.grade})`;
        if (index < result.formattedResults.length - 1) {
          subjectsText += '\n';
        }
      });

      return (
        `END Exam Results\n\n` +
        `Student: ${result.studentName}\n` +
        `Exam: ${result.examName}\n` +
        `Class: ${result.class}\n` +
        `Date: ${formattedDate}\n\n` +
        `${subjectsText}`
      );
    }

    // Multiple students - this shouldn't happen after student selection
    let response = 'CON ';
    results.forEach((result) => {
      response += `${result.studentName} - ${result.examName}\n`;
    });
    response += '0:Back';

    return response;
  }
}
