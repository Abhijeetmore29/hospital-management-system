const express = require('express');
const { loginUser, logoutUser, registerUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
