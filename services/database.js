const log = require('loglevel');
module.exports.db = {};

function initialize() {
  const { Pool } = require('pg');
  const { databaseUrl } = require('./environment');
  const parse = require('pg-connection-string').parse;
  const config = parse(databaseUrl);
  module.exports.db = new Pool(config);

  module.exports.db.query(
    `CREATE TABLE IF NOT EXISTS "user"  (
        email text,
        enable boolean,
        id serial,
        role text CHECK (role IN ('user', 'director', 'admin')),
        "userId" text,
        PRIMARY KEY (id)
      );
      CREATE INDEX IF NOT EXISTS "IDX_user_userId" ON "user" ("userId");`,
    (err, res) => {
      if (err) {
        throw err;
      }
      log.info('Server successfully connected to database and setup schema.');
    }
  );

  log.info(`database has ${module.exports.db.totalCount} clients existing within the pool`);
}

module.exports.initialize = initialize;
