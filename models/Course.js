const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { insertValues, whereParams } = require('../services/sqltools');


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
async function createCourse(id, name, major, credits, semester) {

    if(name && major && credits && semester){
        const {text, params} = insertValues({
            id: id,
            name: name,
            major: major,
            credits: credits,
            semester: semester
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
            throw HttpError(400, 'Course name, major, credits, and semester are required');
        }
}


module.exports = {
    findOneCourse,
    createCourse
}