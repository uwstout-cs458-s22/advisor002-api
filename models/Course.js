const HttpError = require('http-errors');
const log = require('loglevel');
const { db } = require('../services/database');
const {
  insertValues,
  whereParams,
  updateValues,
  whereParamsCourses
} = require('../services/sqltools');

// Name, credits, and section are required
async function createCourse(name, credits, section, type, year) {
  if (name && section && credits) {
    const {
      text,
      params
    } = insertValues({
      name: name,
      credits: credits,
      section: section
    });


    const keyLength = Object.keys(await findOne({
      name: name,
      section: section
    })).length;

    if (keyLength === 0) {
      const res = await db.query(`INSERT INTO "course" ${text} RETURNING *;`, params);

      if (res.rows.length > 0) {

        if (type && year) {
          const {
            text,
            params
          } = whereParams({
            type: type,
            year: year
          });

          const semester = await db.query(`SELECT * FROM "semester" ${text}`, params);

          if (semester.rows.length > 0) {
            const {
              text,
              params
            } = insertValues({
              courseid: res.rows[0].id,
              semesterid: semester.rows[0].id
            });

            await db.query(`INSERT INTO "courseSemester" ${text} RETURNING *;`, params);
          } else {
            // log.error(`No semester with the provided information type: ${type}, year: ${year}. Creating course but not creating semester relation.`);
            console.log(`No semester with the provided information type: ${type}, year: ${year}. Creating course but not creating semester relation.`);
          }
        }

        log.debug(
          `successfully inserted course ${name} into course table with data: ${text}, ${JSON.stringify(
            params
          )}`
        );

        return await findOne({
          id: res.rows[0].id
        });
      }
      throw HttpError(500, 'Inserted successfully, without response');
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
    const { text, params } = whereParams({
      id: Id,
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

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(criteria) {
  // Use the course whereParams function to setup a prepared statement
  const {
    text,
    params
  } = whereParamsCourses(criteria);
  // Setup prepared statement to send to server with the variables
  const res = await db.query(
    `SELECT c.*, s.type, s.year from "course" AS c ` +
      `LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id ` +
      `LEFT JOIN "semester" AS s ON s.id = cs.semesterId ` +
      `${text};`,
    params
  );
  // If the result count is more than 0 than return the results gathered from the database
  if (res.rows.length > 0) {
    log.debug(
      `Successfully found course from db with criteria: ${text}, ${JSON.stringify(params)}`
    );
    return res.rows[0];
  }
  log.debug(`No courses found in db with criteria: ${text}, ${JSON.stringify(params)}`);

  // Otherwise return and empty object
  return {};
}

// Find all courses matching given criteria
async function findAll(criteria, limit = 100, offset = 0) {
  // Use the course whereParams function to setup a prepared statement
  const {
    text,
    params
  } = whereParamsCourses(criteria);
  // Calculate offset and limit position based on length of params
  // and add them to the list of params for prepared statement
  const n = params.length;
  const p = params.concat([limit, offset]);
  // Setup query and add variables for prepared statement and send it
  const res = await db.query(
    `SELECT c.*, s.type, s.year from "course" AS c ` +
      `LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id ` +
      `LEFT JOIN "semester" AS s ON s.id = cs.semesterId ` +
      `${text} LIMIT $${n + 1} OFFSET $${n + 2};`,
    p
  );
  log.debug(
    `Retrieved ${res.rows.length} courses from db with criteria ${text}, ${JSON.stringify(params)}`
  );

  // Return the results
  return res.rows;
}

// requests are formatted /courses?categoryid=...
// if found return the results
// if not found return {}
async function findCoursesInCategory(categoryid) {
  // Query for all courses that are in the category with the id given
  const res = await db.query(`SELECT * FROM course ` +
    `LEFT JOIN "courseCategory" ON "courseCategory".courseid = "course".id ` +
    `LEFT JOIN "category" ON "category".id = "courseCategory".categoryid WHERE category.id = ${categoryid}`);

  if (res.rows.length > 0) {
    log.debug(`Retrieved ${res.rows.length} courses from db with category id ${categoryid}`);
    // Return the results
    return res.rows;
  }

  log.debug(`Could not find courses in category with id: ${categoryid}`);
  return {};
}

// Edit given course's attributes
// if successful update record in database, return row modified 'res'
// if successful, but no row updates/returned, throw error
// if not enough parameters, throw error
// otherwise throw error
async function editCourse(id, resultCourse) {
  if (id && resultCourse) {
    // See if a prefix was changed
    let changeFlag = false

    // If wanting to change the prefix/category
    if (resultCourse.prefix) {
      // Grab the id of the prefix entered
      const tempCategoryId = await db.query(
        `SELECT id FROM category WHERE prefix='${resultCourse.prefix}';`
      );

      // If valid prefix
      if (typeof tempCategoryId.rows[0] !== 'undefined') {
        // Update the course category based on the id/prefix given
        const { text, params } = updateValues({
          categoryid: tempCategoryId.rows[0].id,
        });

        const n = params.length;
        const paramList = [];
        params.forEach((x) => {
          paramList.push(x);
        });
        paramList.push(id);

        const resPrefix = await db.query(
          `UPDATE "courseCategory" ${text} WHERE courseid = $${n + 1} RETURNING *;`,
          paramList
        );

        if (!(resPrefix.rows.length > 0)) {
          log.debug(
            `Problem updating course category with id ${id} in the database with the data ${JSON.stringify(
              resultCourse
            )}`
          );
          throw HttpError(500, 'Unexpected DB condition'); // New
        } else {
          changeFlag = true
        }
      } else {
        throw HttpError(400, 'Invalid category prefix');
      }
    }

    // If wanting to change the semester type/year
    if (resultCourse.year && resultCourse.type) {
      const {
        text,
        params
      } = whereParams({
        type: resultCourse.type,
        year: resultCourse.year
      });

      const newSemester = await db.query(`SELECT * FROM "semester" ${text};`, params);

      if (newSemester.rows[0]) {
        const {
          text,
          params
        } = whereParams({
          courseid: id
        });

        const courseSemester = await db.query(`SELECT * FROM "courseSemester" ${text};`, params);

        if (courseSemester.rows[0]) {
          const {
            text,
            params
          } = updateValues({
            semesterId: newSemester.rows[0].id
          });
          const n = params.length;
          params.push(parseInt(id));

          const resSemester = await db.query(`UPDATE "courseSemester" ${text} WHERE courseid = $${n+1} RETURNING *;`, params);

          if (resSemester.rows.length === 0) {
            log.debug(`Problem updating course semester with id ${id} in the database with the data ${JSON.stringify(resultCourse)}`);
            throw HttpError(500, 'Unexpected DB condition');
          }

          changeFlag = true;
        } else {
          const {
            text,
            params
          } = insertValues({
            courseid: id,
            semesterid: newSemester.rows[0].id
          });

          const resSemester = await db.query(`INSERT INTO "courseSemester" ${text} RETURNING *;`, params);

          if (resSemester.rows.length === 0) {
            log.debug(`Problem updating course semester with id ${id} in the database with the data ${JSON.stringify(resultCourse)}`);
            throw HttpError(500, 'Unexpected DB condition');
          }

          changeFlag = true;
        }
      } else {
        throw HttpError(404, `Semester with the specifications ${JSON.stringify({type: resultCourse.type, year: resultCourse.year})}`);
      }
    }

    // THEN update the rest (name, section, credits)
    // Check if any are null, if all are null then you should skip this part and only submit the prefix IF a prefix was submitted (prefix flag)
    if (
      !(resultCourse.name == null) ||
      !(resultCourse.section == null) ||
      !(resultCourse.credits == null)
    ) {
      const newCourseJSON = {};

      if (!(resultCourse.name == null)) newCourseJSON.name = resultCourse.name;

      if (!(resultCourse.section == null)) newCourseJSON.section = resultCourse.section;

      if (!(resultCourse.credits == null)) newCourseJSON.credits = resultCourse.credits;

      const { text, params } = updateValues(newCourseJSON);

      const n = params.length;
      const paramList = [];
      params.forEach((x) => {
        paramList.push(x);
      });

      paramList.push(id);

      const res = await db.query(
        `UPDATE "course" ${text} WHERE id = $${n + 1} RETURNING *;`,
        paramList
      );

      // Return values if successful
      if (res.rows.length > 0) {
        log.debug(
          `Successfully updated course with id ${id} in the database with the data ${JSON.stringify(
            resultCourse
          )}`
        );
        // Return all course info AND category prefix
        const result = await db.query(`SELECT c.id, c.name, c.credits, c.section, ca.prefix FROM "course" AS c ` +
          `INNER JOIN "courseCategory" AS cc ON cc.courseid = c.id ` +
          `INNER JOIN "category" AS ca ON ca.id = cc.categoryid ` +
          `INNER JOIN "courseSemester" AS cs ON cs.courseId = c.id ` +
          `INNER JOIN "semester" AS s ON s.id = cs.semesterId ` +
          `WHERE c.id = ${id} LIMIT 1;`);
        return result.rows[0];
      } // If not, throw error
      throw HttpError(500, 'Unexpected DB condition, update successful with no returned record');
    }

    // If a prefix (flag) was submitted but nothing else
    if (changeFlag) {
      // Return all data about course (we already sent the category in)
      const res = await db.query(`SELECT c.*, s.type, s.year, ca.prefix, ca.name AS "categoryName" from "course" AS c ` +
        `LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id ` +
        `LEFT JOIN "semester" AS s ON s.id = cs.semesterId ` +
        `LEFT JOIN "courseCategory" AS cc ON cc.courseId = c.id ` +
        `LEFT JOIN "category" AS ca ON ca.id = cc.categoryId ` +
        `WHERE c.id = ${id} LIMIT 1;`);
      return res.rows[0];
    } else {
      throw HttpError(400, 'Course attributes required');
    }
  } else {
    // If missing parameters, throw error
    throw HttpError(400, 'Id and a course attribute required');
  }
}

module.exports = {
  createCourse,
  deleteCourse,
  findOne,
  findAll,
  findCoursesInCategory,
  editCourse,
};
