const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { insertValues, whereParams } = require('../services/sqltools');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    log.debug(
      `Successfully found course from db with criteria: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows[0];
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}

// All of the params are required
async function createCourse( name, credits, section) {
  if ( name && section && credits) {
    const { text, params } = insertValues({
      name: name,
      credits: credits,
      section: section,
    });
    if (findOne({ section: section }) !== {}) {
      const res = await db.query(`INSERT INTO "course" ${text} RETURNING *;`, params);
      if (res.rows.length > 0) {
        log.debug(
          `successfully inserted course ${name} into course table with data: ${text}, ${JSON.stringify(
            params
          )}`
        );
        return res.rows[0];
      }
      throw HttpError(500, 'Inserted succesfully, without response');
    } else {
      throw HttpError(500, `Course ${name} already exists in table "course"`);
    }
  } else {
    throw HttpError(400, 'Course name, section, credits, and semester are required');
  }
}

// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
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
      return `Successfully deleted course from db`;
    }
    throw HttpError(500, 'Unexpected db condition, delete successful with no returned record');
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

module.exports = {
  createCourse,
  deleteCourse,
  findOne,
};
