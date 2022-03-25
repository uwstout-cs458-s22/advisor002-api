const HttpError = require('http-errors');
const log = require('loglevel');
const {
  authenticateStytchSession
} = require('./stytchwrapper');
const {
  isString
} = require('./utils');

async function authorizeSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (isString(authHeader) && authHeader.startsWith('Bearer ') && authHeader.length > 7) {
    const token = authHeader.substring(7, authHeader.length);
    try {
      const result = await authenticateStytchSession(token);
      // await authenticateStytchSession(token);
      log.debug(
        `${req.method} ${req.originalUrl} success: authorizeSession validated token ${token}`
      );
      res.locals.userId = result.session.user_id;
      //
      next();
    } catch (err) {
      next(HttpError(err.status_code, `Authorization Failed: ${err.error_message}`));
    }
  } else {
    next(HttpError(401, 'Authorization of User Failed: No Token'));
  }
}

module.exports = {
  authorizeSession,
};