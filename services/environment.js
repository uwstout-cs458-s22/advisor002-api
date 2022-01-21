require('dotenv').config();

module.exports = {
  logLevel: process.env.LOG_LEVEL || 'info',
  port: process.env.PORT || 3001,
  stytchProjectId: process.env.STYTCH_PROJECT_ID,
  stytchSecret: process.env.STYTCH_SECRET,
  stytchEnv: process.env.STYTCH_ENV || 'https://test.stytch.com/v1/',
  sessionDuration: process.env.SESSION_DURATION || 60,
  masterAdminEmail: process.env.MASTER_ADMIN_EMAIL,
  databaseUrl: process.env.DATABASE_URL,
};
