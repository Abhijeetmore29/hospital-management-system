const express = require('express');
const {
  createAppointment,
  getAppointments,
  getTodaysAppointments,
  updateAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/today', getTodaysAppointments);
router.get('/', getAppointments);
router.post('/', authorizeRoles('doctor', 'staff', 'admin'), createAppointment);
router.patch('/:id', authorizeRoles('doctor'), updateAppointment);

module.exports = router;
