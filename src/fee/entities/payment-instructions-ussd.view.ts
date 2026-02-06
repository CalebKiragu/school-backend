import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'payment_instructions_ussd',
  expression: `
    SELECT 
      payment_instructions.description AS description,
      all_contacts_ussd.phone1 AS phone1,
      all_contacts_ussd.phone2 AS phone2,
      all_contacts_ussd.school_name AS school_name,
      payment_instructions.school_id AS school_id
    FROM payment_instructions 
    JOIN all_contacts_ussd ON payment_instructions.school_id = all_contacts_ussd.school_id
  `,
})
export class PaymentInstructionsUssdView {
  @ViewColumn()
  description: string;

  @ViewColumn()
  phone1: string;

  @ViewColumn()
  phone2: string;

  @ViewColumn({ name: 'school_name' })
  schoolName: string;

  @ViewColumn({ name: 'school_id' })
  schoolId: number;
}
