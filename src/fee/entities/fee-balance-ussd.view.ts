import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'fee_balance_ussd',
  expression: `
    SELECT 
      fee_payments.adm AS adm,
      fee_payments.student_name AS student_name,
      fee_payments.fee_balance AS fee_balance,
      fee_payments.class AS class,
      CONCAT('+', student_contacts.parent_phone1) AS parent_phone1,
      CONCAT('+', student_contacts.parent_phone2) AS parent_phone2,
      student_contacts.school_id AS school_id,
      fee_payments.date_posted AS date_posted
    FROM fee_payments 
    JOIN student_contacts ON student_contacts.school_id = fee_payments.school_id 
      AND fee_payments.adm = student_contacts.adm
  `,
})
export class FeeBalanceUssdView {
  @ViewColumn()
  adm: number;

  @ViewColumn({ name: 'student_name' })
  studentName: string;

  @ViewColumn({ name: 'fee_balance' })
  feeBalance: number;

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
