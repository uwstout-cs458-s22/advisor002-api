const HttpError = require('http-errors');
const log = require('loglevel');

const {
  db
} = require('../services/database');
// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
const {
  whereParams,
  // insertValues,
  updateValues
} = require('../services/sqltools');
// const env = require('../services/environment');
const {
  Category
} = require('./Category');

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
  const {
    text,
    params
  } = whereParams(criteria);
  const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    log.debug(`Successfully found course from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}

async function findAll(criteria, limit = 100, offset = 0) {
  const {
    text,
    params
  } = whereParams(criteria);
  const n = params.length;
  const p = params.concat([limit, offset])
  const res = await db.query(`SELECT * from "course" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} courses from db with criteria ${text}, ${JSON.stringify(params)}`
  )
  return res.rows;
}

// Edit given course's attributes
// if successful update record in database, return row modified 'res'
// if successful, but no row updates/returned, throw error
// if not enough parameters, throw error
// otherwise throw error
async function editCourse(id, resultCourse) {
  if (id && resultCourse) {

    // See if a prefix was changed
    let prefixFlag = false
    let resPrefix

    // If wanting to change the prefix/category
    if (resultCourse.prefix) {



      // Grab the id of the prefix entered
      // SELECT id FROM category WHERE prefix='CS';
      const tempCategoryId = await db.query(`SELECT id FROM category WHERE prefix='${resultCourse.prefix}'`);

      // If valid prefix
      if (typeof tempCategoryId.rows[0] !== 'undefined') {
        // Update the course category based on the id/prefix given
        const {
          text,
          params
        } = updateValues({
          categoryid: tempCategoryId.rows[0].id
        });

        const n = params.length;
        const paramList = [];
        params.forEach(x => {
          paramList.push(x);
        });

        paramList.push(id);

        resPrefix = await db.query(`UPDATE "courseCategory" ${text} WHERE courseid = $${n + 1} RETURNING *;`, paramList);
        // return res.rows[0];
        if (!(resPrefix.rows.length > 0)) {
          log.debug(
            `Problem updating course category with id ${id} in the database with the data ${JSON.stringify(resultCourse)}`
          );
          return resPrefix.rows[0];
        } else {
          prefixFlag = true
        }
      } else {
        throw HttpError(404, 'Class prefix not found');
      }
      // If not, throw error
      // throw HttpError(500, 'Unexpected DB condition relating to category, update successful with no returned record');
    }

    // Then update the rest (name, section, credits)
    // UPDATE "course" SET name = 'updated', "section" = 5, credits = 5 WHERE id = 1 RETURNING *

    // Check if any are null, if all are null then you should skip this part and only submit the prefix IF a prefix was submitted (prefix flag)
    if (!(resultCourse.name == null) || !(resultCourse.name == null) || !(resultCourse.name == null)) {

      const newCourseJSON = {}

      if (!(resultCourse.name == null))
        newCourseJSON.name = resultCourse.name

      if (!(resultCourse.section == null))
        newCourseJSON.section = resultCourse.section

      if (!(resultCourse.credits == null))
        newCourseJSON.credits = resultCourse.credits

      const {
        text,
        params
      } = updateValues(newCourseJSON);

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

    }
    // else {
    //   throw HttpError(400, 'thingy thing');

    // If a prefix flag was submitted but nothing else
    if (prefixFlag) {
      return resPrefix.rows[0];
    }

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