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
// use for creating course 
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      courseid: value ,
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
      courseId: 1,
      name: 'test name',
      credits: 4,
    });
  }
  return data;
}

describe('Course Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

    describe('test deleteCourse', () => {
      test('course delete', async () => {
        const data = dataForDeleteCourse(1);
        const row = data[0];
        db.query.mockResolvedValue({ rows: data });
        expect(await Course.deleteCourse(row.courseId)).toBe(`Successfully deleted course from db`);
      });
  
      test('No parameters', async () => {
        db.query.mockResolvedValue({ rows: []});
        await expect(Course.deleteCourse()).rejects.toThrowError('Id is required.');
      });

      test('course delete no response returned', async () => {
        const data = dataForDeleteCourse(1);
        const row = data[0];
        db.query.mockResolvedValue({ rows: []});
        await expect(Course.deleteCourse(row.id)).rejects.toThrowError('Unexpected db condition, delete successful with no returned record');
      });
    });
    // 

    describe('querying all courses', () => {
      test('should make a call to Course.findAll - no criteria, no limits, no offsets', async () => {
        const data = dataForGetCourse(5);
        db.query.mockResolvedValue({ rows: data });
        const users = await Course.findAll();
        expect(db.query.mock.calls).toHaveLength(1);
        expect(db.query.mock.calls[0]).toHaveLength(2);
        expect(db.query.mock.calls[0][0]).toBe('SELECT * from "course"  LIMIT $1 OFFSET $2;');
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
          'SELECT * from "course" WHERE "credits"=$1 LIMIT $2 OFFSET $3;'
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
          'SELECT * from "course" WHERE "credits"=$1 LIMIT $2 OFFSET $3;'
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
          'SELECT * from "course" WHERE "credits"=$1 LIMIT $2 OFFSET $3;'
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
 });
