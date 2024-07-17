const { DataTypes } = require("sequelize");
const db = require("../db/conn");

const User = db.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Adicionando uma restrição de unicidade para o campo de email
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isValidPassword(value) {
        if (value.length < 6) {
          throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
        if (!/[A-Z]/.test(value)) {
          throw new Error('A senha deve conter pelo menos uma letra maiúscula.');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          throw new Error('A senha deve conter pelo menos um caractere especial.');
        }
      },
    },
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = User;
