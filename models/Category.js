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

  const res = await db.query(`SELECT * from "category" ${text} LIMIT 1;`, params);

  if (res.rows.length > 0) {
    log.debug(`Successfully found category from db with criteria: ${text}, ${JSON.stringify(params)}`);
    return res.rows[0];
  }
  log.debug(`No category found in db with criteria: ${text}, ${JSON.stringify(params)}`);
  return {};
}


// Edit given course's attributes
// if successful update record in database, return row modified 'res'
// if successful, but no row updates/returned, throw error
// if not enough parameters, throw error
// otherwise throw error
async function editCategory(id, resultCategory) {
  if (id && resultCategory) {

    if (!(resultCategory.name == null) || !(resultCategory.prefix == null)) {

      const newCategoryJSON = {}

      if (!(resultCategory.name == null))
        newCategoryJSON.name = resultCategory.name

      if (!(resultCategory.prefix == null))
        newCategoryJSON.prefix = resultCategory.prefix


      const {
        text,
        params
      } = updateValues(newCategoryJSON);

      const n = params.length;
      const paramList = [];
      params.forEach(x => {
        paramList.push(x);
      });

      paramList.push(id);

      const res = await db.query(`UPDATE "category" ${text} WHERE id = $${n + 1} RETURNING *;`, paramList);

      if (res.rows.length > 0) {
        log.debug(`Successfully updated category with id ${id} in the database with the data ${JSON.stringify(resultCategory)}`);
        return res.rows[0];
      } else {
        throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');
      }
    } else {
      throw HttpError(400, 'Category attributes are required');
    }

  } else {
    throw HttpError(400, 'Id and category attributes are required');

  }
}


module.exports = {
  findOne,
  editCategory
};