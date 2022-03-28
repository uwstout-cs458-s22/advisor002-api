const log = require('loglevel');
const fs = require('fs');
module.exports.db = {};

function initialize() {
  const { Pool } = require('pg');
  const { databaseUrl } = require('./environment');
  const parse = require('pg-connection-string').parse;
  const config = parse(databaseUrl);
  const databaseFilePath = './services/database.sql'
  const databaseInitQuery = fs.readFileSync(databaseFilePath)
  if (databaseInitQuery) {
    module.exports.db = new Pool(config);
    module.exports.db.query(databaseInitQuery.toString(),

      (err, res) => {
        if (err) {
          throw err;
        }
        log.info('Server successfully connected to database and setup schema.');
      }
    );

    log.info(`database has ${module.exports.db.totalCount} clients existing within the pool`);
  } else {
    log.error(`Failed to read in database from: ${databaseFilePath}`)
  }
}

module.exports.initialize = initialize;
