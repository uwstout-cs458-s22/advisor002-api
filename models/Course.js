const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
// eslint-disable-next-line no-unused-vars -- TEMP FOR ESLINT
const { whereParams, insertValues } = require('../services/sqltools');
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

async function findOneCourse(criteria) {
    const {text,params} = whereParams(criteria);
    const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
    if (res.rows.length > 0) {
      log.debug(`Successfully found course from DB with criteria: ${text}, ${JSON.stringify(params)}`);
      return res.rows[0];
    }
    log.debug(`No course found in DB with criteria: ${text}, ${JSON.stringify(params)}`);
    return {};
  }


 // All of the params are required
async function create(id, courseid, name, credits) {

    if(name && credits){
        const {text, params} = insertValues({
            id: id,
            courseid: courseid,
            name: name,
            credits: credits
        });
         if(findOneCourse({id: id}) !== {}){
            const res = await db.query(`INSERT INTO "course" ${text} RETURNING *;`, params);
            if(res.rows.length > 0){
                log.debug(`successfully inserted course ${name} into course table with data: ${text}, ${JSON.stringify(params)}`);
                return res.rows[0];
            }
            throw HttpError(500, 'Inserted succesfully, without response');
            } else {
                throw HttpError(500, `Course ${name} already exists in table "course"`);
            }
        } else {
            throw HttpError(400, 'Course name, courseid and credits are required');
        }
}


module.exports = {
    findOneCourse,
    findAllCourses,
    remove,
    create
}
