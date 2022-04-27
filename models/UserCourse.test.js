// const log = require('loglevel');
// const { db } = require('../services/database');
// const env = require('../services/environment');
// const UserCourse = require('./UserCourse');

// beforeAll(() => {
//   log.disableAll();
// });

// jest.mock('../services/database.js', () => {
//   return {
//     db: {
//       query: jest.fn(),
//     },
//   };
// });

// jest.mock('../services/environment.js', () => {
//   return {
//     masterAdminEmail: 'master@gmail.com',
//   };
// });

// // a helper that creates an array structure for getUserById
// function dataForGetUserCourse() {
//   const data = [];
//   data.push({
//     userId: `1`,
//     courseId: `1`,
//     semesterId: '1',
//     taken: true,
//   });
//   data.push({
//     userId: `1`,
//     courseId: `1`,
//     semesterId: '1',
//     taken: false,
//   });
//   data.push({
//     userId: `1`,
//     courseId: `2`,
//     semesterId: '1',
//     taken: true,
//   });
//   data.push({
//     userId: `1`,
//     courseId: `1`,
//     semesterId: '2',
//     taken: true,
//   });
//   return data;
// }

// function dataForDeleteUserCourse(rows) {
//   const data = [];
//   data.push({
//     userId: `1`,
//     courseId: `1`,
//     semesterId: '1',
//     taken: true,
//   });
//   return data;
// }

// describe('UserCourse Model', () => {
//   beforeEach(() => {
//     db.query.mockReset();
//     db.query.mockResolvedValue(null);
//   });

//   describe('querying a single usercourse by all ids', () => {
//     test('confirm calls to query', async () => {
//       const row = dataForGetUserCourse()[0];
//       db.query.mockResolvedValue({ rows: [row] });
//       await UserCourse.findOne({ userid: row.userId, courseid: row.courseId, semesterid: row.semesterId });
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0][1][0]).toBe(row.id);
//     });

//     test('should return a single course', async () => {
//       const row = dataForGetUserCourse()[0];
//       db.query.mockResolvedValue({ rows: [row] });
//       const userCourse = await UserCourse.findOne({ userid: row.userId, courseid: row.courseId, semesterid: row.semesterId });
//       for (const key in Object.keys(row)) {
//         expect(userCourse).toHaveProperty(key, row[key]);
//       }
//     });

//     test('should return empty for unfound usercourse', async () => {
//       db.query.mockResolvedValue({ rows: [] });
//       const userCourse = await UserCourse.findOne({ userid: 54, courseid: 63, semesterid: 67 });
//       expect(Object.keys(userCourse)).toHaveLength(0);
//     });

//     test('should return null for database error', async () => {
//       db.query.mockRejectedValueOnce(new Error('a testing database error'));
//       await expect(UserCourse.findOne({ userid: 54, courseid: 63, semesterid: 67 })).rejects.toThrowError('a testing database error');
//     });
//   });

//   describe('updating a usercourse', () => {
//     test('UserCourse update with bad input', async () => {
//       await expect(UserCourse.update('bad input')).rejects.toThrowError(
//         'Id and a put document are required'
//       );
//       expect(db.query.mock.calls).toHaveLength(0);
//     });

//     test('User course update with good input', async () => {
//       await expect(UserCourse.update('bad input')).rejects.toThrowError(
//         'Id and a put document are required'
//       );
//       expect(db.query.mock.calls).toHaveLength(0);
//     });

//   });

//   describe('creating a userCourse', () => {
//     test('User.create with "user" role, disabled by default', async () => {
//       const data = dataForGetUser(1);
//       const row = data[0];
//       row.enable = false;
//       db.query.mockResolvedValue({ rows: data });
//       const userCourse = await UserCourse.create(row.userId, row.email);
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
//       expect(db.query.mock.calls[0][1][1]).toBe(row.email);
//       expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
//       expect(db.query.mock.calls[0][1][3]).toBe(row.role);
//       for (const key in Object.keys(row)) {
//         expect(user).toHaveProperty(key, row[key]);
//       }
//     });

//     test('User.create with masterAdmin role', async () => {
//       const data = dataForGetUser(1);
//       const row = data[0];
//       row.enable = true;
//       row.role = 'admin';
//       row.email = env.masterAdminEmail;
//       db.query.mockResolvedValue({ rows: data });
//       const user = await User.create(row.userId, row.email);
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
//       expect(db.query.mock.calls[0][1][1]).toBe(row.email);
//       expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
//       expect(db.query.mock.calls[0][1][3]).toBe(row.role);
//       for (const key in Object.keys(row)) {
//         expect(user).toHaveProperty(key, row[key]);
//       }
//     });

//     test('User.create with unexpected database response', async () => {
//       const data = dataForGetUser(1);
//       const row = data[0];
//       row.role = 'user';
//       row.enable = false;

//       // unexpected response from db
//       db.query.mockResolvedValue({ rows: [] });

//       await expect(User.create(row.userId, row.email)).rejects.toThrowError(
//         'Unexpected DB Condition, insert successful with no returned record'
//       );

//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
//       expect(db.query.mock.calls[0][1][1]).toBe(row.email);
//       expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
//       expect(db.query.mock.calls[0][1][3]).toBe(row.role);
//     });

//     test('User.create with database error', async () => {
//       const data = dataForGetUser(1);
//       const row = data[0];
//       row.role = 'user';
//       row.enable = false;

//       // error thrown during call to db query
//       db.query.mockRejectedValueOnce(new Error('a testing database error'));
//       await expect(User.create(row.userId, row.email)).rejects.toThrowError(
//         'a testing database error'
//       );
//       expect(db.query.mock.calls).toHaveLength(1);
//       expect(db.query.mock.calls[0]).toHaveLength(2);
//       expect(db.query.mock.calls[0][0]).toBe(
//         'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
//       );
//       expect(db.query.mock.calls[0][1]).toHaveLength(4);
//       expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
//       expect(db.query.mock.calls[0][1][1]).toBe(row.email);
//       expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
//       expect(db.query.mock.calls[0][1][3]).toBe(row.role);
//     });

//     test('User.create with bad input', async () => {
//       await expect(User.create('bad input')).rejects.toThrowError('UserId and Email are required.');
//       expect(db.query.mock.calls).toHaveLength(0);
//     });

//     test('User.create with no input', async () => {
//       await expect(User.create()).rejects.toThrowError('UserId and Email are required.');
//       expect(db.query.mock.calls).toHaveLength(0);
//     });
//   });

//   describe('test delete usercourse', () => {
//     test('user deletes themself', async () => {
//       const data = dataForDeleteUser(1);
//       const row = data[0];
//       db.query.mockResolvedValue({ rows: data });
//       expect(await User.deleteUser(row.id)).toBe(`Successfully deleted user from db`);
//     });

//     test('user id or email not found', async () => {
//       await expect(User.deleteUser()).rejects.toThrowError('UserId is required.');
//     });

//     test('user deletes themself but no response returned', async () => {
//       const data = dataForDeleteUser(1);
//       const row = data[0];
//       db.query.mockResolvedValue({ rows: []});
//       await expect(User.deleteUser(row.id, row.email)).rejects.toThrowError('Unexpected db condition, delete successful with no returned record');
//     });
//   });
// });
