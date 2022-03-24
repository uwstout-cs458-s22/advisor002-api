const log = require('loglevel');
const { db } = require('../services/database');
// const env = require('../services/environment');
const Course = require('./Course');

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

// a helper that creates an array structure for getCourseById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      courseId: 1,
      name: 'test',
      credits: 4,
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
      courseId: 1,
      name: 'test name',
      credits: 4,
    });
  }
  return data;
}

// describe('Course Model', () => {
//   beforeEach(() => {
//     db.query.mockReset();
//     db.query.mockResolvedValue(null);
//   });

//   describe('querying a single course by id', () => {
//     test('confirm calls to query', async () => {
//       const row = dataForGetCourse(1)[0];
//       db.query.mockResolvedValue({ rows: [row] });
//       await Course.findOne({ id: row.id });
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0][1][0]).toBe(row.id);
//     });

//     test('should return a single Course', async () => {
//       const row = dataForGetCourse(1)[0];
//       db.query.mockResolvedValue({ rows: [row] });
//       const course = await Course.findOne({ id: row.id });
//       for (const key in Object.keys(row)) {
//         expect(course).toHaveProperty(key, row[key]);
//       }
//     });

//     test('should return empty for unfound course', async () => {
//       db.query.mockResolvedValue({ rows: [] });
//       const course = await Course.findOne({ id: 123 });
//       expect(Object.keys(course)).toHaveLength(0);
//     });

//     test('should return null for database error', async () => {
//       db.query.mockRejectedValueOnce(new Error('a testing database error'));
//       await expect(Course.findOne({ id: 123 })).rejects.toThrowError('a testing database error');
//     });
//   });

//   describe('querying groups of courses', () => {
//     test('should make a call to Course.findAll - no criteria, no limits, no offsets', async () => {
//       const data = dataForGetCourse(5);
//       db.query.mockResolvedValue({ rows: data });
//       const courses = await Course.findAll();
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe('SELECT * from "course"  LIMIT $1 OFFSET $2;');
//       expect(db.query.mock.calls[0][1]).toHaveLength(2);
//       expect(db.query.mock.calls[0][1][0]).toBe(100);
//       expect(db.query.mock.calls[0][1][1]).toBe(0);
//       expect(courses).toHaveLength(data.length);
//       for (let i = 0; i < data.length; i++) {
//         for (const key in Object.keys(data[i])) {
//           expect(courses[i]).toHaveProperty(key, data[i][key]);
//         }
//       }
//     });

//     test('should make a call to Course.findAll - with criteria, no limits, no offsets', async () => {
//       const data = dataForGetCourse(5);
//       db.query.mockResolvedValue({ rows: data });
//       const courses = await Course.findAll({ credits: 4, name: 'test', courseId: 1 }, undefined);
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'SELECT * from "course" WHERE "credits"=$1 AND "name"=$2 AND "courseId"=$3 LIMIT $4 OFFSET $5;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe('course');
//       expect(db.query.mock.calls[0][1][1]).toBe(true);
//       expect(db.query.mock.calls[0][1][2]).toBe(100);
//       expect(db.query.mock.calls[0][1][3]).toBe(0);
//       expect(courses).toHaveLength(data.length);
//       for (let i = 0; i < data.length; i++) {
//         for (const key in Object.keys(data[i])) {
//           expect(courses[i]).toHaveProperty(key, data[i][key]);
//         }
//       }
//     });


//     test('should make a call to Course.findAll - with criteria, with limits, no offsets', async () => {
//       const data = dataForGetCourse(3);
//       db.query.mockResolvedValue({ rows: data });
//       const courses = await Course.findAll({ credits: 4, name: 'test', courseId: 1 }, 3);
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'SELECT * from "course" WHERE "credits"=$1 AND "name"=$2 AND "courseId"=$3 LIMIT $4 OFFSET $5;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe('course');
//       expect(db.query.mock.calls[0][1][1]).toBe(true);
//       expect(db.query.mock.calls[0][1][2]).toBe(3);
//       expect(db.query.mock.calls[0][1][3]).toBe(0);
//       expect(courses).toHaveLength(data.length);
//       for (let i = 0; i < data.length; i++) {
//         for (const key in Object.keys(data[i])) {
//           expect(courses[i]).toHaveProperty(key, data[i][key]);
//         }
//       }
//     });

//     test('should make a call to Course.findAll - with criteria, with limits, with offsets', async () => {
//       const data = dataForGetCourse(3, 1);
//       db.query.mockResolvedValue({ rows: data });
//       const courses = await Course.findAll({ credits: 4, name: 'test', courseId: 1 }, 3, 1);
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'SELECT * from "course" WHERE "credits"=$1 AND "name"=$2 AND "courseId"=$3 LIMIT $4 OFFSET $5;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe('course');
//       expect(db.query.mock.calls[0][1][1]).toBe(true);
//       expect(db.query.mock.calls[0][1][2]).toBe(3);
//       expect(db.query.mock.calls[0][1][3]).toBe(1);
//       expect(courses).toHaveLength(data.length);
//       for (let i = 0; i < data.length; i++) {
//         for (const key in Object.keys(data[i])) {
//           expect(courses[i]).toHaveProperty(key, data[i][key]);
//         }
//       }
//     });

