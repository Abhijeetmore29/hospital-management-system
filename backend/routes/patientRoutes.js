const express = require('express');
const {
  createPatient,
  getPatients,
  getAdmittedPatients,
  getWaitingOpdPatients,
  getPatientById,
  updatePatient,
  addPrescription,
  dischargePatient
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getPatients);
router.get('/admitted', getAdmittedPatients);
router.get('/waiting-opd', getWaitingOpdPatients);
router.post('/', authorizeRoles('doctor', 'staff', 'admin'), createPatient);
router.get('/:id', getPatientById);
router.patch('/:id', authorizeRoles('doctor', 'staff', 'admin'), updatePatient);
router.post('/:id/prescription', authorizeRoles('doctor'), addPrescription);
router.post('/:id/discharge', authorizeRoles('doctor', 'staff', 'admin'), dischargePatient);

module.exports = router;
