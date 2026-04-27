const express = require('express');
const { getDoctors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/doctors', authorizeRoles('doctor', 'staff'), getDoctors);

module.exports = router;

