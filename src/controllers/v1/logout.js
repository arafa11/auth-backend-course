import { Router } from "express";
import models from '../../models';
import requiresAuth from '../../middleware/requiresAuth';
import runAsyncWrapper from '../../utils/runAsyncWrapper';

const router = Router();
const { User, RefreshToken } = models;

router.post('/logout', requiresAuth(),runAsyncWrapper(async (req, res) => {
  const { jwt } = req.body;
  const user = await User.findOne({ where: { email: jwt.email }, include: RefreshToken });
  user.RefreshToken.token = null;
  user.RefreshToken.save();
  return res.status(200).send({ success: treu, message: "successfully logged out" });
}));

export default router;