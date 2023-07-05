import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  listUserProfiles
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.route('/logout').post(protect, logoutUser);

router.route('/register').post(registerUser);
router.route('/profile').get(protect,getUserProfile);
router.route('/update').put(protect,updateUserProfile);
router.route('/delete').post(protect, deleteUserProfile);
router.route('/list').post(protect, listUserProfiles);

export default router;