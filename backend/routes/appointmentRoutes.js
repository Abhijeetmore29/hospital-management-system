const express = require('express');
const {
  createAppointment,
  getPublicAppointmentById,
  getAppointments,
  getTodaysAppointments,
  getOpdQueue,
  updateAppointment,
  reassignAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/public', createAppointment);
router.get('/public/:id', getPublicAppointmentById);
router.use(protect);
router.get('/opd-queue', getOpdQueue);
router.get('/today', getTodaysAppointments);
router.get('/', getAppointments);
router.post('/', authorizeRoles('doctor', 'staff', 'admin'), createAppointment);
router.patch('/:id', authorizeRoles('doctor'), updateAppointment);
router.patch('/:id/reassign', authorizeRoles('doctor', 'staff', 'admin'), reassignAppointment);

module.exports = router;
