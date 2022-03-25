const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Course = require('../models/Course');
const User = require('../models/User');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/Course.js', () => {
  return {
    findOneCourse: jest.fn(),
    // findAll: jest.fn(),
    // create: jest.fn(),
    editCourse: jest.fn()

  };
});

jest.mock('../models/User.js', () => {
  return {
    findOne: jest.fn()
  };
});

jest.mock('../services/environment', () => {
  return {
    port: 3001,
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    masterAdminEmail: 'master@gmail.com',
  };
});

jest.mock('../services/auth', () => {
  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      return next();
    }),
  };
});


// a helper that creates an array structure for getCourseById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      name: 'courseTest',
      courseId: `${value}`,
      credits: `${value}`
    });
  }
  return data;
}


describe('PUT /courses', () => {
  beforeEach(() => {
    Course.findOneCourse.mockReset();
    Course.findOneCourse.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    Course.editCourse.mockReset();
    Course.editCourse.mockResolvedValue(null);
  });


  // Skipping all tests for create, find, etc.


  describe('Given id', () => {
    test('Testing calling Course.findOneCourse and Course.editCourse', async () => {

      const data = dataForGetCourse(1);
      const row = data[0];

      const newCourseParams = {
        name: 'TestClass',
        courseId: 5,
        credits: 4
      };

      const resultCourseParams = {
        id: row.id,
        name: 'TestClass',
        courseId: 5,
        credits: 4
      };

      Course.findOneCourse.mockResolvedValueOnce({
        id: row.id,
        name: row.name,
        courseId: row.courseId,
        credits: row.credits
      })
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })

      Course.editCourse.mockResolvedValueOnce({
        resultCourseParams
      });

      const response = await request(app).put(`/courses/${row.id}`).send(newCourseParams);
      expect(response.statusCode).toBe(200);
    });

    test('Return course ID in JSON', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];

      const newCourseParams = {
        name: 'TestClass',
        courseId: 5,
        credits: 4
      };

      const resultCourseParams = {
        id: row.id,
        name: 'TestClass',
        courseId: 5,
        credits: 4
      };

      Course.findOneCourse.mockResolvedValueOnce({
        id: row.id,
        name: row.name,
        courseId: row.courseId,
        credits: row.credits
      })
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })

      Course.editCourse.mockResolvedValueOnce({
        resultCourseParams
      });

      const {
        body: course
      } = await request(app).put(`/courses/${row.id}`).send(newCourseParams);
      expect(course.id).toBe(newCourseParams.id);
    });

    test('Throw 500 error for extra errors', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const requestParams = {
        email: 'Dummy@Data.com',
        name: 'DummyCourseData'
      };
      Course.findOneCourse.mockResolvedValueOnce({
        row: row
      });
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })
      Course.editCourse.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app).put(`/courses/${row.id}`).send(requestParams);
      expect(response.statusCode).toBe(500);
    });

    test('Throw 404 error course not found', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];

      Course.findOneCourse.mockResolvedValueOnce({});
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })

      const response = await request(app).put(`/courses/${row.id}`).send({
        course: row
      });
      expect(response.statusCode).toBe(404);
    });

    test('Throw 400 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      Course.findOneCourse.mockResolvedValueOnce({
        row: row
      });

      const response = await request(app).put(`/courses/${row.id}`).send({})

      expect(response.statusCode).toBe(400);
    });

    test('Throw 403 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];

      const newCourseParams = {
        courseId: 'TestClass546',
        name: 'TestClass',
        credits: 4
      };

      Course.findOneCourse.mockResolvedValueOnce({
        courseId: 'TestClass123',
        name: 'TestClass',
        credits: 3
      })
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'user',
        enable: true,
        userId: 'userId'
      })

      const response = await request(app).put(`/courses/${row.id}`).send({
        course: newCourseParams
      });
      expect(response.statusCode).toBe(403);
    });
  });
});