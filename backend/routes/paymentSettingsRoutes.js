const express = require('express');
const {
  listPaymentSettings,
  upsertPaymentSettings
} = require('../controllers/paymentSettingsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', authorizeRoles('doctor', 'staff', 'admin'), listPaymentSettings);
router.post('/', authorizeRoles('admin', 'doctor'), upsertPaymentSettings);

module.exports = router;
