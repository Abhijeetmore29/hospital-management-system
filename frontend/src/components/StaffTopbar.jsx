import { DoctorTopbar } from './DoctorTopbar';

export function StaffTopbar() {
  return <DoctorTopbar title="Staff Dashboard" subtitle="Welcome," logoutTo="/staff/login" extraLogoutKeys={['staffToken']} />;
}
