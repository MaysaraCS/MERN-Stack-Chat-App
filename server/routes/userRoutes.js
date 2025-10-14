import express from 'express';
import { checkAuth, login, signUp, updateProfile } from '../controllers/userController';
import { protectRoute } from '../middleware/auth';

const userRouter = express.Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.put('/update-profile',protectRoute, updateProfile);
userRouter.get('/check',protectRoute, checkAuth);

export default userRouter;