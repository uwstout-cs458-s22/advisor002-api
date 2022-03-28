const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/Course.js', () => {
  return {
    findOne: jest.fn(),
    deleteCourse: jest.fn(),
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

jest.mock('../services/auth', () => {
  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      res.locals.userId = 'user-test-thingy';
      return next();
    })
  };
});

describe('DELETE /courses', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
  });

  test('Parameters missing', async () =>  {
    const response = await request(app).delete('/courses').send();
    expect(response.statusCode).toBe(400);
  });

  // errors because of auth
  // test('Found', async () =>  {
  //   Course.findOne.mockResolvedValueOnce({id: `145`,
  //   courseId: `505`,
  //   name: `course name`,
  //   credits: 3})

  //   const response = await request(app).delete('/courses').send({ id: "145"});
  //   expect(response.statusCode).toBe(200);
  // });
  // test('Program should respond with code 404 if course is empty', async () =>  {
  //   Course.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce({})
  //   const response = await request(app).delete('/courses').send({id: "54"});
  //   expect(response.statusCode).toBe(400);
  // });
});