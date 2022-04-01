const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const User = require('../models/User');
const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/Course.js', () => {
    return {
        findOneCourse: jest.fn(),
        findAllCourses: jest.fn(),
        remove: jest.fn(),
        create: jest.fn()
    };
  });



  jest.mock('../services/environment', () => {
    return {
      port: 3001,
      stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
      stytchSecret: 'secret-test-111111111111',
      masterAdminEmail: 'master@gmail.com'
    };
  });

  jest.mock('../models/User.js', () => {
    return {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      deleteUser: jest.fn(),
      update: jest.fn()
    };
  });
  
  jest.mock('../services/auth', () => {
    return {
      authorizeSession: jest.fn().mockImplementation((req, res, next) => {
        res.locals.userId = 'user-test-thingy';
        return next();
      })
    };
  });

  function dataForGetCourse(rows, offset = 0) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const value = i + offset;
      data.push({
        id: `${value}`,
        courseId: `${value *110}`,
        name: `testcoursename`,
        credits: 3,
      });
    }
    return data;
  }

  describe('GET /courses', () => {
    beforeEach(() => {
      Course.create.mockReset();
      Course.create.mockResolvedValue(null);
      Course.findOne.mockReset();
      Course.findOne.mockResolvedValue(null);
      Course.findAllCourses.mockReset();
      Course.findAllCourses.mockResolvedValue(null);
    });

    describe('querying a group of courses', () => {
        test('should make a call to Course.findAllCourses', async () => {
          const data = dataForGetCourse(10);
          Course.findAllCourses.mockResolvedValueOnce(data);
          await request(app).get('/courses');
          expect(Course.findAllCourses.mock.calls[0]).toHaveLength(4);
          
        });


}
  
