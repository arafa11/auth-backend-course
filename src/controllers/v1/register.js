import { Router } from "express";
import models from '../../models';
import runAsyncWrapper from '../../utils/runAsyncWrapper';
import JWTUtils from '../../utils/jwt-utils';

const router = Router();
const { User, Role, sequelize } = models;

router.post('/register', runAsyncWrapper(async (req, res) => {
  const { email, password, roles, username } = req.body;
  const user = await User.findOne({ where: { email } });
  if(user) {
    return res.status(200).send({ success: false, message: "user already exists" });
  }
  const result = await sequelize.transaction(async() => {
    const newUser = await User.create({ email, password, username });
    const jwtPayload = { email };
    const accessToken = JWTUtils.generateAccessToken(jwtPayload);
    const refreshToken = JWTUtils.generateRefreshToken(jwtPayload);
    await newUser.createRefreshToken({ token: refreshToken });

    if(roles && Array.isArray(roles)){
      const rolesToSave = [];
      for(const role of roles) {
        const newRole = await Role.create({ role });
        rolesToSave.push(newRole);
      }
      await newUser.addRoles(rolesToSave);
    }
    return {accessToken, refreshToken};
  });
  const {accessToken, refreshToken} = result;
  return res.status(201).send({ 
    success: true, 
    message: 'user created successfully', 
    data: { accessToken, refreshToken } 
  });
}));

export default router;