import bcrypt from "bcrypt";
import environment from "../config/environment";

export const passwordUtils = {
  async hashPassword(password) {
      return bcrypt.hash(password, environment.saltRounds)
  },
  async comparePasswords(password, hashedPassword) {
      return bcrypt.compare(password, hashedPassword)
  }
}
