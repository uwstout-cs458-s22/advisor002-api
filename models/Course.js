// const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
const { whereParams, insertValues } = require('../services/sqltools');
// const env = require('../services/environment');

// if successful delete return id
// if successful, but not deleted, throw error
// if db error, db.query will throw a rejected promise
// otherwise throw error
async function remove(criteria) {
  const { text, params } = whereParams(criteria);
  const res = await db.query(`DELETE FROM "course" ${text} RETURNING *;`, params);
  if (res.rows.length > 0) {
    log.debug(
      `Successfully deleted course from db with criteria: ${text}, ${JSON.stringify(params)}`
    );
    return { success: true };
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}


module.exports = {
  remove,
};
