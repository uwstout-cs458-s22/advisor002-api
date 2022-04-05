const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { insertValues, whereParams, updateValues } = require('../services/sqltools');

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
      return `Successfully deleted course from db`;
    }
    throw HttpError(500, 'Unexpected db condition, delete successful with no returned record');
  } else {
    throw HttpError(400, 'Id is required.');
  }
}

async function findAll(criteria, limit = 100, offset = 0) {
  const { text, params } = whereParams(criteria);
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
  createCourse,
  deleteCourse,
  findOne,
  findAll,
  editCourse
};
