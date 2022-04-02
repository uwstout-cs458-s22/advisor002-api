const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
const { whereParams, insertValues, updateValues } = require('../services/sqltools');
// const env = require('../services/environment');


async function findAllCourses(criteria, query = null, limit = 100, offset = 0){ 
    const { text, params } = whereParams(criteria, query);
    const n = params.length;
    const p = params.concat([limit, offset]);
    const res = await db.query(`SELECT * from "course" ${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
    log.debug(
        `Retrieved ${res.rows.length} courses from db with criteria: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows;
}

async function viewAllCoursesFuture(criteria, query = null, limit = 100, offset = 0){ 
    const { text, params } = whereParams(criteria, query);
    const n = params.length;
    const p = params.concat([limit, offset]);
    const res = await db.query(`select "user"."userId", course.name, semester.name, "userCourse".taken
    from "user" join "userCourse" on "user".id = "userCourse"."userId"
    join course on course.Id = "userCourse".courseId
    join semester on semester.id = "userCourse"."semesterId"
    where   "user".id =1
    and taken = false${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
    log.debug(
        `Retrieved ${res.rows.length} courses from db with criteria: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows;
}

async function viewAllCoursesTaken(criteria, query = null, limit = 100, offset = 0){ 
    const { text, params } = whereParams(criteria, query);
    const n = params.length;
    const p = params.concat([limit, offset]);
    const res = await db.query(`select "user"."userId", course.name, semester.name, "userCourse".taken
    from "user" join "userCourse" on "user".id = "userCourse"."userId"
    join course on course.Id = "userCourse".courseId
    join semester on semester.id = "userCourse"."semesterId"
    where   "user".id =1
    and taken = true${text} LIMIT $${n + 1} OFFSET $${n + 2};`, p);
    log.debug(
        `Retrieved ${res.rows.length} courses from db with criteria: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows;
}

async function update(id, newUser) {
    if (id && newUser) {
      const { text, params } = updateValues({
        role: newUser.role,
        enable: newUser.enable
      });
  
      const n = params.length;
      const paramList = [];
      params.forEach(x => {
        paramList.push(x);
      });
  
      paramList.push(id);
  
      const res = await db.query(`UPDATE "user" ${text} WHERE id = $${n + 1} RETURNING *;`, paramList);
  
      if (res.rows.length > 0) {
        log.debug(`Successfully updated user with id ${id} in the database with the data ${JSON.stringify(newUser)}`);
        return res.rows[0];
      }
      throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');
    }
    else {
      throw HttpError(400, 'Id and a put document are required');
  
    }
  }


module.exports = {
    viewAllCoursesFuture,
    viewAllCoursesTaken,
    findAllCourses,
    update
}
