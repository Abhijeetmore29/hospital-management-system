import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AddPatient } from './pages/AddPatient';
import { PatientList } from './pages/PatientList';
import { AppointmentList } from './pages/AppointmentList';
import { PrescriptionEditor } from './pages/PrescriptionEditor';
import { PrintablePrescription } from './pages/PrintablePrescription';
import { DoctorBilling } from './pages/DoctorBilling';
import { StaffPayments } from './pages/StaffPayments';
import { DoctorAdmittedPatients } from './pages/DoctorAdmittedPatients';
import { Operations } from './pages/Operations';
import { DischargePatient } from './pages/DischargePatient';
import { OperationPrint } from './pages/OperationPrint';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRedirect } from './components/RoleRedirect';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RoleRedirect />} />
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/billing" element={<DoctorBilling />} />
        <Route path="/doctor/admitted-patients" element={<DoctorAdmittedPatients />} />
        <Route path="/prescriptions/:patientId" element={<PrescriptionEditor />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/patients/add" element={<AddPatient />} />
        <Route path="/payments" element={<StaffPayments />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['doctor', 'staff']} />}>
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:patientId/discharge" element={<DischargePatient />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/prescriptions/:patientId/print" element={<PrintablePrescription />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/operations/:operationId/print" element={<OperationPrint />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? user?.role === 'doctor'
                  ? '/doctor/dashboard'
                  : '/staff/dashboard'
                : '/login'
            }
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
