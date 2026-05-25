import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { DoctorLogin } from './pages/DoctorLogin';
import { StaffLogin } from './pages/StaffLogin';
import { Register } from './pages/Register';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorAppointments } from './pages/DoctorAppointments';
import { CreateAppointment } from './pages/doctor/CreateAppointment';
import { ConsultationPage } from './pages/ConsultationPage';
import OPDQueuePage from './pages/OPDQueuePage';
import IPDPage from './pages/doctor/IPDPage';
import LaboratoryPage from './pages/doctor/LaboratoryPage';
import BillingPage from './pages/doctor/BillingPage';
import { BillingDetails } from './pages/doctor/BillingDetails';
import { CreateBilling } from './pages/doctor/CreateBilling';
import PatientsPage from './pages/doctor/PatientsPage';
import OperationsPage from './pages/doctor/OperationsPage';
import CreateOperation from './pages/doctor/CreateOperation';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorAdminPage from './pages/doctor/DoctorAdminPage';
import RegistrationPage from './pages/RegistrationPage';
import DoctorAdminGate from './components/DoctorAdminGate';
import OPDWaitingPage from './pages/doctor/OPDWaitingPage';
import DoctorLayout from './components/DoctorLayout';
import StaffLayout from './components/StaffLayout';
import { AddPatient } from './pages/AddPatient';
import { PatientList } from './pages/PatientList';
import { PatientProfile } from './pages/PatientProfile';
import { DoctorPatientDetails } from './pages/doctor/DoctorPatientDetails';
import { AppointmentList } from './pages/AppointmentList';
import { PrescriptionEditor } from './pages/PrescriptionEditor';
import { PrintPrescription } from './pages/PrintPrescription';
import { MedicalImaging } from './pages/MedicalImaging';
import { PatientImagingPortal } from './pages/PatientImagingPortal';
import { StaffPayments } from './pages/StaffPayments';
import { StaffProfile } from './pages/StaffProfile';
import { DoctorAdmittedPatients } from './pages/DoctorAdmittedPatients';
import { Operations } from './pages/Operations';
import { DischargePatient } from './pages/DischargePatient';
import { OperationPrint } from './pages/OperationPrint';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRedirect } from './components/RoleRedirect';
import { LandingPage } from './pages/LandingPage';
import { AppointmentConfirmationPage } from './pages/AppointmentConfirmationPage';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();
  const fallbackPath =
    isAuthenticated && user
      ? user.role === 'doctor'
        ? '/doctor/dashboard'
        : user.role === 'admin'
          ? '/medical-imaging'
          : '/staff/dashboard'
      : '/login';

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/appointment/confirmation" element={<AppointmentConfirmationPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute allowedRoles={['doctor']} layout="plain" />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="billing/view/:billingId" element={<BillingDetails />} />
          <Route path="billing/create/:appointmentId" element={<CreateBilling />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="appointments/create" element={<CreateAppointment />} />
          <Route path="consult/:appointmentId" element={<ConsultationPage />} />
          <Route path="opd-queue" element={<OPDQueuePage />} />
          <Route path="ipd" element={<IPDPage />} />
          <Route path="laboratory" element={<LaboratoryPage />} />
          <Route path="registration" element={<RegistrationPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:patientId/details" element={<DoctorPatientDetails />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="operations/create" element={<CreateOperation />} />
          <Route path="admin" element={<DoctorAdminGate><DoctorAdminPage /></DoctorAdminGate>} />
          <Route path="opd-waiting" element={<OPDWaitingPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route path="/prescriptions/:patientId" element={<PrescriptionEditor />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['doctor', 'staff', 'admin']} />}>
        <Route path="/dashboard/*" element={<RoleRedirect />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['staff']} layout="plain" />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard compact />} />
          <Route path="registration" element={<RegistrationPage compact />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="opd-queue" element={<OPDQueuePage compact />} />
          <Route path="ipd" element={<IPDPage compact />} />
          <Route path="laboratory" element={<LaboratoryPage compact />} />
          <Route path="billing" element={<BillingPage compact />} />
          <Route path="patients" element={<PatientsPage compact />} />
          <Route path="operations" element={<OperationsPage compact />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route path="/patients/add" element={<AddPatient />} />
        <Route path="/payments" element={<StaffPayments />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['doctor', 'staff', 'admin']} />}>
        <Route path="/medical-imaging" element={<MedicalImaging />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:patientId/profile" element={<PatientProfile />} />
        <Route path="/patients/:patientId/discharge" element={<DischargePatient />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/prescriptions/:appointmentId/print" element={<PrintPrescription />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/operations/:operationId/print" element={<OperationPrint />} />
      </Route>
      <Route path="/medical-imaging/access" element={<PatientImagingPortal />} />
      <Route path="*" element={<Navigate to={fallbackPath} replace />} />
    </Routes>
  );
}

export default AppRoutes;
