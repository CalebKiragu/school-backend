import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'fee_structure_ussd',
  expression: `
    SELECT 
      fee_structure.class AS class,
      fee_structure.term1 AS term1,
      fee_structure.term2 AS term2,
      fee_structure.term3 AS term3,
      fee_structure.total AS total,
      fee_structure.date_posted AS date_posted,
      all_contacts_ussd.phone1 AS phone1,
      all_contacts_ussd.phone2 AS phone2,
      fee_structure.school_id AS school_id,
      all_contacts_ussd.school_name AS school_name
    FROM fee_structure 
    JOIN all_contacts_ussd ON fee_structure.school_id = all_contacts_ussd.school_id
  `,
})
export class FeeStructureUssdView {
  @ViewColumn()
  class: string;

  @ViewColumn()
  term1: number;

  @ViewColumn()
  term2: number;

  @ViewColumn()
  term3: number;

  @ViewColumn()
  total: number;

  @ViewColumn({ name: 'date_posted' })
  datePosted: Date;

  @ViewColumn()
  phone1: string;

  @ViewColumn()
  phone2: string;

  @ViewColumn({ name: 'school_id' })
  schoolId: number;

  @ViewColumn({ name: 'school_name' })
  schoolName: string;
}
