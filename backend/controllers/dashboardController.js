const asyncHandler = require('../utils/asyncHandler');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Operation = require('../models/Operation');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const appointmentQuery = {
    appointmentDate: { $gte: start, $lte: end }
  };

  if (req.user.role === 'doctor') {
    appointmentQuery.doctor = req.user._id;
  }

  const patientFilter = req.user.role === 'doctor' ? { assignedDoctor: req.user._id } : {};

  const [totalPatients, opdPatients, ipdPatients, admittedPatients, todayAppointments, completedRecords, pendingRecords, totalOperations, paymentsSummary] = await Promise.all([
    Patient.countDocuments(patientFilter),
    Patient.countDocuments({ ...patientFilter, type: 'OPD' }),
    Patient.countDocuments({ ...patientFilter, type: 'IPD' }),
    Patient.countDocuments({ ...patientFilter, type: 'IPD', status: 'Admitted' }),
    Appointment.countDocuments(appointmentQuery),
    Patient.countDocuments({ ...patientFilter, status: 'Completed' }),
    Patient.countDocuments({ ...patientFilter, status: 'Pending' }),
    Operation.countDocuments(req.user.role === 'doctor' ? { doctor: req.user._id } : {}),
    Payment.aggregate([
      { $match: req.user.role === 'doctor' ? { doctor: req.user._id } : {} },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ])
  ]);

  res.json({
    totalPatients,
    opdPatients,
    ipdPatients,
    admittedPatients,
    todayAppointments,
    completedRecords,
    pendingRecords,
    totalOperations,
    totalRevenue: paymentsSummary[0]?.totalRevenue || 0,
    totalTransactions: paymentsSummary[0]?.totalTransactions || 0
  });
});

module.exports = { getDashboardSummary };
