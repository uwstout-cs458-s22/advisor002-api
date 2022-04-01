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
});