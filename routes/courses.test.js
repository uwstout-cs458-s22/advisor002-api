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
    findOne: jest.fn(),
    deleteCourse: jest.fn(),
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
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
  });

  test('Parameters missing', async () =>  {
    const response = await request(app).delete('/courses').send({});
    expect(response.statusCode).toBe(400);
  });

  test('Cannot find locals.userId', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      courseId: `505`,
      name: `course name`,
      credits: 3})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(403);
  });

  test('User should not be allowed to delete course', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      courseId: `505`,
      name: `course name`,
      credits: 3})
    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'user'})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(403);
  });

  test('Admin should not be allowed to delete course', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      courseId: `505`,
      name: `course name`,
      credits: 3})

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'admin'})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(403);
  });

  test('Director should be allowed to delete course', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      courseId: `505`,
      name: `course name`,
      credits: 3})

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'director'})

    Course.deleteCourse.mockResolvedValueOnce(`Successfully deleted course from db`);

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(200);
  });

  test('Course should not be empty', async () =>  {
    Course.findOne.mockResolvedValueOnce({})

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'director'})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(404);
  });

});


describe('POST /courses', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
  });

  test('Parameters missing', async () =>  {
    const response = await request(app).post('/courses').send({});
    expect(response.statusCode).toBe(400);
  });

  test('User should not be allowed to create course', async () =>  {
    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'user'})

    const response = await request(app).post('/courses').send({ id: 12345,
      section: 505,
      name: `course name`,
      credits: 3});
    expect(response.statusCode).toBe(403);
  });

  test('Admin should not be allowed to create course', async () =>  {

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'admin'})

    const response = await request(app).post('/courses').send({ id: 12345,
      section: 505,
      name: `course name`,
      credits: 3});
    expect(response.statusCode).toBe(403);
  });

  test('Director should be allowed to delete course', async () =>  {

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'director'})

    Course.deleteCourse.mockResolvedValueOnce(`Successfully deleted course from db`);

    const response = await request(app).post('/courses').send({ id: 12345,
      section: 505,
      name: `course name`,
      credits: 3});
    expect(response.statusCode).toBe(201);
  });
});