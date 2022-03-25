const HttpError = require('http-errors');
const log = require('loglevel');
const {
  db
} = require('../services/database');
const {
  whereParams /* , insertValues */
} = require('../services/sqltools');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise,
// STILL REQUIRES JEST/MOCK TESTS
async function findOneCourse(criteria) {
  const {
    text,
    params
  } = whereParams(criteria);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    log.debug(`Successfully found course from DB with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No course found in DB with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}



// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise
// async function findAllCourses(criteria, limit = 100, offset = 0) {

// }

// if successful insert return inserted record {}
// if successful, but no row inserted, throw error
// if db error, db.query will throw a rejected promise
// otherwise throw error
// async function createCourse(userId, email) {

// }

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
  findOneCourse,
  // findAll,
  // create,
  editCourse
};