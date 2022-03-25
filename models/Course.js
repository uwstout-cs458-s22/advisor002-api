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
async function remove(Id) {
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
// This is just here to cover the editCourse tests, can modify them later to use findOne
async function findOneCourse(criteria) {
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    log.debug(`Successfully found course from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
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

// Edit given course's attributes
// if successful update record in database, return row modified 'res'
// if successful, but no row updates/returned, throw error
// if not enough parameters, throw error
// otherwise throw error
async function editCourse(id, resultCourse) {
  if (id && resultCourse) {

    // UPDATE "course" SET name = 'updated', "courseId" = 5, credits = 5 WHERE id = 1 RETURNING *
    // Works but not super secure yet
    if (resultCourse.name || resultCourse.courseId || resultCourse.credits) {
      let commandIntro = `Update "course" SET `

      if (resultCourse.name) {
        commandIntro += `name = '${resultCourse.name}' `

        if (resultCourse.courseId || resultCourse.credits) {
          commandIntro += `, `
        }
      }
      if (resultCourse.courseId) {
        commandIntro += `"courseId" = ${resultCourse.courseId} `

        if (resultCourse.credits) {
          commandIntro += `, `
        }
      }
      if (resultCourse.credits) {
        commandIntro += `credits = '${resultCourse.credits}' `
      }

      commandIntro += `WHERE id = ${id} RETURNING *;`

      // Query the database
      const res = await db.query(commandIntro);

      // Return values if successful
      if (res.rows.length > 0) {
        log.debug(
          `Successfully updated course with id ${id} in the database with the data ${JSON.stringify(resultCourse)}`
        );
        return res.rows[0];
      } // If not, throw error
      throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');

    } else { // If missing parameters, throw error
      throw HttpError(400, 'Id and a course attribute required');
    }

  }
}

module.exports = {
  remove,
  findOne,
  editCourse
};

