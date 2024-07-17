const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone'); // Usar moment-timezone
const Log = require('../models/log'); 
const User = require('../models/User'); 

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return; // Remove referências circulares
      }
      cache.add(value);
    }
    return value;
  });
}

function extractEssentialInfo(req) {
  const info = {
    method: req.method,
    url: req.url,
    body: { ...req.body },
    query: req.query,
    params: req.params,
    session: {
      cookie: req.session.cookie,
      userid: req.session.userid,
      // isAdmin: req.session.isAdmin,
    },
    user: req.user,
  };

  // Mascarar senha se presente no corpo da requisição
  if (info.body.password) {
    info.body.password = '****';
  }

  return info;
}

async function logAction(action, req, extraInfo = {}) {
  let userId = extraInfo.userId !== undefined ? extraInfo.userId : (req.body.userid || 'N/A');

  // Se o userId ainda for 'N/A' e um email estiver presente no corpo da requisição, tente encontrar o userId pelo email
  if (userId === 'N/A' && req.body.email) {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (user) {
        userId = user.id;
      }
    } catch (err) {
      console.error('Erro ao buscar userId pelo email:', err);
    }
  }

  const ip = req.ip || req.connection.remoteAddress;
  const timestamp = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
  let logEntry = `${timestamp} - User ID: ${userId}, IP: ${ip}, Action: ${action}`;

  if (extraInfo.previousTought && extraInfo.updatedTought) {
    logEntry += `: Previous Title: ${extraInfo.previousTought.title}, New Title: ${extraInfo.updatedTought.title}`;
  } else if (extraInfo.title) {
    logEntry += `, Title: ${extraInfo.title}`;
  } else if (extraInfo.email) {
    logEntry += `, Email: ${extraInfo.email}`;
  }

  logEntry += '\n';
  fs.appendFileSync(path.join(logDir, 'actions.log'), logEntry);

  // Salvar log no banco de dados
  try {
    await Log.create({
      userId,
      ip,
      action,
      details: safeStringify(extractEssentialInfo(req)),
    });
  } catch (err) {
    console.error('Erro ao salvar log no banco de dados:', err);
  }
}

function showLogs(req, res) {
  console.warn(req + ' e ' + res);
}

function logMiddleware(req, res, next) {
  req.logAction = (action, extraInfo = {}) => {
    if (!extraInfo.userId && req.session && req.session.userid) {
      extraInfo.userId = req.session.userid;
    }
    console.log(`Logging Action: ${action}, User ID: ${extraInfo.userId !== undefined ? extraInfo.userId : 'N/A'}, IP: ${req.ip || req.connection.remoteAddress}`);
    logAction(action, req, extraInfo);
  };

  req.showLogs = (req, res) => {
    showLogs(req, res);
  }

  next();
}

module.exports = logMiddleware;
