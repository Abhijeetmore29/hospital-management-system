const express = require('express');
const {
  listBillings,
  createBilling,
  getBillingById,
  updateBilling,
  markBillingPaid
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', authorizeRoles('doctor', 'staff', 'admin'), listBillings);
router.post('/', authorizeRoles('doctor', 'staff', 'admin'), createBilling);
router.get('/:id', authorizeRoles('doctor', 'staff', 'admin'), getBillingById);
router.patch('/:id', authorizeRoles('doctor', 'staff', 'admin'), updateBilling);
router.patch('/:id/paid', authorizeRoles('doctor', 'staff', 'admin'), markBillingPaid);

module.exports = router;
