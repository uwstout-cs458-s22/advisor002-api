const env = require('./environment');
const stytch = require('stytch');

async function authenticateStytchSession(token) {
  const client = new stytch.Client({
    project_id: env.stytchProjectId,
    secret: env.stytchSecret,
    env: env.stytchEnv,
  });
  const result = client.sessions.authenticate({
    session_token: token,
    session_duration_minutes: env.sessionDuration,
  });
  return result;
}

module.exports = {
  authenticateStytchSession,
};
