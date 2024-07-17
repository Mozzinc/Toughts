const { DataTypes } = require("sequelize");
const sequelize = require("../db/conn");
const moment = require('moment-timezone');

const Log = sequelize.define("LogReg", {
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(value) {
      // Armazena os detalhes como uma string JSON segura
      this.setDataValue('details', JSON.stringify(value));
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  hooks: {
    beforeCreate: (log) => {
      log.createdAt = moment().utcOffset('-03:00').toDate();
      log.updatedAt = moment().utcOffset('-03:00').toDate();
    },
    beforeUpdate: (log) => {
      log.updatedAt = moment().utcOffset('-03:00').toDate();
    }
  }
});

module.exports = Log;
