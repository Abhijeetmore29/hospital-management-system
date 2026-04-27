const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createPayment, getPayments, getPaymentSummary } = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);
router.get('/summary', authorizeRoles('doctor', 'staff'), getPaymentSummary);
router.get('/', authorizeRoles('doctor', 'staff'), getPayments);
router.post('/', authorizeRoles('staff'), createPayment);

module.exports = router;

