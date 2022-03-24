const log = require('loglevel');
// const request = require('supertest');
// const app = require('../app')();
const Course = require('../models/Course');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/Courses.js', () => {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
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

// a helper that creates an array structure for getUserById
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

describe('GET /courses', () => {
  beforeEach(() => {
    Course.create.mockReset();
    Course.create.mockResolvedValue(null);
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    Course.findAll.mockReset();
    Course.findAll.mockResolvedValue(null);
  });

  // helper functions - id is a numeric value
  async function callGetOnCourseRoute(row, key = 'id') {
    const id = row[key];
    Course.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/courses/${id}`);
    return response;
  }
  
});
