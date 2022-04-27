const HttpError = require('http-errors');
const { db } = require('../services/database');
const { insertValues, whereParams } = require('../services/sqltools');

async function findOne(criteria) {
  const { text, params } = whereParams(criteria);
  const res = await db.query(`SELECT * from "userCourse" ${text} LIMIT 1;`, params);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
}

async function createUserCourse(userId, courseId, semesterId, taken) {
  taken = taken || false
  const { text, params } = insertValues({ userid: userId, courseid: courseId, semesterid: semesterId,  taken: taken });
  const res = await db.query(`INSERT INTO "userCourse" ${text} RETURNING *;`, params);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  throw HttpError(500, 'Unexpected db condition, insert successful with no returned record');
}

async function deleteUserCourse(userId, courseId, semesterId) {
  const { text, params } = whereParams({ userid: userId, courseid: courseId, semesterid: semesterId });
  const res = await db.query(`DELETE FROM "userCourse" ${text} RETURNING *;`, params);
  if (res.rows.length > 0) {
    return `Successfully deleted userCourse from db`;
  }
  throw HttpError(500, 'Unexpected db condition, delete successful with no returned record');
}

async function editUserCourse(userId, courseId, semesterId, taken) {
  if (!findOne({ userid: userId, courseid: courseId, semesterid: semesterId })) {
    throw HttpError(400, `UserCourse not found`);
  }
  const { text, params } = whereParams({ userid: userId, courseid: courseId, semesterid: semesterId });
  console.log(`UPDATE "userCourse" SET taken=${taken} ${text} RETURNING *;`)
  const res = await db.query(`UPDATE "userCourse" SET taken=${taken} ${text} RETURNING *;`, params);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  throw HttpError(500, 'Unexpected db condition, update successful with no returned record');
}


module.exports = {
  createUserCourse,
  deleteUserCourse,
  findOne,
  editUserCourse
};