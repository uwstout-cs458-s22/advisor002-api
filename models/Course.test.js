const log = require('loglevel');
const { db } = require('../services/database');
const Course = require('./Course');

// const env = require('../services/environment');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../services/database.js', () => {
  return {
    db: {
      query: jest.fn(),
    },
  };
});

jest.mock('../services/environment.js', () => {
  return {
    masterAdminEmail: 'master@gmail.com',
  };
});

// // a helper that creates an array structure for getCourseById
// use for creating course 
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      section: value,
      name: `Course-${value}`,
      credits: 3
    });
  }
  return data;
}

// use for testing delete course
function dataForDeleteCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      section: 1,
      name: 'test name',
      credits: 4,
    });
  }
  return data;
}

function createCourseData(name) {
  return {
    id: 1,
    name: `${name}`,
    credits: 4,
    section: 4,
  };
}

describe('Course Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('test deleteCourse', () => {
    // requires create course
    //       test('course delete', async () => {
    //         const data = dataForDeleteCourse(1);
    //         const row = data[0];
    //         db.query.mockResolvedValue({ rows: data });
    //         await Course.create(row.userId, row.email);
    //         expect(await Course.deleteUser(row.userId, row.email)).toBe(`Successfully deleted user from db`);
    //       });

    test('No parameters', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(Course.deleteCourse()).rejects.toThrowError('Id is required.');
    });

    test('course delete no response returned', async () => {
      const data = dataForDeleteCourse(1);
      const row = data[0];
      db.query.mockResolvedValue({ rows: [] });
      await expect(Course.deleteCourse(row.id)).rejects.toThrowError(
        'Unexpected db condition, delete successful with no returned record'
      );
    });
  });

  describe('Creating a Course', () => {

    test('Create course with no input parameters', async () => {
      await expect(Course.createCourse()).rejects.toThrowError('Course name, section, credits, and semester are required');
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('Create course successfully', async () => {
      const row = createCourseData('fake course');
      db.query.mockResolvedValueOnce({rows: []}).mockResolvedValue({rows: [row]});
      await Course.createCourse('fake course', 4, 4);
      expect(db.query.mock.calls).toHaveLength(3);
    });

    test('Create course successfully but no response from database', async () => {
      db.query.mockResolvedValue({rows: []});
      await expect(Course.createCourse('fake course', 4, 4)).rejects.toThrowError('Inserted successfully, without response');
    });

    test('Create course unsuccessfully due to already existing course', async () => {
      const row = createCourseData('fake course');
      db.query.mockResolvedValueOnce({rows: [row]});
      await expect(Course.createCourse('fake course', 4, 4)).rejects.toThrowError(`Course ${row.name} already exists in table "course"`);
    });

    test('Create course with semester successfully', async () => {
      const row = createCourseData('fake course');
      const semester = {id: 1, type: 'spring', year: 2019};
      const returningRow = row;
      returningRow.type = semester.type;
      returningRow.year = semester.year;
      const courseSemester = {semesterid: semester.id, courseid: row.id};
      db.query.mockResolvedValueOnce({rows: []}).mockResolvedValueOnce({rows: [row]}).mockResolvedValueOnce({rows: [semester]}).mockResolvedValueOnce({rows: [courseSemester]}).mockResolvedValueOnce({rows: [returningRow]});
      await Course.createCourse(row.name, row.credits, row.section, semester.type, semester.year);
      expect(db.query.mock.calls).toHaveLength(5);
    });
  });


  describe('Edit a Course', () => {
    test('Edit a course to have new name, credits, courseId', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.name = "OldCourse"
      row.credits = 4
      const putDoc = {
        name: 'NewCourse',
        credits: 4,
        section: 5
      };

      db.query.mockResolvedValue({
        rows: data
      });

      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(2);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        `UPDATE "course" SET name = $1, section = $2, credits = $3 WHERE id = $4 RETURNING *;`
      );
    });

    test('Throw 400 error for no input', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      db.query.mockResolvedValue({ // empty
        rows: []
      });
      await expect(Course.editCourse(row.id)).rejects.toThrowError('Id and a course attribute required');
    });



    test('Throw 500 error for other errors', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.name = "OldCourse"
      row.credits = 4
      const putDoc = {
        name: 'NewCourse',
        credits: 4,
        courseId: 5
      };

      db.query.mockResolvedValue({
        rows: []
      });
      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition, update successful with no returned record');
    });

    test('Edit a course to have new category prefix', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.name = "OldCourse"
      row.credits = 4
      const putDoc = {
        name: 'NewCourse',
        prefix: "CS"
      };

      db.query.mockResolvedValue({
        rows: data
      });

      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(4);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(
        `SELECT id FROM category WHERE prefix='CS';`
      );
      expect(db.query.mock.calls[1]).toHaveLength(2);
      expect(db.query.mock.calls[1][0]).toBe(
        `UPDATE "courseCategory" SET categoryid = $1 WHERE courseid = $2 RETURNING *;`
      );
      expect(db.query.mock.calls[2]).toHaveLength(2);
      expect(db.query.mock.calls[2][0]).toBe(
        `UPDATE "course" SET name = $1 WHERE id = $2 RETURNING *;`
      );
      expect(db.query.mock.calls[3]).toHaveLength(1);
      expect(db.query.mock.calls[3][0]).toBe(
        'SELECT c.id, c.name, c.credits, c.section, ca.prefix FROM "course" AS c INNER JOIN "courseCategory" AS cc ON cc.courseid = c.id INNER JOIN "category" AS ca ON ca.id = cc.categoryid INNER JOIN "courseSemester" AS cs ON cs.courseId = c.id INNER JOIN "semester" AS s ON s.id = cs.semesterId WHERE c.id = 1 LIMIT 1;'
      );

    });

    test('Edit a course to have a new semester', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const semester = {id: 1, type: 'spring', year: 2019};
      const courseSemester = {semesterid: semester.id, courseid: row.id};
      const putDoc = {
        name: 'NewCourse',
        type: semester.type,
        year: semester.year
      }

      db.query.mockResolvedValueOnce({rows: [semester]}).mockResolvedValueOnce({rows: [courseSemester]}).mockResolvedValueOnce({rows: [courseSemester]}).mockResolvedValue({rows: data});

      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(5);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        `SELECT * FROM "semester" WHERE "type"=$1 AND "year"=$2;`
      );
      expect(db.query.mock.calls[1][0]).toBe(
        `SELECT * FROM "courseSemester" WHERE "courseid"=$1;`
      );
      expect(db.query.mock.calls[2]).toHaveLength(2);
      expect(db.query.mock.calls[2][0]).toBe(
        `UPDATE "courseSemester" SET semesterId = $1 WHERE courseid = $2 RETURNING *;`
      );
      expect(db.query.mock.calls[3]).toHaveLength(2);
      expect(db.query.mock.calls[3][0]).toBe(
        'UPDATE "course" SET name = $1 WHERE id = $2 RETURNING *;'
      );
    });

    test('Edit a course to have a new semester when course semester does not exist', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const semester = {id: 1, type: 'spring', year: 2019};
      const courseSemester = {semesterid: semester.id, courseid: row.id};
      const putDoc = {
        name: 'NewCourse',
        type: semester.type,
        year: semester.year
      }

      db.query.mockResolvedValueOnce({rows: [semester]}).mockResolvedValueOnce({rows: []}).mockResolvedValueOnce({rows: [courseSemester]}).mockResolvedValue({rows: data});

      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(5);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        `SELECT * FROM "semester" WHERE "type"=$1 AND "year"=$2;`
      );
      expect(db.query.mock.calls[1][0]).toBe(
        `SELECT * FROM "courseSemester" WHERE "courseid"=$1;`
      );
      expect(db.query.mock.calls[2]).toHaveLength(2);
      expect(db.query.mock.calls[2][0]).toBe(
        `INSERT INTO "courseSemester" ("courseid","semesterid") VALUES ($1,$2) RETURNING *;`
      );
      expect(db.query.mock.calls[3]).toHaveLength(2);
      expect(db.query.mock.calls[3][0]).toBe(
        'UPDATE "course" SET name = $1 WHERE id = $2 RETURNING *;'
      );
    });

    test('Unexpected db condition when updating a course to have a new semester when course semester does not exist', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const semester = {id: 1, type: 'spring', year: 2019};
      const putDoc = {
        name: 'NewCourse',
        type: semester.type,
        year: semester.year
      }

      db.query.mockResolvedValueOnce({rows: [semester]}).mockResolvedValueOnce({rows: []}).mockResolvedValueOnce({rows: []}).mockResolvedValue({rows: data});

      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition');
    });

    test('Unexpected db condition when update course semester', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const semester = {id: 1, type: 'spring', year: 2019};
      const putDoc = {
        name: 'NewCourse',
        type: semester.type,
        year: semester.year
      }

      db.query.mockResolvedValueOnce({rows: [semester]}).mockResolvedValueOnce({rows: [semester]}).mockResolvedValueOnce({rows: []}).mockResolvedValueOnce({rows: []});

      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition');
    });

    test('Throw 404 for semester not found', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const putDoc = {
        name: 'NewCourse',
        year: 2019,
        type: 'spring'
      };
      db.query.mockResolvedValue({rows: []}).mockResolvedValue({rows: []});
      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError(`Semester with the specifications ${JSON.stringify({type: putDoc.type, year: putDoc.year})}`);
    });

    test('Throw 400 for category prefix not found', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const putDoc = {
        name: 'NewCourse',
        prefix: "cs"
      };
      db.query.mockResolvedValue({
        rows: []
      });
      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Invalid category prefix');
    });
  });

  test('Edit a courses category prefix only', async () => {
    const data = dataForGetCourse(1);
    const row = data[0];
    const putDoc = {
      prefix: "CS"
    };
    db.query.mockResolvedValue({
      rows: data
    });
    await Course.editCourse(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(3);
    expect(db.query.mock.calls[0]).toHaveLength(1);
    expect(db.query.mock.calls[0][0]).toBe(
      `SELECT id FROM category WHERE prefix='CS';`
    );
    expect(db.query.mock.calls[1]).toHaveLength(2);
    expect(db.query.mock.calls[1][0]).toBe(
      `UPDATE "courseCategory" SET categoryid = $1 WHERE courseid = $2 RETURNING *;`
    );
    expect(db.query.mock.calls[2]).toHaveLength(1);
    expect(db.query.mock.calls[2][0]).toBe(
      'SELECT c.*, s.type, s.year, ca.prefix, ca.name AS "categoryName" from "course" AS c LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id LEFT JOIN "semester" AS s ON s.id = cs.semesterId LEFT JOIN "courseCategory" AS cc ON cc.courseId = c.id LEFT JOIN "category" AS ca ON ca.id = cc.categoryId WHERE c.id = 1 LIMIT 1;'

    );
  });

  test('Throw 400 for no attributes provided', async () => {
    const data = dataForGetCourse(1);
    const row = data[0];
    const putDoc = {};
    db.query.mockResolvedValue({
      rows: data
    });
    await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Course attributes required');
  });

  test('Throw 500 for other DB error', async () => {
    const data = dataForGetCourse(1);
    const row = data[0];
    const putDoc = {
      prefix: "CS"
    };
    db.query.mockResolvedValueOnce({
      rows: data
    })
    db.query.mockResolvedValueOnce({
      rows: []
    })

    await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition');
  });

}); 

