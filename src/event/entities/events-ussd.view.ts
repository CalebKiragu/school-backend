import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'events_ussd',
  expression: `
    SELECT 
      upcoming_events.event_name AS event_name,
      upcoming_events.event_details AS event_details,
      upcoming_events.start_date AS start_date,
      upcoming_events.end_date AS end_date,
      all_contacts_ussd.phone1 AS phone1,
      all_contacts_ussd.phone2 AS phone2,
      upcoming_events.school_id AS school_id,
      all_contacts_ussd.school_name AS school_name
    FROM upcoming_events 
    JOIN all_contacts_ussd ON upcoming_events.school_id = all_contacts_ussd.school_id
  `,
})
export class EventsUssdView {
  @ViewColumn({ name: 'event_name' })
  eventName: string;

  @ViewColumn({ name: 'event_details' })
  eventDetails: string;

  @ViewColumn({ name: 'start_date' })
  startDate: Date;

  @ViewColumn({ name: 'end_date' })
  endDate: Date;

  @ViewColumn()
  phone1: string;

  @ViewColumn()
  phone2: string;

  @ViewColumn({ name: 'school_id' })
  schoolId: string;

  @ViewColumn({ name: 'school_name' })
  schoolName: string;
}
