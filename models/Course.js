const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
const { whereParams, insertValues } = require('../services/sqltools');
// const env = require('../services/environment');

// if successful delete return id
// if successful, but not deleted, throw error
// if db error, db.query will throw a rejected promise
// otherwise throw error
async function deleteCourse(Id) {
  if (Id) {
    const { text, params } = whereParams({ id: Id });
    const res = await db.query(`DELETE FROM "course" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      return (`Successfully deleted course from db`);
    }
    throw HttpError(500,'Unexpected db condition, delete successful with no returned record');
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    log.debug(`Successfully found course from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}


module.exports = {
  deleteCourse,
  findOne
};
