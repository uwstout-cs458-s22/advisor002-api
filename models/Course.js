const HttpError = require('http-errors');
const log = require('loglevel');

const {
  db
} = require('../services/database');
// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
const { whereParams, updateValues, whereParamsCourses } = require('../services/sqltools');
// const env = require('../services/environment');

// if successful delete return id
// if successful, but not deleted, throw error
// if db error, db.query will throw a rejected promise
// otherwise throw error
async function deleteCourse(Id) {
  if (Id) {
    const {
      text,
      params
    } = whereParams({
      id: Id
    });
    const res = await db.query(`DELETE FROM "course" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      return (`Successfully deleted course from db`);
    }
    throw HttpError(500, 'Unexpected db condition, delete successful with no returned record');
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
  // Use the course whereParams function to setup a prepared statement
  const { text, params } = whereParamsCourses(criteria);
  // Setup prepared statement to send to server with the variables
  const res = await db.query(`SELECT * from "course" AS c ` +
                                `JOIN "courseSemester" AS cs ON cs.courseId = c.id ` +
                                `JOIN "semester" AS s ON s.id = cs.semesterId ` +
                              `${text};`, params);

  // If the result count is more than 0 than return the results gathered from the database
  if (res.rows.length > 0) {
    log.debug(`Successfully found course from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);

  // Otherwise return and empty object
  return {};
}

// Find all courses matching given criteria
async function findAll(criteria, limit = 100, offset = 0) {
  // Use the course whereParams function to setup a prepared statement
  const { text, params } = whereParamsCourses(criteria);
  // Calculate offset and limit position based on length of params
  // and add them to the list of params for prepared statement
  const n = params.length;
  const p = params.concat([limit, offset])
  // Setup query and add variables for prepared statement and send it
  const res = await db.query(`SELECT * from "course" AS c ` +
                                `JOIN "courseSemester" AS cs ON cs.courseId = c.id ` +
                                `JOIN "semester" AS s ON s.id = cs.semesterId ` +
                              `${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} courses from db with criteria ${text}, ${JSON.stringify(params)}`
  )
  
  // Return the results
  return res.rows;
}

// Edit given course's attributes
// if successful update record in database, return row modified 'res'
// if successful, but no row updates/returned, throw error
// if not enough parameters, throw error
// otherwise throw error
async function editCourse(id, resultCourse) {
  if (id && resultCourse) {

    // UPDATE "course" SET name = 'updated', "section" = 5, credits = 5 WHERE id = 1 RETURNING *
    const {
      text,
      params
    } = updateValues({
      name: resultCourse.name,
      section: resultCourse.section,
      credits: resultCourse.credits
    });

    const n = params.length;
    const paramList = [];
    params.forEach(x => {
      paramList.push(x);
    });

    paramList.push(id);

    const res = await db.query(`UPDATE "course" ${text} WHERE id = $${n + 1} RETURNING *;`, paramList);

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


module.exports = {
  deleteCourse,
  findOne,
  findAll,
  editCourse
};
