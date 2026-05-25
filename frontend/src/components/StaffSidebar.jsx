import { DoctorSidebar } from './DoctorSidebar';

const items = [
  ['Dashboard', '/staff/dashboard'],
  ['Registration', '/staff/registration'],
  ['OPD Queue', '/staff/opd-queue'],
  ['IPD', '/staff/ipd'],
  ['Laboratory', '/staff/laboratory'],
  ['Billing', '/staff/billing'],
  ['Patients', '/staff/patients'],
  ['Operations', '/staff/operations']
];

export function StaffSidebar() {
  return <DoctorSidebar items={items} subtitle="Staff Portal" />;
}
