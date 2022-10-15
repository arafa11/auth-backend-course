import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";
import environment from "../config/environment";

export default (sequelize) => {
    class User extends Model {
        static associate(models) {
          User.hasMany(models['Role']);
          User.hasOne(models['RefreshToken']);
        }

        static async hashPassword(password) {
            return bcrypt.hash(password, environment.saltRounds)
        }

        static async comparePasswords(password, hashedPassword) {
            return bcrypt.compare(password, hashedPassword)
        }

        // create new user
    }

    User.init({
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING(50),
            validate: {
                len: {
                    args: [0, 50],
                    msg: "first name has an invalid lenght"
                }
            }
        },
        lastName: {
            type: DataTypes.STRING(50),
            validate: {
                len: {
                    args: [0, 50],
                    msg: "last name has an invalid lenght"
                }
            }
        },
    }, {
        sequelize,
        modelName: "User",
        indexes: [{ unique: true, fields: ['email', 'username'] }]
    });

    User.beforeSave(async (passedUser, options) => {
        const hashedPassword = await User.hashPassword(passedUser.password);
        passedUser.password = hashedPassword;
    })

    return User;
}