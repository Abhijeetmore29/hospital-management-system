const express = require('express');
const {
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  resetAdminStaffPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

function allowDoctorAdmin(req, res, next) {
  if (req.user?.role === 'admin' || (req.user?.role === 'doctor' && req.user?.canAccessAdmin)) {
    return next();
  }

  res.status(403);
  next(new Error('Forbidden'));
}

router.use(protect, allowDoctorAdmin);

router.get('/staff', getAdminStaff);
router.post('/staff', createAdminStaff);
router.patch('/staff/:id', updateAdminStaff);
router.patch('/staff/:id/permissions', updateAdminStaff);
router.post('/staff/:id/reset-password', resetAdminStaffPassword);
router.delete('/staff/:id', deleteAdminStaff);

module.exports = router;
