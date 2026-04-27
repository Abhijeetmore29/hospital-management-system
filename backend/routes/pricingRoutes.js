const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getMyPricing, upsertMyPricing, getAllDoctorPricing } = require('../controllers/pricingController');

const router = express.Router();

router.use(protect);
router.get('/mine', authorizeRoles('doctor'), getMyPricing);
router.post('/mine', authorizeRoles('doctor'), upsertMyPricing);
router.get('/', authorizeRoles('doctor', 'staff'), getAllDoctorPricing);

module.exports = router;

