const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const userCourse = require('../models/userCourse');
// const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});

/* jest.mock('../models/Course.js', () => {
    return {
        findOneCourse: jest.fn(),
        findAllCourses: jest.fn(),
        remove: jest.fn(),
        create: jest.fn()
    };
  }); */



  jest.mock('../services/environment', () => {
    return {
      port: 3001,
      stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
      stytchSecret: 'secret-test-111111111111',
      masterAdminEmail: 'master@gmail.com'
    };
  });

  jest.mock('../models/userCourse.js', () => {
    return {
      viewAllCoursesFuture: jest.fn(),
      viewAllCoursesTaken: jest.fn(),
      findAllCourses: jest.fn(),
      update: jest.fn(),
      // update: jest.fn()
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

  function dataForUserCourse(rows, offset = 0) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const value = i + offset;
      data.push({
        taken: `${value}`,
        userId: `${value *110}`,
        courseId: `${value *111}`,
        semesterId: '',
      });
    }
    return data;
  }
/*
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
*/
  describe('GET /courses', () => {
    beforeEach(() => {
      userCourse.create.mockReset();
      userCourse.create.mockResolvedValue(null);
      userCourse.findOne.mockReset();
      userCourse.findOne.mockResolvedValue(null);
      userCourse.findAllCourses.mockReset();
      userCourse.findAllCourses.mockResolvedValue(null);
    });

    describe('querying a group of courses', () => {
        test('should make a call to Course.findAllCourses', async () => {
          const data = dataForUserCourse(10);
          userCourse.findAllCourses.mockResolvedValueOnce(data);
          await request(app).get('/courses');
          expect(userCourse.findAllCourses.mock.calls[0]).toHaveLength(4);
        });
      });


});
  
