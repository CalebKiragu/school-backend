import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'all_contacts_ussd',
  expression: `
    SELECT 
      stakeholders.name AS name,
      CONCAT('+', stakeholders.phone1) AS phone1,
      CONCAT('+', stakeholders.phone2) AS phone2,
      stakeholders.category AS category,
      stakeholders.school_id AS school_id,
      user.school_name AS school_name
    FROM user 
    JOIN stakeholders ON user.school_id = stakeholders.school_id 
    WHERE stakeholders.phone1 <> 0
    
    UNION ALL
    
    SELECT 
      student_contacts.student_name AS name,
      CONCAT('+', student_contacts.parent_phone1) AS phone1,
      CONCAT('+', student_contacts.parent_phone2) AS phone2,
      student_contacts.stream AS category,
      student_contacts.school_id AS school_id,
      user.school_name AS school_name
    FROM user 
    JOIN student_contacts ON user.school_id = student_contacts.school_id 
    WHERE student_contacts.parent_phone1 <> 0
  `,
})
export class AllContactsUssdView {
  @ViewColumn()
  name: string;

  @ViewColumn()
  phone1: string;

  @ViewColumn()
  phone2: string;

  @ViewColumn()
  category: string;

  @ViewColumn({ name: 'school_id' })
  schoolId: number;

  @ViewColumn({ name: 'school_name' })
  schoolName: string;
}
