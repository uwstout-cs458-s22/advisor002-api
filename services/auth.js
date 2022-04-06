const HttpError = require('http-errors');
const log = require('loglevel');
const {
  authenticateStytchSession
} = require('./stytchwrapper');
const {
  isString
} = require('./utils');

const Permissions = {
  USER: 0,
  DIRECTOR: 1,
  ADMIN: 2
};

async function authorizeSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (isString(authHeader) && authHeader.startsWith('Bearer ') && authHeader.length > 7) {
    const token = authHeader.substring(7, authHeader.length);
    try {
      const result = await authenticateStytchSession(token);
      log.debug(
        `${req.method} ${req.originalUrl} success: authorizeSession validated token ${token}`
      );
      
      res.locals.userId = result.session.user_id;
      next();
    }
    catch (err) {
      next(HttpError(err.status_code, `Authorization Failed: ${err.error_message}`));
    }
  }
  else {
    next(HttpError(401, 'Authorization of User Failed: No Token'));
  }
}

function checkPermissions(role) {
  if(role === 'user') {
    return Permissions.USER;
  }else if(role === 'director') {
    return Permissions.DIRECTOR;
  } else if(role === 'admin') {
    return Permissions.ADMIN;
  } else {
    return Permissions.USER;
  }
}

module.exports = {
  authorizeSession,
  checkPermissions
};

