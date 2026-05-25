const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getConsultationByAppointment, updateConsultation } = require('../controllers/appointmentController');

const router = express.Router();

router.use(protect);
router.get('/:appointmentId', authorizeRoles('doctor', 'staff', 'admin'), getConsultationByAppointment);
router.patch('/:appointmentId', authorizeRoles('doctor', 'staff', 'admin'), updateConsultation);

module.exports = router;
