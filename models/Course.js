// const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const { whereParams, insertValues } = require('../services/sqltools');
// const { insertValues, whereParams } = require('../services/sqltools');

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

module.exports = {
    findAllCourses
}