//     test('should return null for database error', async () => {
//       db.query.mockRejectedValueOnce(new Error('a testing database error'));
//       await expect(Course.findAll()).rejects.toThrowError('a testing database error');
//     });
//   });

  // describe('creating a course', () => {
  //   test('Course.create', async () => {
  //     const data = dataForGetCourse(1);
  //     const row = data[0];
  //     db.query.mockResolvedValue({ rows: data });
  //     const course = await Course.create();
  //     expect(db.query.mock.calls).toHaveLength(1);
  //     expect(db.query.mock.calls[0]).toHaveLength(2);
  //     expect(db.query.mock.calls[0][0]).toBe(
  //       'INSERT INTO "course" ("courseId","name","credits") VALUES ($1,$2,$3) RETURNING *;'
  //     );
  //     expect(db.query.mock.calls[0][1]).toHaveLength(4);
  //     expect(db.query.mock.calls[0][1][0]).toBe(row.courseId);
  //     expect(db.query.mock.calls[0][1][1]).toBe(row.name);
  //     expect(db.query.mock.calls[0][1][2]).toBe(row.credits);
  //     for (const key in Object.keys(row)) {
  //       expect(course).toHaveProperty(key, row[key]);
  //     }
  //   });

    // test('Course.create with unexpected database response', async () => {
    //   const data = dataForGetCourse(1);
    //   const row = data[0];
    //   row.courseId = 1;
    //   row.name = "test2";

    //   // unexpected response from db
    //   db.query.mockResolvedValue({ rows: [] });

    //   await expect(Course.create(row.userId, row.email)).rejects.toThrowError(
    //     'Unexpected DB Condition, insert sucessful with no returned record'
    //   );

    //   expect(db.query.mock.calls).toHaveLength(1);
    //   expect(db.query.mock.calls[0]).toHaveLength(2);
    //   expect(db.query.mock.calls[0][0]).toBe(
    //     'INSERT INTO "course" ("courseId","name","credits") VALUES ($1,$2,$3) RETURNING *;'
    //   );
    //   expect(db.query.mock.calls[0][1]).toHaveLength(4);
    //   expect(db.query.mock.calls[0][1][0]).toBe(row.courseId);
    //   expect(db.query.mock.calls[0][1][1]).toBe(row.name);
    //   expect(db.query.mock.calls[0][1][2]).toBe(row.credits);
    // });

    // test('Course.create with database error', async () => {
    //   const data = dataForGetCourse(1);
    //   const row = data[0];
    //   row.courseId = 1;
    //   row.name = "test2";

    //   // error thrown during call to db query
    //   db.query.mockRejectedValueOnce(new Error('a testing database error'));
    //   await expect(Course.create(row.userId, row.email)).rejects.toThrowError(
    //     'a testing database error'
    //   );
    //   expect(db.query.mock.calls).toHaveLength(1);
    //   expect(db.query.mock.calls[0]).toHaveLength(2);
    //   expect(db.query.mock.calls[0][0]).toBe(
    //     'INSERT INTO "course" ("courseId","name","credits") VALUES ($1,$2,$3) RETURNING *;'
    //   );
    //   expect(db.query.mock.calls[0][1]).toHaveLength(4);
    //   expect(db.query.mock.calls[0][1][0]).toBe(row.courseId);
    //   expect(db.query.mock.calls[0][1][1]).toBe(row.name);
    //   expect(db.query.mock.calls[0][1][2]).toBe(row.credits);
    // });

    // test('Course.create with no input', async () => {
    //   await expect(Course.create()).rejects.toThrowError('No id');
    //   expect(db.query.mock.calls).toHaveLength(0);
    //  });

    // cant do these tests without course create
//     describe('test deleteCourse', () => {

//       test('course delete', async () => {
//         const data = dataForDeleteCourse(1);
//         const row = data[0];
//         db.query.mockResolvedValue({ rows: data });
//         await Course.create(row.userId, row.email);
//         expect(await Course.deleteUser(row.userId, row.email)).toBe(`Successfully deleted user from db`);
//       });
  
//       test('Id not found', async () => {
//         const data = dataForDeleteCourse(1);
//         const row = data[0];
//         db.query.mockResolvedValue({ rows: data });
//         await Course.create(row.courseId);
//         await expect(Course.deleteUser(row.email)).rejects.toThrowError('Id is required');
//       });
  
//       test('course delete no response returned', async () => {
//         const data = dataForDeleteCourse(1);
//         const row = data[0];
//         db.query.mockResolvedValue({ rows: []});
//         await expect(Course.deleteUser(row.userId, row.email)).rejects.toThrowError('Unexpected db condition, delete successful with no returned record');
//       });
//     });
// });
