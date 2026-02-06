import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'exam_results_ussd',
  expression: `
    SELECT 
      exam_results.adm AS adm,
      exam_results.student_name AS student_name,
      exam_results.exam_name AS exam_name,
      exam_results.results AS results,
      student_contacts.class AS class,
      CONCAT('+', student_contacts.parent_phone1) AS parent_phone1,
      CONCAT('+', student_contacts.parent_phone2) AS parent_phone2,
      student_contacts.school_id AS school_id,
      exam_results.date_posted AS date_posted
    FROM exam_results 
    JOIN student_contacts ON student_contacts.school_id = exam_results.school_id 
      AND exam_results.adm = student_contacts.adm
  `,
})
export class ExamResultsUssdView {
  @ViewColumn()
  adm: string;

  @ViewColumn({ name: 'student_name' })
  studentName: string;

  @ViewColumn({ name: 'exam_name' })
  examName: string;

  @ViewColumn()
  results: string;

  @ViewColumn()
  class: string;

  @ViewColumn({ name: 'parent_phone1' })
  parentPhone1: string;

  @ViewColumn({ name: 'parent_phone2' })
  parentPhone2: string;

  @ViewColumn({ name: 'school_id' })
  schoolId: number;

  @ViewColumn({ name: 'date_posted' })
  datePosted: Date;
}
