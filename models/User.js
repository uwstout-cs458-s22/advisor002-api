const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const {
  whereParams,
  insertValues,
  updateValues,
  whereParamsCourses,
} = require('../services/sqltools');
const env = require('../services/environment');
const Course = require('../models/Course');
const Semester = require('../models/Semester');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
  const { text, params } = whereParams(criteria);

  const res = await db.query(`SELECT * from "user" ${text} LIMIT 1;`, params);

  if (res.rows.length > 0) {
    log.debug(`Successfully found user from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No users found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}

// if found return [ {}, {} ... ]
// if not found return []
// if db error, db.query will throw a rejected promise

async function findAll(criteria, query = null, limit = 100, offset = 0) {
  const { text, params } = whereParams(criteria, query);
  const n = params.length;
  const p = params.concat([limit, offset]);
  const res = await db.query(`SELECT * from "user" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
  log.debug(
    `Retrieved ${res.rows.length} users from db with criteria: ${text}, ${JSON.stringify(params)}`
  );
  return res.rows;
}

// if successful insert return inserted record {}
// if successful, but no row inserted, throw error
// if db error, db.query will throw a rejected promise
// otherwise throw error
async function create(userId, email) {
  // userId and email are required
  if (userId && email) {
    const enable = email === env.masterAdminEmail;
    const role = email === env.masterAdminEmail ? 'admin' : 'user';
    const { text, params } = insertValues({
      userId: userId,
      email: email,
      enable: enable,
      role: role,
    });

    const res = await db.query(`INSERT INTO "user" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      log.debug(
        `Successfully inserted user ${email} into db with data: ${text}, ${JSON.stringify(params)}`
      );
      return res.rows[0];
    }
    throw HttpError(500, 'Unexpected DB Condition, insert successful with no returned record');
  } else {
    throw HttpError(400, 'UserId and Email are required.');
  }
}

// should return a list of courses for each semester in json
async function getSemesterSchedule(userid, semesterid, year, type) {
  if (userid && semesterid && year) {
    const { text, params } = whereParamsCourses({
      userid: userid,
      's.id': semesterid,
      year: year,
      type: type,
    });

    const res = await db.query(
      `SELECT * FROM "course" as c JOIN "courseSemester" as cs on cs.courseid = c.id JOIN "semester" as s ON s.id = cs.semesterid JOIN "userCourse" as uc ON uc.courseid = c.id ${text};`,
      params
    );

    // Return values if successful
    if (res.rows.length > 0) {
      log.debug(
        `Successfully collected user ${userid}'s courses for sememster ${semesterid}, in ${year} returning the data ${JSON.stringify(
          res
        )}`
      );
      return res.rows[0];
    } // If not, throw error
    throw HttpError(500, 'Unexpected DB condition,  select successful with no returned record');
  } else {
    // If missing parameters, throw error
    throw HttpError(400, 'userid, semester, year, and type required');
  }
}

// if successful, user is deleted.
// if db error, db.query will throw a rejected promise
// userId refers to the user being deleted
// email is used to check for admin role on the deleter
async function deleteUser(id) {
  // email is required
  if (id) {
    const { text, params } = whereParams({ id: id });
    const res = await db.query(`DELETE FROM "user" ${text} RETURNING *;`, params);
    if (res.rows.length > 0) {
      return `Successfully deleted user from db`;
    }
    throw HttpError(500, 'Unexpected db condition, delete successful with no returned record');
  } else {
    throw HttpError(400, 'UserId is required.');
  }
}

async function update(id, newUser) {
  if (id && newUser) {
    const { text, params } = updateValues({
      role: newUser.role,
      enable: newUser.enable,
    });

    const n = params.length;
    const paramList = [];
    params.forEach((x) => {
      paramList.push(x);
    });

    paramList.push(id);

    const res = await db.query(
      `UPDATE "user" ${text} WHERE id = $${n + 1} RETURNING *;`,
      paramList
    );

    if (res.rows.length > 0) {
      log.debug(
        `Successfully updated user with id ${id} in the database with the data ${JSON.stringify(
          newUser
        )}`
      );
      return res.rows[0];
    }
    throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');
  } else {
    throw HttpError(400, 'Id and a put document are required');
  }
}

async function findUsersCourses(userId, courseId, semesterId) {
  if (userId && courseId && semesterId) {
    const foundUser = await findOne({id: userId});
    const foundCourse = await Course.findOne({id: courseId});
    const foundSemester = await Semester.findOne({id: semesterId});
    if (Object.keys(foundUser).length > 0) {
      if (Object.keys(foundCourse).length > 0) {
        if (Object.keys(foundSemester).length > 0) {
          try {
            const res = await db.query(`SELECT c.*, s.type, s.year, u.email from "user" AS u 
              LEFT JOIN "userCourse" AS uc ON uc.userid = u.id 
              LEFT JOIN "semester" AS s ON s.id = uc.semesterid 
              LEFT JOIN "course" AS c ON c.id = uc.courseid 
              WHERE u.id = ${userId} AND c.id = ${courseId} AND s.id = ${semesterId};`);
            if (res.rows.length > 0) {
              return res.rows;
            }
          } catch (error){
            throw HttpError(500, `an unknown error occured while attempting to find courses for user, ${userId}`);
          }
        }
        throw HttpError(404, `Semester with id ${semesterId} could not be found`);
      }
      throw HttpError(404, `Course with id ${courseId} could not be found`);
    }
    throw HttpError(404, `User with id ${userId} could not be found`);
  }
  throw HttpError(500, `all parameters are required`);
}

module.exports = {
  findOne,
  findAll,
  create,
  deleteUser,
  update,
  getSemesterSchedule,
  findUsersCourses,
};
