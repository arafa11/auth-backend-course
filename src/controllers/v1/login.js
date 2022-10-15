import { Router } from "express";
import models from '../../models';
import runAsyncWrapper from '../../utils/runAsyncWrapper';
import JWTUtils from '../../utils/jwt-utils';

const router = Router();
const { User } = models;

router.post('/login', runAsyncWrapper(async (req, res) => {
  const { email, password, roles } = req.body;
  const user = await User.findOne({ where: { email } });
  if(!user || !(await User.comparePassword(password,user.password))) {
    return res.status(401).send({ success: false, message: "invalid credentials" });
  }
  const payload = { email };
  const accessToken = JWTUtils.generateAccessToken(payload);
  const savedRefreshToken = await user.getRefreshToken();
  let refreshToken;
  if(!savedRefreshToken || !savedRefreshToken.token){
    refreshToken = JWTUtils.generateRefreshToken(payload);
    if(!savedRefreshToken) {
      await user.createRefreshToken({ token: refreshToken });
    } else {
      savedRefreshToken.token = refreshToken;
      await savedRefreshToken.save();
    }
  } else {
    refreshToken = savedRefreshToken.token;
  }
  return res.status(200).send({
    success: true,
    message: 'successfully logged in',
    data: { accessToken, refreshToken }
  })
}));

export default router;