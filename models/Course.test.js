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
      section: value ,
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
  const data = {
    name: `${name}`,
    credits: 4,
    section: 4,
  };
  return data;
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
      const row = createCourseData('fake course')[0];
      db.query.mockResolvedValue({rows: [row]});
      await Course.createCourse('fake course', 4, 4);
      expect(db.query.mock.calls).toHaveLength(2);
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
        courseId: 5
      };

      db.query.mockResolvedValue({
        rows: data
      });

      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(1);
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
  });
});

 describe('test deleteCourse', () => {
      test('course delete', async () => {
        const data = dataForDeleteCourse(1);
        const row = data[0];
        db.query.mockResolvedValue({ rows: data });
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
        expect(db.query.mock.calls[0][0]).toBe('SELECT * from "course" AS c JOIN "courseSemester" AS cs ON cs.courseId = c.id JOIN "semester" AS s ON s.id = cs.semesterId  LIMIT $1 OFFSET $2;');
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
          'SELECT * from "course" AS c JOIN "courseSemester" AS cs ON cs.courseId = c.id JOIN "semester" AS s ON s.id = cs.semesterId WHERE c."credits"=$1 LIMIT $2 OFFSET $3;'
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
          'SELECT * from "course" AS c JOIN "courseSemester" AS cs ON cs.courseId = c.id JOIN "semester" AS s ON s.id = cs.semesterId WHERE c."credits"=$1 LIMIT $2 OFFSET $3;'
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
          'SELECT * from "course" AS c JOIN "courseSemester" AS cs ON cs.courseId = c.id JOIN "semester" AS s ON s.id = cs.semesterId WHERE c."credits"=$1 LIMIT $2 OFFSET $3;'
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
