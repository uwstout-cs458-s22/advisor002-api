const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
// const { whereParams, insertValues, updateValues } = require('../services/sqltools');
// const env = require('../services/environment');

// should return a list of courses for each semester in json
/* SELECT userid, course.*, semester.id
	FROM public."userCourse"
	JOIN course ON courseid = course.id
	JOIN semester ON semesterid = semester.id
	WHERE semester.year = year */
async function getSemesterSchedule(userid, semesterid, year) {
  if (userid && semesterid && year) {
    const { text, params } = {
      userid: userid,
      semesterid: semesterid,
      year: year,
    };

    // const n = params.length;
    const paramList = [];
    params.forEach((x) => {
      paramList.push(x);
    });

    const res = await db.query(
      `SELECT course.*
	FROM public."userCourse"
	JOIN course ON courseid = course.id
	JOIN semester ON semesterid = semester.id
	 ${text} WHERE userid = ${userid} AND semester.semesterid = ${semesterid} AND semester.year = ${year}  RETURNING *;`,
      paramList
    );

    // Return values if successful
    if (res.rows.length > 0) {
      log.debug(
        `Successfully collected user ${userid}'s courses for smemster ${semesterid}, in ${year} returning the data ${JSON.stringify(
          res
        )}`
      );
      return res.rows[0];
    } // If not, throw error
    throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');
  } else {
    // If missing parameters, throw error
    throw HttpError(400, '');
  }
}

module.exports = {
  getSemesterSchedule,
};
