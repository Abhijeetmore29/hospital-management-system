import { useNavigate } from 'react-router-dom';
import { PatientFormModal } from '../components/PatientFormModal';

export function AddPatient() {
  const navigate = useNavigate();

  return (
    <PatientFormModal
      open
      onClose={() => navigate('/staff/dashboard')}
      onSaved={() => navigate('/patients')}
    />
  );
}

