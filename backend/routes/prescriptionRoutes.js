const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const Appointment = require('../models/Appointment');

const router = express.Router();

router.use(protect);

router.get('/:appointmentId/print', authorizeRoles('doctor', 'staff', 'admin'), async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patient', 'name age gender phone disease type status diagnosis doctorPrescription requiredTests appointmentDate')
      .populate('doctor', 'name email role signature');

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
