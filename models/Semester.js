const HttpError = require('http-errors');
const log = require('loglevel');
const {
  db
} = require('../services/database');
const {
  whereParams,
  updateValues
} = require('../services/sqltools');


//  TEMP MADE FOR TESTING EDIT
// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {

  const {
    text,
    params
  } = whereParams(criteria);

  const res = await db.query(`SELECT * from "semester" ${text} LIMIT 1;`, params);

  if (res.rows.length > 0) {
    log.debug(`Successfully found semester from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No semester found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}

async function deleteSemester(id) {
  if(id) {
    const {text, params} = whereParams({id: id});

    const delSemester = await db.query(`DELETE FROM "semester" ${text} RETURNING *;`, params);

    if(delSemester.rows.length > 0) {
      return 'Successfully deleted semester';
    } else {
      throw HttpError(500, 'Unexpected DB condition');
    }
  } else {
    throw HttpError(400, 'Id is required to delete a semester');
  }
}


// Edit given course's attributes
// if successful update record in database, return row modified 'res'
// if successful, but no row updates/returned, throw error
// if not enough parameters, throw error
// otherwise throw error
async function editSemester(id, resultSemester) {
  if (id && resultSemester) {

    if (!(resultSemester.year == null) || !(resultSemester.type == null)) {

      const newSemesterJSON = {}

      if (!(resultSemester.year == null)) {
        newSemesterJSON.year = resultSemester.year
      }

      if (!(resultSemester.type == null)) {
        if (resultSemester.type !== 'winter' && resultSemester.type !== 'spring' && resultSemester.type !== 'summer' && resultSemester.type !== 'fall') {
          throw HttpError(400, `Invalid type, must be 'spring', 'summer', 'fall', or 'winter'`);
        } else {
          newSemesterJSON.type = resultSemester.type
        }
      }


      const {
        text,
        params
      } = updateValues(newSemesterJSON);

      const n = params.length;
      const paramList = [];
      params.forEach(x => {
        paramList.push(x);
      });

      paramList.push(id);

      const res = await db.query(`UPDATE "semester" ${text} WHERE id = $${n + 1} RETURNING *;`, paramList);

      if (res.rows.length > 0) {
        log.debug(`Successfully updated semester with id ${id} in the database with the data ${JSON.stringify(resultSemester)}`);
        return res.rows[0];
      }
    } else {
      throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');
    }

  } else {
    throw HttpError(400, 'Id and semester attributes are required');

  }
}


module.exports = {
  findOne,
  editSemester,
  deleteSemester
};