describe('test deleteCourse', () => {
  test('course delete', async () => {
    const data = dataForDeleteCourse(1);
    const row = data[0];
    db.query.mockResolvedValue({
      rows: data
    });
    expect(await Course.deleteCourse(row.section)).toBe(`Successfully deleted course from db`);
  });

  test('No parameters', async () => {
    db.query.mockResolvedValue({
      rows: []
    });
    await expect(Course.deleteCourse()).rejects.toThrowError('Id is required.');
  });

  test('course delete no response returned', async () => {
    const data = dataForDeleteCourse(1);
    const row = data[0];
    db.query.mockResolvedValue({
      rows: []
    });
    await expect(Course.deleteCourse(row.id)).rejects.toThrowError('Unexpected db condition, delete successful with no returned record');
  });
});

describe('querying all courses', () => {

  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });
  
      test('should make a call to Course.findAll - no criteria, no limits, no offsets', async () => {
        const data = dataForGetCourse(5);
        db.query.mockResolvedValue({ rows: data });
        const users = await Course.findAll();
        expect(db.query.mock.calls).toHaveLength(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          'SELECT c.*, s.type, s.year, ca.prefix, ca.name AS "categoryName" from "course" AS c LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id LEFT JOIN "semester" AS s ON s.id = cs.semesterId LEFT JOIN "courseCategory" AS cc ON cc.courseId = c.id LEFT JOIN "category" AS ca ON ca.id = cc.categoryId  LIMIT $1 OFFSET $2;'
          );
        expect(db.query.mock.calls[0][1]).toHaveLength(2);
        expect(db.query.mock.calls[0][1][0]).toBe(100);
        expect(db.query.mock.calls[0][1][1]).toBe(0);
        expect(users).toHaveLength(data.length);
        for (let i = 0; i < data.length; i++) {
          for (const key in Object.keys(data[i])) {
            expect(users[i]).toHaveProperty(key, data[i][key]);
          }
        }
      });
  
      test('should make a call to Course.findAll - with criteria, no limits, no offsets', async () => {
        const data = dataForGetCourse(5);
        db.query.mockResolvedValue({ rows: data });
        const users = await Course.findAll({ credits: 3}, undefined);
        expect(db.query.mock.calls).toHaveLength(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          'SELECT c.*, s.type, s.year, ca.prefix, ca.name AS "categoryName" from "course" AS c LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id LEFT JOIN "semester" AS s ON s.id = cs.semesterId LEFT JOIN "courseCategory" AS cc ON cc.courseId = c.id LEFT JOIN "category" AS ca ON ca.id = cc.categoryId WHERE c."credits"=$1 LIMIT $2 OFFSET $3;'
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe(3);
        expect(db.query.mock.calls[0][1][1]).toBe(100);
        expect(db.query.mock.calls[0][1][2]).toBe(0);
        expect(users).toHaveLength(data.length);
        for (let i = 0; i < data.length; i++) {
          for (const key in Object.keys(data[i])) {
            expect(users[i]).toHaveProperty(key, data[i][key]);
          }
        }
      });
  
      test('should make a call to Course.findAll - with criteria, with limits, no offsets', async () => {
        const data = dataForGetCourse(3);
        db.query.mockResolvedValue({ rows: data });
        const courses = await Course.findAll({credits: 3}, 3);
        expect(db.query.mock.calls).toHaveLength(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          'SELECT c.*, s.type, s.year, ca.prefix, ca.name AS "categoryName" from "course" AS c LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id LEFT JOIN "semester" AS s ON s.id = cs.semesterId LEFT JOIN "courseCategory" AS cc ON cc.courseId = c.id LEFT JOIN "category" AS ca ON ca.id = cc.categoryId WHERE c."credits"=$1 LIMIT $2 OFFSET $3;'
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe(3);
        expect(db.query.mock.calls[0][1][1]).toBe(3);
        expect(db.query.mock.calls[0][1][2]).toBe(0);
        expect(courses).toHaveLength(data.length);
        for (let i = 0; i < data.length; i++) {
          for (const key in Object.keys(data[i])) {
            expect(courses[i]).toHaveProperty(key, data[i][key]);
          }
        }
      });
  
      test('should make a call to Course.findAll - with criteria, with limits, with offsets', async () => {
        const data = dataForGetCourse(3, 1);
        db.query.mockResolvedValue({ rows: data });
        const courses = await Course.findAll({credits: 3 }, 3, 1);
        expect(db.query.mock.calls).toHaveLength(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe(
          'SELECT c.*, s.type, s.year, ca.prefix, ca.name AS "categoryName" from "course" AS c LEFT JOIN "courseSemester" AS cs ON cs.courseId = c.id LEFT JOIN "semester" AS s ON s.id = cs.semesterId LEFT JOIN "courseCategory" AS cc ON cc.courseId = c.id LEFT JOIN "category" AS ca ON ca.id = cc.categoryId WHERE c."credits"=$1 LIMIT $2 OFFSET $3;'
        );
        expect(db.query.mock.calls[0][1]).toHaveLength(3);
        expect(db.query.mock.calls[0][1][0]).toBe(3);
        expect(db.query.mock.calls[0][1][1]).toBe(3);
        expect(db.query.mock.calls[0][1][2]).toBe(1);
        expect(courses).toHaveLength(data.length);
        for (let i = 0; i < data.length; i++) {
          for (const key in Object.keys(data[i])) {
            expect(courses[i]).toHaveProperty(key, data[i][key]);
          }
        }
      });
  
      test('should return null for database error', async () => {
        db.query.mockRejectedValueOnce(new Error('a testing database error'));
        await expect(Course.findAll()).rejects.toThrowError('a testing database error');
      });
 });

 describe('querying on category id', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

    test('Return {} when nothing is returned from query', async () => {
        db.query.mockResolvedValue({
          rows: []
        });
        const res = await Course.findCoursesInCategory('1');
        const emp = {};
        expect(res).toStrictEqual(emp);
      });

    test('Return rows when query is returned', async () => {
        const rows = [{
          "id": 1,
          "section": 458,
          "name": "computer science",
          "credits": 4,
          "courseid": 1,
          "categoryid": 1,
          "prefix": "CS"
      }];

      db.query.mockResolvedValue({
        rows: rows
      });
      const res = await Course.findCoursesInCategory('1');

      expect(res).toBe(rows);
    });
 });
